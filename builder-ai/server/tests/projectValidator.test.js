import test from "node:test";
import assert from "node:assert/strict";
import { validateLocalImports } from "../services/projectValidator.js";

test("accepts relative imports with explicit extensions", () => {
    assert.equal(validateLocalImports({
        "/App.js": 'import Header from "./components/Header.jsx";',
        "/components/Header.jsx": "export default function Header() {}",
    }), null);
});

test("accepts extensionless imports resolved to common extensions", () => {
    assert.equal(validateLocalImports({
        "/App.js": 'import Header from "./components/Header";',
        "/components/Header.jsx": "export default function Header() {}",
    }), null);
});

test("accepts directory index imports", () => {
    assert.equal(validateLocalImports({
        "/App.js": 'import Widget from "./components/Widget";',
        "/components/Widget/index.js": "export default function Widget() {}",
    }), null);
});

test("reports missing local modules but ignores package imports", () => {
    const error = validateLocalImports({
        "/App.js": 'import React from "react";\nimport Missing from "./components/Missing";',
    });

    assert.match(error, /\/App\.js -> \.\/components\/Missing/);
    assert.doesNotMatch(error, /react/);
});

test("validates relative CSS imports", () => {
    assert.equal(validateLocalImports({
        "/styles.css": '@import "./theme.css";',
        "/theme.css": "body { margin: 0; }",
    }), null);

    assert.match(validateLocalImports({
        "/styles.css": '@import "./missing.css";',
    }), /missing\.css/);
});

test("ignores missing imports inside line and block comments", () => {
    assert.equal(validateLocalImports({
        "/App.js": [
            '// import Missing from "./missing.js";',
            '/* export { default } from "./also-missing.js"; */',
            'export default function App() { return null; }',
        ].join("\n"),
    }), null);
});

test("ignores import-like text inside ordinary strings", () => {
    assert.equal(validateLocalImports({
        "/App.js": \`const example = "import Missing from './missing.js'";\`,
    }), null);
});

test("checks side-effect imports and re-exports", () => {
    assert.match(validateLocalImports({
        "/App.js": 'import "./setup.js";\nexport { default } from "./components/Missing.js";',
        "/setup.js": "",
    }), /components\/Missing\.js/);
});

test("supports SCSS imports and TypeScript module extensions", () => {
    assert.equal(validateLocalImports({
        "/App.tsx": 'import Widget from "./Widget";',
        "/Widget.ts": "export default function Widget() {}",
        "/styles.css": '@import "./tokens.scss";',
        "/tokens.scss": "$space: 1rem;",
    }), null);
});
