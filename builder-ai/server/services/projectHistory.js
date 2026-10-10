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
    // Collapse duplicate version labels left by older releases, keeping the
    // latest snapshot for each version before writing the new one.
    const next = [];
    for (const entry of history || []) {
        const existingIndex = next.findIndex((item) => item.version === entry.version);
        if (existingIndex !== -1) next.splice(existingIndex, 1);
        next.push(entry);
    }

    const currentVersionIndex = next.findIndex((entry) => entry.version === version);
    if (currentVersionIndex !== -1) next.splice(currentVersionIndex, 1);

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
