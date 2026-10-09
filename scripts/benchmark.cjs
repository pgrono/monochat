const { mkdtempSync, mkdirSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");
const executable = require("electron");
mkdirSync(".test-data/benchmarks", { recursive: true });
for (const count of [1, 4, 8]) {
  const directory = mkdtempSync(join(tmpdir(), "monochat-benchmark-"));
  try {
    const env = { ...process.env, MONOCHAT_TEST_DATA: directory, MONOCHAT_BENCH_COUNT: String(count), MONOCHAT_BENCH_OUTPUT: resolve(`.test-data/benchmarks/${count}.json`) };
    delete env.ELECTRON_RUN_AS_NODE;
    const result = spawnSync(executable, [resolve("build/tests/benchmark.js")], { env, stdio: "inherit", timeout: 90000 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Benchmark ${count} failed (${result.status})`);
    console.log(`Recorded ${count} anonymous instances`);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
