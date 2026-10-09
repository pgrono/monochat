// Small project-specific AST lint; TypeScript performs strict semantic checking separately.
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
let failed = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!file.endsWith(".ts")) continue;
    const code = fs.readFileSync(file, "utf8");
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    function flag(node, message) { const loc = source.getLineAndCharacterOfPosition(node.getStart(source)); console.error(`${file}:${loc.line + 1} ${message}`); failed++; }
    function visit(node) {
      if (node.kind === ts.SyntaxKind.AnyKeyword) flag(node, "Explicit any is forbidden.");
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ["eval", "Function"].includes(node.expression.text)) flag(node, "Dynamic code execution is forbidden.");
      if (ts.isPropertyAccessExpression(node) && ["innerHTML", "outerHTML", "insertAdjacentHTML"].includes(node.name.text)) flag(node, "Use textContent and DOM creation.");
      if (ts.isPropertyAssignment(node) && ["nodeIntegration", "webSecurity", "sandbox", "contextIsolation"].includes(node.name.getText(source))) {
        const unsafe = node.name.getText(source) === "nodeIntegration" ? ts.SyntaxKind.TrueKeyword : ts.SyntaxKind.FalseKeyword;
        if (node.initializer.kind === unsafe) flag(node, "Unsafe Electron setting.");
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const diag of source.parseDiagnostics) { console.error(file, ts.flattenDiagnosticMessageText(diag.messageText, "\n")); failed++; }
  }
}
walk("src");
if (failed) process.exit(1);
console.log("AST lint passed: syntax, no explicit any, safe DOM, no dynamic code, secure Electron preferences.");
