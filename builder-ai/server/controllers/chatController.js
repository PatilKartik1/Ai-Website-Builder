import { Project } from "../models/Project.js";
import { repairProjectImports, reviseProject } from "../services/ai.js";
import { applyOperationsStrict, hashContent, validateProjectFiles } from "../services/diff.js";
import { saveHistorySnapshot } from "../services/projectHistory.js";

const MAX_PROMPT_CHARS = 4000;

export function buildManifest(files) {
    return Object.entries(files || {}).map(([path, entry]) => ({
        path,
        hash: entry.hash,
        size: entry.content.length,
    }));
}

// POST /api/projects/:id/chat
export async function chat(req, res) {
    const { prompt } = req.body ?? {};
    if (typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "prompt is required" });
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
        return res.status(413).json({ error: `Prompt must be ${MAX_PROMPT_CHARS} characters or fewer.` });
    }
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.status !== "completed") {
        return res.status(409).json({ error: "Wait for the current project operation to finish before requesting a revision." });
    }

    // Claim the project atomically to prevent two AI revisions starting together.
    const claimed = await Project.findOneAndUpdate(
        { _id: project._id, owner: req.user.userId, status: "completed" },
        {
            $set: { status: "revising" },
            $push: { messages: { role: "user", content: prompt.trim(), timestamp: new Date() } },
        },
        { returnDocument: "after" }
    );
    if (!claimed) {
        return res.status(409).json({ error: "Another operation has already started for this project. Please try again." });
    }

    try {
        const manifest = buildManifest(claimed.files);
        const relevantFiles = {};
        for (const [path, entry] of Object.entries(claimed.files || {})) {
            relevantFiles[path] = entry.content;
        }
        const recentMessages = (claimed.messages || []).slice(-4).map((message) => ({
            role: message.role,
            content: message.content,
        }));

        console.log(
            `[AI] Revising project ${claimed._id}: "${prompt.trim().slice(0, 80)}..." (${manifest.length} files)`
        );

        let result = await reviseProject(prompt.trim(), manifest, relevantFiles, recentMessages);
        let appliedResult;

        try {
            appliedResult = applyOperationsStrict(claimed.files, result.operations);
        } catch (revisionError) {
            // A model-generated search/replace patch can fail even when the file is
            // present in context. Retry once with the exact failure and require full
            // updated contents for affected files instead of another fragile patch.
            const message = revisionError instanceof Error ? revisionError.message : String(revisionError);
            if (!message.includes("search string not found")) throw revisionError;

            const failedPaths = [...message.matchAll(/update (\/[^:]+): search string not found/g)]
                .map((match) => match[1]);
            const uniqueFailedPaths = [...new Set(failedPaths)];
            if (uniqueFailedPaths.length === 0) throw revisionError;

            console.warn(
                `[AI] Retrying revision after search mismatch for: ${uniqueFailedPaths.join(", ")}`
            );
            const retryPrompt = [
                prompt.trim(),
                "",
                "Your previous edit failed because its search text did not match the current file exactly.",
                `Retry only the affected files: ${uniqueFailedPaths.join(", ")}.`,
                "For each affected existing file, return an update operation with the COMPLETE updated file in the content field.",
                "Do not use search/replace for these files. Preserve all unrelated code and apply the requested change.",
            ].join("\n");

            result = await reviseProject(retryPrompt, manifest, relevantFiles, recentMessages);
            appliedResult = applyOperationsStrict(claimed.files, result.operations);
        }

        const { files: updatedFiles, applied, errors } = appliedResult;

        const plainFiles = Object.fromEntries(
            Object.entries(updatedFiles).map(([path, entry]) => [path, entry.content])
        );
        const validationError = validateProjectFiles(plainFiles);
        if (validationError) throw new Error(validationError);
        if (!plainFiles["/App.js"]) {
            throw new Error("AI revision cannot remove the required /App.js entry point.");
        }

        const importValidatedFiles = await repairProjectImports(plainFiles, claimed.description);
        const finalFiles = Object.fromEntries(
            Object.entries(importValidatedFiles).map(([path, content]) => [
                path,
                { content, hash: hashContent(content) },
            ])
        );

        // Record the resulting version as well as preserving one snapshot per
        // version. Revisions no longer create ambiguous duplicate version labels.
        claimed.history = saveHistorySnapshot(
            claimed.history,
            claimed.version,
            claimed.files,
            `Before revision: ${prompt.trim().slice(0, 60)}`
        );

        claimed.files = finalFiles;
        claimed.markModified("files");
        claimed.version += 1;
        claimed.filesRevision = (claimed.filesRevision ?? 0) + 1;
        claimed.history = saveHistorySnapshot(
            claimed.history,
            claimed.version,
            claimed.files,
            result.description || "AI revision"
        );
        claimed.status = "completed";
        claimed.messages.push({
            role: "assistant",
            content: result.description + (errors.length ? `\n\nSome operations failed: ${errors.join(", ")}` : ""),
            timestamp: new Date(),
        });

        await claimed.save();

        const filesObj = {};
        for (const [path, entry] of Object.entries(claimed.files)) filesObj[path] = entry.content;

        return res.json({
            _id: claimed._id,
            name: claimed.name,
            description: claimed.description,
            files: filesObj,
            messages: claimed.messages,
            version: claimed.version,
            filesRevision: claimed.filesRevision ?? 0,
            status: claimed.status,
            applied,
            errors,
            aiDescription: result.description,
            history: (claimed.history || []).map((h) => ({
                version: h.version,
                description: h.description,
                timestamp: h.timestamp,
            })),
        });
    } catch (err) {
        console.error("[AI Revision Error]", err);
        await Project.updateOne(
            { _id: claimed._id, owner: req.user.userId, status: "revising" },
            {
                $set: { status: "completed" },
                $push: {
                    messages: {
                        role: "assistant",
                        content: "The revision failed. Your existing project files were kept unchanged.",
                        timestamp: new Date(),
                    },
                },
            }
        );
        return res.status(500).json({ error: "Failed to process revision request. Your existing files were kept unchanged." });
    }
}
