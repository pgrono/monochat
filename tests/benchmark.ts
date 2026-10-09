// Anonymous real service pages, disposable sessions. Not part of the packaged application.
import { app, BrowserWindow } from "electron";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { cpus, totalmem, release } from "node:os";
import { Runtime } from "../src/main/runtime.js";
import { Accounts } from "../src/main/lifecycle.js";
import { defaultConfig, serviceIds, type RuntimeState } from "../src/shared/model.js";
const directory = process.env.MONOCHAT_TEST_DATA;
const output = process.env.MONOCHAT_BENCH_OUTPUT;
const count = Number(process.env.MONOCHAT_BENCH_COUNT);
if (!directory || !output || ![1, 4, 8].includes(count)) throw new Error("Use the benchmark runner");
app.setPath("userData", directory);
app.setName("MonoChat");
app.setDesktopName("io.github.pgrono.monochat.desktop");
app.enableSandbox();
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
void app.whenReady().then(async () => {
  const window = new BrowserWindow({ title: "MonoChat", show: false, width: 1180, height: 800, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
  const states: Record<string, RuntimeState> = {};
  const manager = new Accounts(account => new Runtime(account, window, (id, state) => { states[id] = state; }, () => undefined));
  const config = defaultConfig();
  config.accounts = Array.from({ length: count }, (_, i) => ({ id: randomUUID(), service: serviceIds[i % 4]!, name: `Benchmark ${i + 1}`, enabled: true, order: i, muted: true, notifications: false }));
  await manager.reconcile(config);
  await wait(20000);
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const metrics = app.getAppMetrics();
    samples.push({ processes: metrics.length, workingSetKiB: metrics.reduce((n, p) => n + p.memory.workingSetSize, 0), cpuPercent: metrics.reduce((n, p) => n + p.cpu.percentCPUUsage, 0) });
    await wait(2000);
  }
  writeFileSync(output!, JSON.stringify({ count, electron: process.versions.electron, chromium: process.versions.chrome, platform: process.platform, arch: process.arch, kernel: release(), cpu: cpus()[0]?.model, logicalCPUs: cpus().length, totalMemoryBytes: totalmem(), desktopSession: process.env.XDG_SESSION_TYPE, condition: "Anonymous service start pages; 20s warmup, five samples 2s apart. Sum of process working sets can double-count shared memory. No logged-in messaging workload.", services: config.accounts.map(a => ({ service: a.service, state: states[a.id]?.state ?? "unknown" })), samples }, null, 2));
  await manager.closeAll(); window.destroy(); app.exit(0);
}).catch(error => { console.error(error instanceof Error ? error.message : "Benchmark failed"); app.exit(1); });
