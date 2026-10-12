import test from "node:test";
import assert from "node:assert/strict";
import { selectRelevantFiles } from "../services/revisionContext.js";

test("keeps all files for projects that fit within the context budget", () => {
    const files = {
        "/App.js": "export default function App() {}",
        "/components/Header.jsx": "export default function Header() {}",
    };

    assert.deepEqual(selectRelevantFiles("change header", files, 1000), files);
});

test("prioritizes an explicitly mentioned file in a large project", () => {
    const files = {
        "/App.js": "export default function App() { return null; }",
        "/components/CheckoutPanel.jsx": "export default function CheckoutPanel() { return <div>checkout panel</div>; }",
        "/docs/long-notes.txt": "unrelated ".repeat(100),
    };

    const selected = selectRelevantFiles("Update /components/CheckoutPanel.jsx to show a checkout summary", files, 180);
    assert.ok(selected["/components/CheckoutPanel.jsx"]);
    assert.ok(Object.values(selected).reduce((sum, value) => sum + value.length, 0) <= 180);
});

test("includes directly imported local dependencies when budget permits", () => {
    const files = {
        "/App.js": 'import Header from "./components/Header"; export default Header;',
        "/components/Header.jsx": 'import "./Header.css"; export default function Header() { return null; }',
        "/components/Header.css": ".header { color: red; }",
        "/pages/Unrelated.jsx": "x".repeat(400),
        "/docs/notes.txt": "y".repeat(400),
    };

    const selected = selectRelevantFiles("Update /App.js", files, 300);
    assert.ok(selected["/App.js"]);
    assert.ok(selected["/components/Header.jsx"]);
    assert.ok(selected["/components/Header.css"]);
    assert.ok(Object.values(selected).reduce((sum, value) => sum + value.length, 0) <= 300);
});

test("returns a non-empty context for large projects without keyword matches", () => {
    const files = {
        "/components/Alpha.jsx": "a".repeat(100),
        "/components/Beta.jsx": "b".repeat(100),
    };

    const selected = selectRelevantFiles("do something unusual", files, 120);
    assert.ok(Object.keys(selected).length > 0);
    assert.ok(Object.values(selected).reduce((sum, value) => sum + value.length, 0) <= 120);
});
