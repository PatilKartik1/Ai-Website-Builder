import { Project } from "../models/Project.js";
import crypto from "crypto";
import { generateProject } from "../services/ai.js";
import { validateProjectFiles } from "../services/diff.js";
import { saveHistorySnapshot } from "../services/projectHistory.js";

function hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

const MAX_PROMPT_CHARS = 4000;

// POST /api/projects
export async function createProject(req, res) {
    const { prompt } = req.body ?? {};
    if (typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "prompt is required" });
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
        return res.status(413).json({ error: `Prompt must be ${MAX_PROMPT_CHARS} characters or fewer.` });
    }
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.create({
        name: "Planning project...",
        description: prompt.trim(),
        files: {},
        messages: [
            { role: "user", content: prompt.trim() },
            { role: "assistant", content: "Planning project structure..." },
        ],
        version: 0,
        owner: req.user.userId,
        status: "pending",
        filesPlanned: [],
        filesGenerated: [],
        currentFile: null,
        error: null,
    });

    runBackgroundGeneration(project._id.toString(), prompt.trim()).catch((err) => {
        console.error(`[Background AI] Fatal generation error for project ${project._id}:`, err);
    });

    return res.status(201).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: {},
        messages: project.messages,
        version: project.version,
        filesRevision: project.filesRevision ?? 0,
        filesRevision: project.filesRevision ?? 0,
        status: project.status,
        filesPlanned: project.filesPlanned,
        filesGenerated: project.filesGenerated,
        currentFile: project.currentFile,
        error: project.error,
        createdAt: project.createdAt,
    });
}

// Background worker to progressively generate files.
async function runBackgroundGeneration(projectId, prompt) {
    try {
        console.log(`[Background AI] Starting generation for project ${projectId}`);
        // Serialize file persistence because the AI generator may produce files concurrently.
        let fileSaveQueue = Promise.resolve();
        const result = await generateProject(prompt, {
            onPlan: async (plan) => {
                const fileList = plan.files.map((f) => `- \`${f.path}\`: ${f.description}`).join("\n");
                await Project.findByIdAndUpdate(projectId, {
                    name: plan.projectName || "Generated Project",
                    status: "generating",
                    filesPlanned: plan.files,
                    $push: {
                        messages: {
                            role: "assistant",
                            content: `Planned website structure:\n${fileList}`,
                            timestamp: new Date(),
                        },
                    },
                });
            },
            onFileStart: async (path) => {
                await Project.findByIdAndUpdate(projectId, { currentFile: path });
            },
            onFileComplete: (path, code) => {
                fileSaveQueue = fileSaveQueue.catch(() => {}).then(async () => {
                    const project = await Project.findById(projectId);
                    if (!project) return;

                    const candidate = {};
                    for (const [existingPath, entry] of Object.entries(project.files || {})) {
                        candidate[existingPath] = entry.content;
                    }
                    candidate[path] = code;
                    const validationError = validateProjectFiles(candidate);
                    if (validationError) throw new Error(validationError);

                    project.files = project.files || {};
                    project.files[path] = { content: code, hash: hashContent(code) };
                    project.filesGenerated = [...(project.filesGenerated || []), path];
                    project.messages.push({
                        role: "assistant",
                        content: `Created file "${path}"`,
                        timestamp: new Date(),
                    });
                    project.currentFile = null;
                    project.markModified("files");
                    await project.save();
                });
                return fileSaveQueue;
            },
        });

        const project = await Project.findById(projectId);
        if (!project) return;

        project.status = "completed";
        project.version = 1;
        project.filesRevision = (project.filesRevision ?? 0) + 1;
        if (result.projectName) project.name = result.projectName;
        project.history = saveHistorySnapshot(
            project.history,
            project.version,
            project.files,
            "Initial generation"
        );
        project.messages.push({
            role: "assistant",
            content: "Website generation complete! You can view and edit the files.",
            timestamp: new Date(),
        });
        await project.save();
    } catch (err) {
        console.error(`[Background AI] Fatal generation error for project ${projectId}:`, err);
        await Project.findByIdAndUpdate(projectId, {
            status: "failed",
            error: "Project generation failed. Please try again.",
            $push: {
                messages: {
                    role: "assistant",
                    content: "Project generation failed. Please try again.",
                    timestamp: new Date(),
                },
            },
        });
    }
}

// GET /api/projects
export async function listProjects(req, res) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const projects = await Project.find(
        { owner: req.user.userId },
        { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 });
    return res.json(projects);
}

// GET /api/projects/:id
export async function getProject(req, res) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files || {})) filesObj[path] = entry.content;

    return res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        filesRevision: project.filesRevision ?? 0,
        status: project.status,
        filesPlanned: project.filesPlanned,
        filesGenerated: project.filesGenerated,
        currentFile: project.currentFile,
        error: project.error,
        history: (project.history || []).map((h) => ({
            version: h.version,
            description: h.description,
            timestamp: h.timestamp,
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    });
}

// DELETE /api/projects/:id
export async function deleteProject(req, res) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const result = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!result) return res.status(404).json({ error: "Project not found" });
    return res.json({ success: true });
}

// PUT /api/projects/:id/files
export async function updateProjectFiles(req, res) {
    const { files, expectedFilesRevision } = req.body ?? {};
    const validationError = validateProjectFiles(files);
    if (validationError) return res.status(400).json({ error: validationError });
    if (!Number.isInteger(expectedFilesRevision) || expectedFilesRevision < 0) {
        return res.status(400).json({ error: "expectedFilesRevision must be a non-negative integer." });
    }
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const ownerFilter = { _id: req.params.id, owner: req.user.userId };
    const existing = await Project.findOne(ownerFilter, { _id: 1, status: 1, filesRevision: 1 });
    if (!existing) return res.status(404).json({ error: "Project not found" });
    if (existing.status !== "completed") {
        return res.status(409).json({ error: "This project is busy. Wait for the current operation to finish before saving files." });
    }

    const newFiles = {};
    for (const [path, content] of Object.entries(files)) {
        newFiles[path] = { content, hash: hashContent(content) };
    }

    // Compare-and-swap: only one writer can save against a given revision.
    // The $exists branch supports documents created before filesRevision existed.
    const revisionFilter = expectedFilesRevision === 0
        ? { $or: [{ filesRevision: 0 }, { filesRevision: { $exists: false } }] }
        : { filesRevision: expectedFilesRevision };
    const project = await Project.findOneAndUpdate(
        { ...ownerFilter, status: "completed", ...revisionFilter },
        { $set: { files: newFiles }, $inc: { filesRevision: 1 } },
        { new: true, runValidators: true }
    );

    if (!project) {
        return res.status(409).json({
            error: "These files are based on an outdated project revision. Reload the project before saving again.",
            code: "STALE_FILES_REVISION",
        });
    }

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files || {})) filesObj[path] = entry.content;

    return res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        filesRevision: project.filesRevision,
        messages: project.messages,
        version: project.version,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    });
}

// POST /api/projects/:id/publish
export async function publishProject(req, res) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.userId },
        { published: true },
        { returnDocument: "after" }
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.json({ success: true, published: project.published });
}

// GET /api/projects/public/:id
export async function getPublicProject(req, res) {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!project.published) return res.status(403).json({ error: "Project is not published yet" });

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files || {})) filesObj[path] = entry.content;

    return res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        version: project.version,
    });
}

// POST /api/projects/:id/rollback
export async function rollbackProject(req, res) {
    const { targetVersion } = req.body ?? {};
    if (!Number.isInteger(targetVersion) || targetVersion < 1) {
        return res.status(400).json({ error: "targetVersion must be a positive integer." });
    }
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Older documents may contain duplicate labels; prefer the most recent snapshot.
    const historyEntry = (project.history || []).filter((h) => h.version === targetVersion).at(-1);
    if (!historyEntry) {
        return res.status(404).json({ error: `Version ${targetVersion} not found in project history.` });
    }

    // Preserve any manual edits made since the last recorded snapshot, then
    // clone the selected snapshot before mutating the history array.
    const restoredFiles = Object.fromEntries(
        Object.entries(historyEntry.files || {}).map(([path, entry]) => [
            path,
            typeof entry === "string" ? entry : { ...entry },
        ])
    );
    project.history = saveHistorySnapshot(
        project.history,
        project.version,
        project.files,
        `Snapshot before rollback to v${targetVersion}`
    );

    project.files = restoredFiles;
    project.markModified("files");
    project.version += 1;
    project.filesRevision = (project.filesRevision ?? 0) + 1;
    project.history = saveHistorySnapshot(
        project.history,
        project.version,
        project.files,
        `Restored from v${targetVersion}`
    );
    project.messages.push({
        role: "assistant",
        content: `Restored files from version v${targetVersion}. Project is now at version v${project.version}.`,
        timestamp: new Date(),
    });

    await project.save();

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files || {})) filesObj[path] = entry.content;

    return res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        filesRevision: project.filesRevision ?? 0,
        status: project.status,
        history: (project.history || []).map((h) => ({
            version: h.version,
            description: h.description,
            timestamp: h.timestamp,
        })),
    });
}
