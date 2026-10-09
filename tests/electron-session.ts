// Run in a separate Electron process with disposable userData. No real service traffic.
import { app, BrowserWindow, session } from "electron";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { once } from "node:events";
import { Runtime } from "../src/main/runtime.js";
import { Accounts } from "../src/main/lifecycle.js";
import { defaultConfig, partition, type AccountConfig } from "../src/shared/model.js";
const directory = process.env.MONOCHAT_TEST_DATA;
if (!directory || !process.env.MONOCHAT_TEST_PHASE) throw new Error("Only run through scripts/electron-tests.cjs");
app.setPath("userData", directory);
app.enableSandbox();
const phase = process.env.MONOCHAT_TEST_PHASE;
const ids = ["10000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000002"];
const records: AccountConfig[] = ids.map((id, order) => ({ id, service: "whatsapp", name: `Test ${order}`, enabled: true, muted: false, notifications: false, order }));
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function loaded(runtime: Runtime): Promise<void> {
  for (let i = 0; i < 100; i++) {
    if (!runtime.view.webContents.isLoading() && runtime.view.webContents.getURL().startsWith("https://")) return;
    await wait(50);
  }
  throw new Error("Fixture did not load");
}
void app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true, nodeIntegration: false, contextIsolation: true } });
  for (const id of ids) {
    const ses = session.fromPartition(partition(id));
    await ses.protocol.handle("https", request => new URL(request.url).pathname === "/worker.js"
      ? new Response("self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));", { headers: { "Content-Type": "application/javascript" } })
      : new Response("<!doctype html><title>Controlled MonoChat fixture</title><p>No private data</p><input type=file>", { headers: { "Content-Type": "text/html" } }));
  }
  const manager = new Accounts(a => new Runtime(a, win, () => undefined, () => undefined));
  const config = defaultConfig(); config.accounts = records; config.selected = ids[0]!;
  await manager.reconcile(config);
  const first = manager.live.get(ids[0]!)!, second = manager.live.get(ids[1]!)!;
  await Promise.all([loaded(first), loaded(second)]);
  const a = first.view.webContents, b = second.view.webContents;
  assert.notEqual(a.session, b.session);
  assert.deepEqual(await a.executeJavaScript("[typeof require, typeof process, typeof window.monochat]"), ["undefined", "undefined", "undefined"]);
  if (phase === "write") {
    assert.equal(app.commandLine.hasSwitch("no-sandbox"), false);
    const popupCreated = once(a, "did-create-window");
    await a.executeJavaScript("void window.open('https://web.whatsapp.com/popup')", true);
    const [popup] = await popupCreated as [BrowserWindow];
    if (popup.webContents.isLoading()) await once(popup.webContents, "did-finish-load");
    assert.equal(popup.webContents.session, a.session);
    assert.deepEqual(await popup.webContents.executeJavaScript("[typeof require, typeof window.monochat]"), ["undefined", "undefined"]);
    assert.equal(await a.executeJavaScript("Notification.requestPermission()"), "denied");
    await a.executeJavaScript("navigator.serviceWorker.register('/worker.js').then(()=>navigator.serviceWorker.ready).then(()=>true)");
    assert.ok(Object.keys(a.session.serviceWorkers.getAllRunning()).length > 0);
    await a.session.cookies.set({ url: "https://web.whatsapp.com", name: "account", value: "first", expirationDate: Date.now() / 1000 + 86400 });
    await a.executeJavaScript("localStorage.setItem('account','first')");
    await a.executeJavaScript("new Promise((resolve,reject)=>{const r=indexedDB.open('account',1);r.onupgradeneeded=()=>r.result.createObjectStore('values');r.onsuccess=()=>{const t=r.result.transaction('values','readwrite');t.objectStore('values').put('first','id');t.oncomplete=()=>{r.result.close();resolve(true)};t.onerror=reject};r.onerror=reject})");
    assert.equal((await b.session.cookies.get({ name: "account" })).length, 0);
    assert.equal(await b.executeJavaScript("localStorage.getItem('account')"), null);
    assert.equal(await b.executeJavaScript("indexedDB.databases().then(d=>d.length)"), 0);
    const original = a.id; let navigations = 0; a.on("did-start-navigation", () => { navigations++; });
    manager.select(ids[1]!); manager.select(ids[0]!);
    assert.equal(first.view.webContents.id, original); assert.equal(navigations, 0);
    records[0]!.name = "Renamed"; await manager.reconcile(config); assert.equal(first.view.webContents.id, original);
    records[0]!.enabled = false; await manager.reconcile(config); assert.equal(a.isDestroyed(), true);
    assert.equal(popup.isDestroyed(), true);
    assert.equal(Object.keys(first.session.serviceWorkers.getAllRunning()).length, 0);
    records[0]!.enabled = true; await manager.reconcile(config);
    const recreated = manager.live.get(ids[0]!)!; await loaded(recreated);
    assert.equal(await recreated.view.webContents.executeJavaScript("localStorage.getItem('account')"), "first");
    assert.equal(await recreated.view.webContents.executeJavaScript("navigator.serviceWorker.getRegistrations().then(r=>r.length)"), 0);
    await b.session.cookies.set({ url: "https://web.whatsapp.com", name: "account", value: "second", expirationDate: Date.now() / 1000 + 86400 });
    await b.executeJavaScript("localStorage.setItem('account','second')");
    writeFileSync(join(directory!, "phase.json"), JSON.stringify({ completed: true }));
  } else {
    assert.equal(JSON.parse(readFileSync(join(directory!, "phase.json"), "utf8")).completed, true);
    assert.equal(await a.executeJavaScript("localStorage.getItem('account')"), "first");
    assert.equal((await a.session.cookies.get({ name: "account" }))[0]!.value, "first");
    assert.equal(await a.executeJavaScript("new Promise((resolve,reject)=>{const r=indexedDB.open('account');r.onsuccess=()=>{const q=r.result.transaction('values').objectStore('values').get('id');q.onsuccess=()=>{r.result.close();resolve(q.result)};q.onerror=reject};r.onerror=reject})"), "first");
    records[0]!.enabled = false; await manager.reconcile(config);
    await first.erase();
    assert.equal((await first.session.cookies.get({ name: "account" })).length, 0);
    assert.equal(await b.executeJavaScript("localStorage.getItem('account')"), "second");
    assert.equal((await b.session.cookies.get({ name: "account" }))[0]!.value, "second");
  }
  await manager.closeAll(); win.destroy();
  console.log(`Electron session ${phase}: PASS`); app.exit(0);
}).catch(error => { console.error(error instanceof Error ? error.message : "Test failed"); app.exit(1); });
