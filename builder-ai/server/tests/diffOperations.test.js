import test from "node:test";
import assert from "node:assert/strict";
import { applyOperations, applyOperationsStrict } from "../services/diff.js";

test("strict operation application throws when any operation fails", () => {
    const original = {
        "/App.js": { content: "export default 1;", hash: "original" },
    };
    const operations = [
        { op: "update", path: "/App.js", search: "export default 1;", replace: "export default 2;" },
        { op: "delete", path: "/Missing.js" },
    ];

    const ordinaryResult = applyOperations(original, operations);
    assert.equal(ordinaryResult.files["/App.js"].content, "export default 2;");
    assert.equal(ordinaryResult.errors.length, 1);

    assert.throws(
        () => applyOperationsStrict(original, operations),
        /not applied completely/
    );

    // The helper never mutates the caller's original file map.
    assert.equal(original["/App.js"].content, "export default 1;");
});

test("strict operation application returns the full result when all operations succeed", () => {
    const result = applyOperationsStrict({
        "/App.js": { content: "export default 1;", hash: "old" },
    }, [
        { op: "update", path: "/App.js", search: "export default 1;", replace: "export default 2;" },
    ]);

    assert.equal(result.errors.length, 0);
    assert.equal(result.files["/App.js"].content, "export default 2;");
});
