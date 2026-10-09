import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { ConfigStore, removePartition } from "../src/main/config.js";
import { Accounts, type AccountRuntime } from "../src/main/lifecycle.js";
import { defaultConfig, effective, partition, validateConfig, validateCommand, type AccountConfig } from "../src/shared/model.js";
import { internalURL, webURL, instagramInbox, attachmentURL, serviceUserAgent } from "../src/services/adapters.js";
const account = (name = "Prywatne"): AccountConfig => ({ id: randomUUID(), service: "whatsapp", name, enabled: true, order: 0, muted: false, notifications: true });
function temporary(fn: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), "monochat-unit-"));
  try { fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}
test("UUID partitions stay stable through rename and differ between accounts", () => {
  const a = account(), b = account(); const before = partition(a.id); a.name = "Firma";
  assert.equal(partition(a.id), before); assert.notEqual(partition(a.id), partition(b.id));
  for (const bad of ["../", "", "company", "../../userData"]) assert.throws(() => partition(bad));
});
test("configuration persists, normalizes order, and recovers from a corrupt primary file", () => temporary(dir => {
  const store = new ConfigStore(dir); const config = defaultConfig(); config.accounts = [account()];
  store.save(config); store.save(config);
  assert.equal(new ConfigStore(dir).value.accounts[0]!.id, config.accounts[0]!.id);
  writeFileSync(join(dir, "config.json"), "broken");
  const recovered = new ConfigStore(dir);
  assert.match(recovered.notice, /Odtworzono/); assert.equal(recovered.value.accounts.length, 1);
  assert.equal(readFileSync(join(dir, "config.json"), "utf8"), "broken");
}));
test("both corrupt files fail closed; future schemas are not downgraded", () => temporary(dir => {
  writeFileSync(join(dir, "config.json"), "broken"); assert.throws(() => new ConfigStore(dir));
  writeFileSync(join(dir, "config.json.bak"), JSON.stringify(defaultConfig()));
  writeFileSync(join(dir, "config.json"), JSON.stringify({ schemaVersion: 99 }));
  assert.throws(() => new ConfigStore(dir), /nowszej/);
}));
test("global service pause preserves individual enabled flags", () => {
  const c = defaultConfig(); const a = account(), b = account(); b.enabled = false; c.accounts = [a, b];
  c.services.whatsapp = false; assert.equal(effective(c, a), false);
  c.services.whatsapp = true; assert.equal(effective(c, a), true); assert.equal(effective(c, b), false);
});
test("deletion journal prevents a stale backup from reopening an account", () => temporary(dir => {
  const store = new ConfigStore(dir); const c = defaultConfig(); const a = account(); c.accounts = [a];
  store.save(c); store.markDeletion(a.id);
  writeFileSync(join(dir, "config.json"), "broken");
  const reopened = new ConfigStore(dir);
  assert.equal(reopened.value.pendingDeletion.includes(a.id), true);
  assert.equal(effective(reopened.value, reopened.value.accounts[0]!), false);
  reopened.finishDeletion(a.id);
  assert.equal(new ConfigStore(dir).value.accounts.length, 0);
  const backup = JSON.parse(readFileSync(join(dir, "config.json.bak"), "utf8"));
  assert.equal(backup.accounts.length, 0);
}));
test("partition removal is limited to one validated UUID and refuses symlinks", () => temporary(dir => {
  const a = account(), b = account();
  for (const item of [a, b]) { const path = join(dir, "Partitions", `account-${item.id}`); mkdirSync(path, { recursive: true }); writeFileSync(join(path, "data"), item.name); }
  removePartition(dir, a.id);
  assert.equal(existsSync(join(dir, "Partitions", `account-${a.id}`)), false);
  assert.equal(existsSync(join(dir, "Partitions", `account-${b.id}`, "data")), true);
  symlinkSync(join(dir, "Partitions", `account-${b.id}`), join(dir, "Partitions", `account-${a.id}`));
  assert.throws(() => removePartition(dir, a.id), /Niebezpieczna/);
  assert.throws(() => removePartition(dir, "../../"));
}));
test("configuration and IPC reject malformed or privileged input", () => {
  for (const value of [null, [], {}, { type: "execute", command: "ls" }, { type: "add", service: "other", name: "x" }, { type: "add", service: "whatsapp", name: " " }, { type: "dialog", open: "true" }, { type: "remove", id: "../../" }]) assert.throws(() => validateCommand(value));
  const c = defaultConfig(), a = account(); c.accounts = [a, { ...a }]; assert.throws(() => validateConfig(c));
  assert.throws(() => validateConfig({ ...defaultConfig(), schemaVersion: 0 }));
  assert.deepEqual(validateCommand({ type: "add", service: "whatsapp", name: " Firma ", partition: "persist:shared" }), { type: "add", service: "whatsapp", name: "Firma" });
});
test("navigation validates exact hosts, schemes, credentials and link shims", () => {
  assert.equal(internalURL("google-messages", "https://accounts.google.com/signin/v2"), true);
  for (const url of ["https://accounts.google.com.evil.example/", "https://accounts.google.com@evil.example/", "http://accounts.google.com/", "https://accounts.google.com:8443/", "file:///etc/passwd", "javascript:alert(1)"]) assert.equal(internalURL("google-messages", url), false);
  assert.equal(internalURL("messenger", "https://www.facebook.com/l.php?u=x"), false);
  assert.equal(webURL("javascript:alert(1)"), null); assert.equal(webURL("https://user:pass@example.com"), null);
  assert.equal(instagramInbox("https://www.instagram.com/"), "https://www.instagram.com/direct/inbox/");
  assert.equal(instagramInbox("https://www.instagram.com/challenge/"), null);
  assert.equal(attachmentURL("whatsapp", "blob:https://web.whatsapp.com/123"), true);
  assert.equal(attachmentURL("whatsapp", "blob:https://web.whatsapp.com.evil.example/123"), false);
  assert.equal(attachmentURL("whatsapp", "blob:null/123"), false);
});
class FakeRuntime implements AccountRuntime {
  visible = false; closes = 0; reloads = 0;
  constructor(public account: AccountConfig) {}
  show(visible: boolean): void { this.visible = visible; }
  update(account: AccountConfig): void { this.account = account; }
  async close(): Promise<void> { this.closes++; }
  reload(): void { this.reloads++; }
  focus(): void {}
}
test("switching and overlays preserve live views; disable closes and re-enable reuses partition", async () => {
  let creations = 0;
  const manager = new Accounts(a => { creations++; return new FakeRuntime(a); });
  const c = defaultConfig(), a = account(), b = account(); c.accounts = [a, b]; c.selected = a.id;
  await manager.reconcile(c); const first = manager.live.get(a.id)!;
  for (let i = 0; i < 20; i++) { manager.select(b.id); manager.select(a.id); }
  assert.equal(creations, 2); assert.equal(first.reloads, 0); assert.equal(manager.live.get(a.id), first);
  manager.overlay = true; manager.layout(); assert.equal(first.visible, false);
  manager.overlay = false; manager.layout(); assert.equal(first.visible, true);
  a.enabled = false; await manager.reconcile(c); assert.equal(first.closes, 1); assert.equal(manager.live.has(a.id), false);
  a.enabled = true; await manager.reconcile(c); assert.equal(creations, 3); assert.equal(partition(manager.live.get(a.id)!.account.id), partition(a.id));
  await manager.closeAll(); assert.equal(manager.live.size, 0);
});
test("failed runtime cleanup keeps its reference and can be retried", async () => {
  let calls = 0;
  const manager = new Accounts(a => { const runtime = new FakeRuntime(a); runtime.close = async () => { if (++calls === 1) throw new Error("cleanup"); }; return runtime; });
  const c = defaultConfig(), a = account(); c.accounts = [a]; await manager.reconcile(c);
  a.enabled = false; await assert.rejects(manager.reconcile(c)); assert.equal(manager.live.size, 1);
  a.enabled = true; await manager.reconcile(c);
  assert.equal(calls, 2); assert.equal(manager.live.size, 1);
});
test("deletion journal is loaded even when both config files are missing", () => temporary(dir => {
  const id = randomUUID();
  writeFileSync(join(dir, "deletions.json"), JSON.stringify([id]));
  assert.deepEqual(new ConfigStore(dir).value.pendingDeletion, [id]);
}));
test("a dangling partition symlink is an error rather than completed deletion", () => temporary(dir => {
  const id = randomUUID(); mkdirSync(join(dir, "Partitions"));
  symlinkSync(join(dir, "missing"), join(dir, "Partitions", `account-${id}`));
  assert.throws(() => removePartition(dir, id), /Niebezpieczna/);
}));


test("older configurations gain new services without changing accounts or flags", () => {
  const c = defaultConfig(); c.accounts = [account()]; c.selected = c.accounts[0]!.id; c.services.whatsapp = false;
  const old = JSON.parse(JSON.stringify(c)); delete old.services.slack; delete old.services.gmail;
  const migrated = validateConfig(old);
  assert.deepEqual(migrated.accounts, validateConfig(c).accounts); assert.equal(migrated.selected, c.selected);
  assert.deepEqual(migrated.services, c.services);
  for (const id of ["slack", "gmail"] as const) {
    const disabled = validateConfig({ ...old, services: { ...old.services, [id]: false } });
    assert.equal(disabled.services[id], false);
    assert.throws(() => validateConfig({ ...old, services: { ...old.services, [id]: "true" } }));
    assert.equal(validateCommand({ type: "add", service: id, name: "Work" }).type, "add");
  }
  delete old.services.whatsapp; assert.throws(() => validateConfig(old));
});
test("Slack workspace and Gmail navigation keep authentication internal and reject lookalikes", () => {
  for (const url of ["https://slack.com/signin", "https://app.slack.com/client/T123", "https://my-team.slack.com/", "https://accounts.google.com/", "https://appleid.apple.com/", "https://login.microsoftonline.com/", "https://login.live.com/"]) assert.equal(internalURL("slack", url), true, url);
  for (const url of ["https://evilslack.com/", "https://team.slack.com.evil.test/", "https://team.slack.com@evil.test/", "https://a.b.slack.com/", "http://team.slack.com/", "https://team.slack.com:8443/", "slack://open", "https://slack.com/link?url=https://evil.test"]) assert.equal(internalURL("slack", url), false, url);
  for (const url of ["https://mail.google.com/mail/u/0/", "https://accounts.google.com/signin", "https://myaccount.google.com/"]) assert.equal(internalURL("gmail", url), true);
  for (const url of ["https://mail.google.com.evil.test/", "https://mail.google.com@evil.test/", "http://mail.google.com/", "https://drive.google.com/", "javascript:alert(1)"]) assert.equal(internalURL("gmail", url), false);
  assert.equal(internalURL("gmail", "https://app.slack.com/"), false);
  assert.equal(attachmentURL("gmail", "blob:https://mail.google.com/123"), true);
  for (const service of ["slack", "gmail"] as const) assert.equal(serviceUserAgent(service, "Chrome/1 Electron/2 MonoChat/3"), "Chrome/1 Electron/2 MonoChat/3");
});
