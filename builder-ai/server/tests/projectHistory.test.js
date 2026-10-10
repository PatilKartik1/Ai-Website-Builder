import test from "node:test";
import assert from "node:assert/strict";
import { saveHistorySnapshot } from "../services/projectHistory.js";

test("stores only one snapshot for each version", () => {
    const first = saveHistorySnapshot([], 1, { "/App.js": { content: "old", hash: "a" } }, "initial");
    const updated = saveHistorySnapshot(first, 1, { "/App.js": { content: "new", hash: "b" } }, "edited");

    assert.equal(updated.length, 1);
    assert.equal(updated[0].version, 1);
    assert.equal(updated[0].files["/App.js"].content, "new");
});

test("clones file entries so later edits do not mutate history", () => {
    const files = { "/App.js": { content: "before", hash: "a" } };
    const history = saveHistorySnapshot([], 1, files, "initial");
    files["/App.js"].content = "after";

    assert.equal(history[0].files["/App.js"].content, "before");
});

test("keeps recent versions within the entry limit", () => {
    let history = [];
    for (let version = 1; version <= 25; version += 1) {
        history = saveHistorySnapshot(history, version, {
            "/App.js": { content: `version ${version}`, hash: String(version) },
        }, `v${version}`);
    }

    assert.ok(history.length <= 15);
    assert.equal(history.at(-1).version, 25);
    assert.equal(new Set(history.map((entry) => entry.version)).size, history.length);
});
