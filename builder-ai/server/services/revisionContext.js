const MAX_REVISION_CONTEXT_CHARS = 120_000;
const ENTRYPOINTS = new Set(["/App.js", "/App.jsx", "/App.tsx", "/src/App.jsx", "/src/App.tsx", "/index.js", "/index.jsx", "/main.jsx", "/main.tsx", "/styles.css", "/package.json"]);
const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "this", "that", "make", "change", "update",
    "please", "into", "have", "has", "its", "are", "was", "were", "you", "your",
    "site", "website", "project", "page", "file", "component", "code", "should",
    "can", "all", "any", "only", "keep", "same", "more", "less", "some",
]);

function words(value) {
    return String(value || "")
        .toLowerCase()
        .match(/[a-z][a-z0-9_-]{2,}/g) || [];
}

function localImports(content) {
    const imports = [];
    const pattern = /(?:from\s*|import\s*(?:\(\s*)?)(["'])(\.{1,2}\/[^"'\n]+)\1/g;
    for (const match of String(content || "").matchAll(pattern)) imports.push(match[2]);
    return imports;
}

function resolveImport(fromPath, specifier, filePaths) {
    const parts = fromPath.split("/");
    parts.pop();
    for (const segment of specifier.split("/")) {
        if (segment === "." || !segment) continue;
        if (segment === "..") parts.pop();
        else parts.push(segment);
    }
    const target = "/" + parts.filter(Boolean).join("/");
    const candidates = [target];
    if (!/\.[a-z0-9]+$/i.test(target)) {
        for (const ext of [".js", ".jsx", ".ts", ".tsx", ".css", ".json"]) candidates.push(target + ext);
        for (const ext of [".js", ".jsx", ".ts", ".tsx"]) candidates.push(target + "/index" + ext);
    }
    return candidates.find((candidate) => filePaths.has(candidate));
}

/**
 * Select a focused set of source files for a revision prompt. Small projects
 * keep their full context. Large projects prioritize explicit path mentions,
 * entry points, prompt/path keyword matches, and imported dependencies.
 */
export function selectRelevantFiles(prompt, files, maxChars = MAX_REVISION_CONTEXT_CHARS) {
    const entries = Object.entries(files || {}).filter(([, content]) => typeof content === "string");
    const totalChars = entries.reduce((sum, [, content]) => sum + content.length, 0);
    if (totalChars <= maxChars) return Object.fromEntries(entries);

    const filePaths = new Set(entries.map(([path]) => path));
    const promptLower = String(prompt || "").toLowerCase();
    const promptWords = new Set(words(prompt).filter((word) => !STOP_WORDS.has(word)));
    const ranked = entries.map(([path, content], index) => {
        const lowerPath = path.toLowerCase();
        let score = ENTRYPOINTS.has(path) ? 5 : 0;
        if (promptLower.includes(path.toLowerCase())) score += 1000;
        const pathWords = new Set(words(path));
        for (const word of promptWords) {
            if (pathWords.has(word)) score += 12;
        }
        const contentWords = new Set(words(content));
        let overlap = 0;
        for (const word of promptWords) {
            if (contentWords.has(word)) overlap += 1;
        }
        score += Math.min(overlap, 12);
        if (/\.(css|scss|sass|less)$/.test(path) && /\b(style|styling|color|colour|font|spacing|layout|theme|background|border|css|responsive)\b/i.test(prompt)) score += 15;
        if (/\b(delete|remove|rename)\b/i.test(prompt) && promptLower.includes(lowerPath)) score += 50;
        return { path, content, score, index };
    }).sort((a, b) => b.score - a.score || a.index - b.index);

    const selected = new Map();
    let usedChars = 0;
    const add = (entry) => {
        if (!entry || selected.has(entry.path)) return false;
        if (usedChars + entry.content.length > maxChars) return false;
        selected.set(entry.path, entry.content);
        usedChars += entry.content.length;
        return true;
    };

    // Always reserve space for core app/config files when available.
    for (const path of ENTRYPOINTS) {
        const entry = ranked.find((item) => item.path === path);
        if (entry) add(entry);
    }

    for (const entry of ranked) {
        if (entry.score > 0) add(entry);
    }

    // Include directly imported local dependencies for every selected file.
    // Iterate to a fixed point so common component -> helper -> style chains fit.
    let changed = true;
    while (changed) {
        changed = false;
        for (const [fromPath, content] of [...selected.entries()]) {
            for (const specifier of localImports(content)) {
                const target = resolveImport(fromPath, specifier, filePaths);
                const targetEntry = target ? ranked.find((item) => item.path === target) : null;
                if (targetEntry && add(targetEntry)) changed = true;
            }
        }
    }

    // If keyword scoring found nothing useful, include the smallest files that
    // fit rather than sending an empty code context.
    if (selected.size === 0) {
        for (const entry of [...ranked].sort((a, b) => a.content.length - b.content.length)) add(entry);
    }

    return Object.fromEntries(selected);
}

export const MAX_REVISION_CONTEXT_CHARS_LIMIT = MAX_REVISION_CONTEXT_CHARS;
