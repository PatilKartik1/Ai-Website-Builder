const MAX_HISTORY_ENTRIES = 15;
const MAX_HISTORY_BYTES = 4 * 1024 * 1024;

// Store only the current file snapshot for each version. Mixed-schema file entries
// are copied so later edits cannot mutate a historical snapshot by reference.
function cloneFiles(files = {}) {
    return Object.fromEntries(
        Object.entries(files).map(([path, entry]) => [
            path,
            typeof entry === "string" ? entry : { ...entry },
        ])
    );
}

function snapshotSize(snapshot) {
    return Buffer.byteLength(JSON.stringify(snapshot), "utf8");
}

export function saveHistorySnapshot(history, version, files, description = "") {
    const next = (history || []).filter((entry) => entry.version !== version);
    next.push({
        version,
        description,
        files: cloneFiles(files),
        timestamp: new Date(),
    });

    // Keep the most recent snapshots and enforce a byte budget so repeated
    // revisions do not grow a Project document toward MongoDB's 16 MB limit.
    while (next.length > 1 && (
        next.length > MAX_HISTORY_ENTRIES ||
        next.reduce((total, entry) => total + snapshotSize(entry), 0) > MAX_HISTORY_BYTES
    )) {
        next.shift();
    }

    return next;
}
