import path from "node:path";

const JS_IMPORT_PATTERN = /\b(?:from\s*|import\s*\(\s*|import\s*)(["'])(\.{1,2}\/[^"'\n]+)\1/g;
const CSS_IMPORT_PATTERN = /@import\s+(?:url\(\s*)?(["'])(\.{1,2}\/[^"'\n)]+)\1/g;

function hasImportTarget(fromPath, specifier, filePaths) {
    const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), cleanSpecifier));
    const candidates = new Set([target]);

    // Bundlers resolve extensionless local imports and directory index files.
    const extensions = [".js", ".jsx", ".mjs", ".ts", ".tsx", ".css", ".json"];
    if (!path.posix.extname(target)) {
        for (const extension of extensions) candidates.add(target + extension);
        for (const extension of extensions) candidates.add(path.posix.join(target, "index" + extension));
    }

    return [...candidates].some((candidate) => filePaths.has(candidate));
}

/**
 * Check relative JS/JSX/TS/CSS imports against the generated project file set.
 * Package imports (for example "react" or "lucide-react") are intentionally ignored.
 */
export function validateLocalImports(files) {
    const filePaths = new Set(Object.keys(files || {}));
    const missing = [];

    for (const [filePath, content] of Object.entries(files || {})) {
        if (typeof content !== "string") continue;
        const isCss = filePath.endsWith(".css");
        const pattern = isCss ? CSS_IMPORT_PATTERN : JS_IMPORT_PATTERN;
        pattern.lastIndex = 0;

        for (const match of content.matchAll(pattern)) {
            const specifier = match[2];
            if (!hasImportTarget(filePath, specifier, filePaths)) {
                missing.push({ filePath, specifier });
            }
        }
    }

    if (missing.length === 0) return null;
    const details = [...new Set(missing.map(({ filePath, specifier }) => `${filePath} -> ${specifier}`))];
    return `Project contains unresolved local imports: ${details.join("; ")}`;
}
