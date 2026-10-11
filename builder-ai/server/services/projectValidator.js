import path from "node:path";

const JS_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"]);
const RESOLVABLE_EXTENSIONS = [
    ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts",
    ".css", ".json", ".scss", ".sass", ".less",
];

const JS_IMPORT_PATTERN = /\b(?:from\s*|import\s*\(\s*|import\s*)(["'])(\.{1,2}\/[^"'\n]+)\1/g;
const CSS_IMPORT_PATTERN = /@import\s+(?:url\(\s*)?(["'])(\.{1,2}\/[^"'\n)]+)\1/g;

function maskNonCode(source) {
    let output = "";
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let i = 0; i < source.length; i += 1) {
        const char = source[i];
        const next = source[i + 1];

        if (lineComment) {
            if (char === "\n") {
                lineComment = false;
                output += "\n";
            } else output += " ";
            continue;
        }

        if (blockComment) {
            if (char === "*" && next === "/") {
                output += "  ";
                i += 1;
                blockComment = false;
            } else output += char === "\n" ? "\n" : " ";
            continue;
        }

        if (quote) {
            output += char;
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = null;
            continue;
        }

        if (char === "'" || char === '"' || char.charCodeAt(0) === 96) {
            quote = char;
            output += char;
            continue;
        }

        if (char === "/" && next === "/") {
            output += "  ";
            i += 1;
            lineComment = true;
            continue;
        }

        if (char === "/" && next === "*") {
            output += "  ";
            i += 1;
            blockComment = true;
            continue;
        }

        output += char;
    }

    return output;
}

function hasImportTarget(fromPath, specifier, filePaths) {
    const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), cleanSpecifier));
    const candidates = new Set([target]);

    if (!path.posix.extname(target)) {
        for (const extension of RESOLVABLE_EXTENSIONS) candidates.add(target + extension);
        for (const extension of RESOLVABLE_EXTENSIONS) {
            candidates.add(path.posix.join(target, "index" + extension));
        }
    }

    return [...candidates].some((candidate) => filePaths.has(candidate));
}

/**
 * Validate relative imports in JS/TS and CSS files against generated files.
 * Package imports are intentionally ignored.
 */
export function validateLocalImports(files) {
    const filePaths = new Set(Object.keys(files || {}));
    const missing = [];

    for (const [filePath, content] of Object.entries(files || {})) {
        if (typeof content !== "string") continue;

        const extension = path.posix.extname(filePath).toLowerCase();
        const isCss = extension === ".css";
        if (!isCss && !JS_EXTENSIONS.has(extension)) continue;

        const maskedSource = maskNonCode(content);
        const pattern = isCss ? CSS_IMPORT_PATTERN : JS_IMPORT_PATTERN;
        pattern.lastIndex = 0;

        for (const match of content.matchAll(pattern)) {
            // Ignore import-like text that appears inside comments or strings.
            if (maskedSource[match.index] === " ") continue;
            const specifier = match[2];
            if (!hasImportTarget(filePath, specifier, filePaths)) {
                missing.push({ filePath, specifier });
            }
        }
    }

    if (missing.length === 0) return null;
    const details = [...new Set(missing.map(({ filePath, specifier }) => filePath + " -> " + specifier))];
    return "Project contains unresolved local imports: " + details.join("; ");
}
