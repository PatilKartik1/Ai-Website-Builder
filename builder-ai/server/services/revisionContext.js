const MAX_REVISION_CONTEXT_CHARS = 120_000;
const ENTRYPOINTS = new Set(["/App.js", "/App.jsx", "/App.tsx", "/src/App.jsx", "/src/App.tsx", "/index.js", "/index.jsx", "/main.jsx", "/main.tsx", "/styles.css", "/package.json"]);
const PRIMARY_ENTRYPOINTS = ["/App.js", "/App.jsx", "/App.tsx", "/src/App.jsx", "/src/App.tsx", "/index.js", "/index.jsx", "/main.jsx", "/main.tsx"];
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
 * keep their full context. Large projects prioritize explicitly named files,
 * then their dependencies, app entry points, and other prompt-relevant files.
 */
export function selectRelevantFiles(prompt, files, maxChars = MAX_REVISION_CONTEXT_CHARS) {
    const entries = Object.entries(files || {}).filter(([, content]) => typeof content === "string");
    const totalChars = entries.reduce((sum, [, content]) => sum + content.length, 0);
    if (totalChars <= maxChars) return Object.fromEntries(entries);

    const safeMaxChars = Number.isFinite(maxChars) && maxChars > 0
        ? Math.floor(maxChars)
        : MAX_REVISION_CONTEXT_CHARS;
    const filePaths = new Set(entries.map(([path]) => path));
    const promptLower = String(prompt || "").toLowerCase();
    const promptWords = new Set(words(prompt).filter((word) => !STOP_WORDS.has(word)));
    const ranked = entries.map(([path, content], index) => {
        const lowerPath = path.toLowerCase();
        let score = ENTRYPOINTS.has(path) ? 5 : 0;
        const explicitlyMentioned = promptLower.includes(lowerPath);
        if (explicitlyMentioned) score += 1000;
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
        if (/\b(delete|remove|rename)\b/i.test(prompt) && explicitlyMentioned) score += 50;
        return { path, content, score, explicitlyMentioned, index };
    }).sort((a, b) => b.score - a.score || a.index - b.index);

    const byPath = new Map(ranked.map((entry) => [entry.path, entry]));
    const selected = new Map();
    let usedChars = 0;

    const add = (entry) => {
        if (!entry || selected.has(entry.path)) return false;
        if (usedChars + entry.content.length > safeMaxChars) return false;
        selected.set(entry.path, entry.content);
        usedChars += entry.content.length;
        return true;
    };

    // Add a candidate and its import chain together. Doing this before filling
    // the budget with lower-priority files prevents dependencies from being
    // crowded out by unrelated keyword matches.
    const addWithDependencies = (initialEntry) => {
        const queue = [initialEntry];
        const visited = new Set();
        while (queue.length > 0) {
            const entry = queue.shift();
            if (!entry || visited.has(entry.path)) continue;
            visited.add(entry.path);
            add(entry);
            for (const specifier of localImports(entry.content)) {
                const target = resolveImport(entry.path, specifier, filePaths);
                const dependency = target ? byPath.get(target) : null;
                if (dependency && !visited.has(dependency.path) && !selected.has(dependency.path)) {
                    queue.push(dependency);
                }
            }
        }
    };

    // Explicitly named files are the strongest signal and must not be crowded
    // out by generic entrypoint reservations.
    for (const entry of ranked) {
        if (entry.explicitlyMentioned) addWithDependencies(entry);
    }

    // Keep the app's main execution path available where the budget permits.
    for (const path of PRIMARY_ENTRYPOINTS) {
        const entry = byPath.get(path);
        if (entry) addWithDependencies(entry);
    }

    // Include remaining core configuration/style files, then other relevant
    // files in score order, expanding dependencies as each candidate is added.
    for (const path of ENTRYPOINTS) {
        const entry = byPath.get(path);
        if (entry) addWithDependencies(entry);
    }
    for (const entry of ranked) {
        if (entry.score > 0) addWithDependencies(entry);
    }

    // If keyword scoring found nothing useful, include the smallest files that
    // fit rather than sending an empty code context.
    if (selected.size === 0) {
        for (const entry of [...ranked].sort((a, b) => a.content.length - b.content.length)) add(entry);
    }

    return Object.fromEntries(selected);
}

export const MAX_REVISION_CONTEXT_CHARS_LIMIT = MAX_REVISION_CONTEXT_CHARS;
