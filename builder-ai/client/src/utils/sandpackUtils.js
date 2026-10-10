// Detect npm dependencies from static imports, side-effect imports, dynamic imports,
// re-exports, and CommonJS require calls in generated browser code.
const IMPORT_PATTERNS = [
    /\\bfrom\\s*["']([^"']+)["']/g,
    /\\bimport\\s*["']([^"']+)["']/g,
    /\\bimport\\s*\\(\\s*["']([^"']+)["']\\s*\\)/g,
    /\\brequire\\s*\\(\\s*["']([^"']+)["']\\s*\\)/g,
];

const NODE_BUILTINS = new Set([
    "assert", "buffer", "child_process", "crypto", "events", "fs", "http",
    "https", "module", "os", "path", "process", "stream", "url", "util",
    "worker_threads", "zlib",
]);

function getPackageName(specifier) {
    if (
        !specifier ||
        specifier.startsWith(".") ||
        specifier.startsWith("/") ||
        specifier.startsWith("@/") ||
        specifier.startsWith("#") ||
        specifier.startsWith("node:")
    ) {
        return null;
    }

    if (specifier.startsWith("@")) {
        const [scope, name] = specifier.split("/");
        return scope && name ? `${scope}/${name}` : null;
    }

    return specifier.split("/")[0];
}

export function detectDependencies(files) {
    const dependencies = {};
    if (!files || typeof files !== "object") return dependencies;

    const allCode = Object.values(files)
        .map((file) => typeof file === "string" ? file : file?.code ?? file?.content ?? "")
        .filter((code) => typeof code === "string")
        .join("\\n");

    for (const pattern of IMPORT_PATTERNS) {
        pattern.lastIndex = 0;
        for (const match of allCode.matchAll(pattern)) {
            const packageName = getPackageName(match[1]);
            if (
                packageName &&
                packageName !== "react" &&
                packageName !== "react-dom" &&
                !NODE_BUILTINS.has(packageName)
            ) {
                dependencies[packageName] = "latest";
            }
        }
    }

    return dependencies;
}
