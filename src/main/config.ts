import { mkdirSync, readFileSync, renameSync, writeFileSync, openSync, fsyncSync, closeSync, existsSync, lstatSync, realpathSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { defaultConfig, validateConfig, uuid, type Config } from "../shared/model.js";
export function atomicWrite(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const tmp = `${path}.${randomUUID()}.tmp`;
  writeFileSync(tmp, content, { mode: 0o600, flag: "wx" });
  const fd = openSync(tmp, "r");
  try { fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(tmp, path);
  const directory = openSync(dirname(path), "r");
  try { fsyncSync(directory); } finally { closeSync(directory); }
}
export class ConfigStore {
  value: Config;
  notice = "";
  private path: string;
  constructor(readonly directory: string) {
    this.path = join(directory, "config.json");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (!existsSync(this.path) && !existsSync(`${this.path}.bak`)) { this.value = defaultConfig(); }
    else try { this.value = validateConfig(JSON.parse(readFileSync(this.path, "utf8"))); }
    catch {
      // Never overwrite a newer schema with an older backup.
      try {
        const raw = JSON.parse(readFileSync(this.path, "utf8"));
        if (Number.isInteger(raw.schemaVersion) && raw.schemaVersion > 1) throw new Error("NEWER_SCHEMA");
      } catch (error) { if (error instanceof Error && error.message === "NEWER_SCHEMA") throw new Error("Konfiguracja pochodzi z nowszej wersji MonoChat. Zaktualizuj aplikację."); }
      try {
        this.value = validateConfig(JSON.parse(readFileSync(`${this.path}.bak`, "utf8")));
        this.notice = "Odtworzono ostatnią poprawną konfigurację. Dane sesji pozostały na dysku.";
      } catch { throw new Error("Nie można odczytać konfiguracji ani kopii. Zachowano wszystkie dane. Przywróć config.json z kopii przed uruchomieniem."); }
    }
    // A separate journal prevents an old backup from resurrecting a deleted account.
    const journal = join(directory, "deletions.json");
    if (existsSync(journal)) {
      const ids: unknown = JSON.parse(readFileSync(journal, "utf8"));
      if (!Array.isArray(ids)) throw new Error("Uszkodzony dziennik usuwania. Dane zachowano.");
      this.value.pendingDeletion = [...new Set([...this.value.pendingDeletion, ...ids.map(uuid)])];
    }
  }
  save(next: Config): void {
    const valid = validateConfig(next);
    atomicWrite(`${this.path}.bak`, JSON.stringify(this.value, null, 2));
    atomicWrite(this.path, JSON.stringify(valid, null, 2));
    this.value = valid;
  }
  markDeletion(id: string): void {
    uuid(id);
    const ids = [...new Set([...this.value.pendingDeletion, id])];
    atomicWrite(join(this.directory, "deletions.json"), JSON.stringify(ids));
    const next = structuredClone(this.value);
    next.pendingDeletion = ids;
    try { this.save(next); }
    catch (error) {
      // The journal is already durable; keep this account blocked in memory too.
      this.value.pendingDeletion = ids;
      throw error;
    }
  }
  finishDeletion(id: string): void {
    const next = structuredClone(this.value);
    next.accounts = next.accounts.filter(a => a.id !== id);
    next.pendingDeletion = next.pendingDeletion.filter(value => value !== id);
    if (next.selected === id) next.selected = null;
    this.save(next);
    // Both configuration copies must exclude the account before retiring the journal.
    this.save(next);
    atomicWrite(join(this.directory, "deletions.json"), JSON.stringify(next.pendingDeletion));
  }
}
export function removePartition(directory: string, id: string): void {
  uuid(id);
  const root = resolve(directory, "Partitions");
  const target = join(root, `account-${id}`);
  const rootStat = lstatSync(root, { throwIfNoEntry: false });
  if (!rootStat) return;
  if (rootStat.isSymbolicLink() || realpathSync(root) !== root) throw new Error("Niebezpieczna ścieżka partycji.");
  const targetStat = lstatSync(target, { throwIfNoEntry: false });
  if (!targetStat) return;
  if (targetStat.isSymbolicLink() || realpathSync(target) !== target) throw new Error("Niebezpieczna ścieżka konta.");
  rmSync(target, { recursive: true, force: false });
}
