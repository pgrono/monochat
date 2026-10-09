// UI-only test fixture. Never included in app packages; no service or session simulation.
const fs = require("node:fs");
const ts = require("typescript");
const files = ["src/shared/model.ts", "src/services/adapters.ts", "src/renderer/app.ts"];
const bundle = files.map(file => ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
}).outputText.replace(/^import .*;$/gm, "").replace(/^export /gm, "")).join("\n");
const fixture = `
const fixtureState = { config: defaultConfig(), runtime: {}, trayAvailable: false, notice: '' };
let fixtureCallback;
window.__fixtureCommands = [];
window.monochat = {
  subscribe(fn) { fixtureCallback = fn; return () => {}; },
  shortcut() { return () => {}; },
  async command(c) {
    window.__fixtureCommands.push(c);
    if (c.type === 'add') {
      const id = '10000000-0000-4000-8000-' + String(fixtureState.config.accounts.length + 1).padStart(12,'0');
      fixtureState.config.accounts.push({id,service:c.service,name:c.name,order:fixtureState.config.accounts.length,enabled:true,muted:false,notifications:true});
      fixtureState.config.selected = id;
      fixtureState.runtime[id] = {state:'error', message:'Kontrolowany stan testowy interfejsu — bez połączenia z usługą.'};
    }
    if (c.type === 'select') fixtureState.config.selected = c.id;
    if (c.type === 'service') fixtureState.config.services[c.service] = c.enabled;
    return structuredClone(fixtureState);
  }
};
`;
// Insert fixture after model and adapters but before app initialization.
const insertion = bundle.indexOf('const $ =');
if (insertion < 0) throw new Error("Renderer entry point not found");
const script = bundle.slice(0, insertion) + fixture + bundle.slice(insertion);
module.exports = { html: fs.readFileSync("src/renderer/index.html", "utf8"), css: fs.readFileSync("src/renderer/style.css", "utf8"), script };
if (require.main === module) process.stdout.write(JSON.stringify(module.exports));
