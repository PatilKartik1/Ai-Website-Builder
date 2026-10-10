import crypto from "crypto";

export const MAX_PROJECT_FILES = 100;
export const MAX_FILE_CHARS = 300_000;
export const MAX_TOTAL_FILE_CHARS = 800_000;

export function validateProjectPath(path) {
    if (typeof path !== "string" || path.length < 2 || path.length > 240) return false;
    if (!path.startsWith("/") || path.startsWith("//")) return false;
    if (path.includes("\\") || path.includes("\0") || path.includes("?") || path.includes("#")) return false;

    const segments = path.slice(1).split("/");
    if (segments.some((segment) => !segment || segment === "." || segment === "..")) return false;
    if (segments.some((segment) => segment.toLowerCase() === "node_modules")) return false;
    return true;
}

export function validateProjectFiles(files) {
    if (!files || typeof files !== "object" || Array.isArray(files)) {
        return "files must be an object keyed by project-relative paths.";
    }

    const entries = Object.entries(files);
    if (entries.length > MAX_PROJECT_FILES) {
        return `A project can contain at most ${MAX_PROJECT_FILES} files.`;
    }

    let totalChars = 0;
    for (const [path, content] of entries) {
        if (!validateProjectPath(path)) return `Invalid project file path: ${path}`;
        if (typeof content !== "string") return `File content must be text: ${path}`;
        if (content.length > MAX_FILE_CHARS) {
            return `File ${path} exceeds the ${MAX_FILE_CHARS}-character limit.`;
        }
        totalChars += content.length;
        if (totalChars > MAX_TOTAL_FILE_CHARS) {
            return `Project files exceed the ${MAX_TOTAL_FILE_CHARS}-character total limit.`;
        }
    }

    return null;
}

export function hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

// Apply AI file operations (create, update, delete) to project files.
export function applyOperations(currentFiles, operations) {
    const files = { ...currentFiles };
    const applied = [];
    const errors = [];

    for (const op of operations) {
        try {
            if (!validateProjectPath(op.path)) {
                errors.push(`Invalid project file path: ${String(op.path)}`);
                continue;
            }

            switch (op.op) {
                case "create": {
                    if (typeof op.content !== "string" || !op.content) {
                        errors.push(`create ${op.path}: missing content`);
                        break;
                    }
                    if (op.content.length > MAX_FILE_CHARS) {
                        errors.push(`create ${op.path}: file exceeds size limit`);
                        break;
                    }
                    if (Object.keys(files).length >= MAX_PROJECT_FILES && !files[op.path]) {
                        errors.push(`create ${op.path}: project file limit reached`);
                        break;
                    }
                    files[op.path] = { content: op.content, hash: hashContent(op.content) };
                    applied.push(`created ${op.path}`);
                    break;
                }

                case "update": {
                    const existing = files[op.path];
                    if (!existing) {
                        errors.push(`update ${op.path}: file not found`);
                        break;
                    }
                    if (typeof op.search !== "string" || !op.search || typeof op.replace !== "string") {
                        errors.push(`update ${op.path}: missing search/replace`);
                        break;
                    }

                    const newContent = searchReplace(existing.content, op.search, op.replace);
                    if (newContent === null) {
                        errors.push(`update ${op.path}: search string not found`);
                        break;
                    }
                    if (newContent.length > MAX_FILE_CHARS) {
                        errors.push(`update ${op.path}: file exceeds size limit`);
                        break;
                    }

                    files[op.path] = { content: newContent, hash: hashContent(newContent) };
                    applied.push(`updated ${op.path}`);
                    break;
                }

                case "delete": {
                    if (files[op.path]) {
                        delete files[op.path];
                        applied.push(`deleted ${op.path}`);
                    } else {
                        errors.push(`delete ${op.path}: file not found`);
                    }
                    break;
                }

                default:
                    errors.push(`unknown op: ${op.op}`);
            }
        } catch (err) {
            errors.push(`${op.op} ${op.path}: ${err.message}`);
        }
    }

    const sizeError = validateProjectFiles(
        Object.fromEntries(Object.entries(files).map(([path, entry]) => [path, entry.content]))
    );
    if (sizeError) {
        return { files: { ...currentFiles }, applied: [], errors: [...errors, sizeError] };
    }

    return { files, applied, errors };
}

// Search and replace code with fallback whitespace normalization matching.
function searchReplace(content, search, replace) {
    if (content.includes(search)) {
        return content.replace(search, () => replace);
    }

    const normalizeWs = (s) =>
        s.split("\n").map((line) => line.replace(/\s+/g, " ").trim()).join("\n").trim();

    const normalizedContent = normalizeWs(content);
    const normalizedSearch = normalizeWs(search);

    if (normalizedContent.includes(normalizedSearch)) {
        const searchLines = normalizedSearch.split("\n");
        const contentLines = content.split("\n");

        for (let i = 0; i <= contentLines.length - searchLines.length; i++) {
            let match = true;
            for (let j = 0; j < searchLines.length; j++) {
                if (normalizeWs(contentLines[i + j]) !== searchLines[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return [
                    ...contentLines.slice(0, i),
                    replace,
                    ...contentLines.slice(i + searchLines.length),
                ].join("\n");
            }
        }
    }

    return null;
}
