const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");
const executable = require("electron");
const directory = mkdtempSync(join(tmpdir(), "monochat-electron-"));
try {
  for (const phase of ["write", "read"]) {
    const env = { ...process.env, MONOCHAT_TEST_DATA: directory, MONOCHAT_TEST_PHASE: phase };
    delete env.ELECTRON_RUN_AS_NODE;
    const result = spawnSync(executable, [resolve("build/tests/electron-session.js")], { env, stdio: "inherit", timeout: 90000 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Electron ${phase} failed (${result.status}). Sandbox must remain enabled.`);
  }
} finally { rmSync(directory, { recursive: true, force: true }); }
