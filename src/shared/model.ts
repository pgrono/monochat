import { languagePreference, type Language, type LanguagePreference } from "./i18n.js";
export const serviceIds = ["whatsapp", "messenger", "google-messages", "instagram", "slack", "gmail"] as const;
export type ServiceId = typeof serviceIds[number];
export interface AccountConfig {
  id: string;
  service: ServiceId;
  name: string;
  enabled: boolean;
  order: number;
  muted: boolean;
  notifications: boolean;
  color?: string;
}
export interface WindowBounds { x?: number; y?: number; width: number; height: number }
export interface Config {
  schemaVersion: 1;
  accounts: AccountConfig[];
  services: Record<ServiceId, boolean>;
  settings: { closeToTray: boolean; language: LanguagePreference };
  window: WindowBounds;
  selected: string | null;
  pendingDeletion: string[];
}
export interface RuntimeState { state: "loading" | "ready" | "error"; message?: string; params?: Record<string, string | number> }
export interface Snapshot {
  config: Config;
  language: Language;
  systemLanguage: Language;
  runtime: Record<string, RuntimeState>;
  trayAvailable: boolean;
  notice: string;
}
export type Command =
  | { type: "add"; service: ServiceId; name: string }
  | { type: "update"; id: string; name: string; enabled: boolean; muted: boolean; notifications: boolean; color?: string }
  | { type: "service"; service: ServiceId; enabled: boolean }
  | { type: "move"; id: string; before: string | null }
  | { type: "select" | "remove" | "reload"; id: string }
  | { type: "dialog"; open: boolean }
  | { type: "language"; language: LanguagePreference }
  | { type: "settings"; closeToTray: boolean }
  | { type: "quit" | "snapshot" };
export interface API {
  command(command: Command): Promise<Snapshot>;
  subscribe(callback: (state: Snapshot) => void): () => void;
  shortcut(callback: (action: string) => void): () => void;
}
export function defaultConfig(): Config {
  return { schemaVersion: 1, accounts: [], services: { whatsapp: true, messenger: true, "google-messages": true, instagram: true, slack: true, gmail: true }, settings: { closeToTray: false, language: "auto" }, window: { width: 1180, height: 800 }, selected: null, pendingDeletion: [] };
}
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function uuid(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new Error("Niepoprawny identyfikator konta.");
  return value;
}
export function partition(id: string): string { return `persist:account-${uuid(id)}`; }
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Niepoprawne dane.");
  return value as Record<string, unknown>;
}
export function bool(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Niepoprawna wartość logiczna.");
  return value;
}
export function serviceId(value: unknown): ServiceId {
  if (!serviceIds.includes(value as ServiceId)) throw new Error("Nieznana usługa.");
  return value as ServiceId;
}
export function accountName(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 80 || /[\x00-\x1f\x7f]/.test(value)) throw new Error("Nazwa musi mieć od 1 do 80 znaków.");
  return value.trim();
}
function color(value: unknown): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !/^#[a-fA-F0-9]{6}$/.test(value)) throw new Error("Niepoprawny kolor.");
  return value;
}
function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new Error("Niepoprawna liczba.");
  return value;
}
export function validateConfig(value: unknown): Config {
  const v = record(value);
  if (v.schemaVersion !== 1) throw new Error("Nieobsługiwana wersja konfiguracji. Dane pozostają na dysku.");
  if (!Array.isArray(v.accounts) || !Array.isArray(v.pendingDeletion)) throw new Error("Niepoprawna lista kont.");
  const accounts = v.accounts.map((item): AccountConfig => {
    const a = record(item);
    return { id: uuid(a.id), service: serviceId(a.service), name: accountName(a.name), enabled: bool(a.enabled), order: integer(a.order, 0, Number.MAX_SAFE_INTEGER), muted: bool(a.muted), notifications: bool(a.notifications), color: color(a.color) };
  }).sort((a, b) => a.order - b.order);
  if (new Set(accounts.map(a => a.id)).size !== accounts.length) throw new Error("Powtórzony identyfikator konta.");
  accounts.forEach((a, i) => { a.order = i; });
  const s = record(v.services), settings = record(v.settings), w = record(v.window);
  const services = Object.fromEntries(serviceIds.map(id => [id, bool(s[id] === undefined && (id === "slack" || id === "gmail") ? true : s[id])])) as Config["services"];
  const pendingDeletion = v.pendingDeletion.map(uuid);
  if (new Set(pendingDeletion).size !== pendingDeletion.length) throw new Error("Powtórzone zadanie usuwania.");
  const selected = v.selected === null ? null : uuid(v.selected);
  if (selected && !accounts.some(a => a.id === selected)) throw new Error("Wybrane konto nie istnieje.");
  return { schemaVersion: 1, accounts, services, settings: { closeToTray: bool(settings.closeToTray), language: settings.language === undefined ? "auto" : languagePreference(settings.language) },
    window: { width: integer(w.width, 760, 16384), height: integer(w.height, 500, 16384),
      ...(w.x === undefined ? {} : { x: integer(w.x, -100000, 100000) }), ...(w.y === undefined ? {} : { y: integer(w.y, -100000, 100000) }) },
    selected, pendingDeletion };
}
export function effective(config: Config, account: AccountConfig): boolean {
  return account.enabled && config.services[account.service] && !config.pendingDeletion.includes(account.id);
}
export function validateCommand(value: unknown): Command {
  const v = record(value);
  switch (v.type) {
    case "snapshot": case "quit": return { type: v.type };
    case "dialog": return { type: v.type, open: bool(v.open) };
    case "language": return { type: v.type, language: languagePreference(v.language) };
    case "settings": return { type: v.type, closeToTray: bool(v.closeToTray) };
    case "select": case "remove": case "reload": return { type: v.type, id: uuid(v.id) };
    case "add": return { type: v.type, service: serviceId(v.service), name: accountName(v.name) };
    case "update": return { type: v.type, id: uuid(v.id), name: accountName(v.name), enabled: bool(v.enabled), muted: bool(v.muted), notifications: bool(v.notifications), color: color(v.color) };
    case "service": return { type: v.type, service: serviceId(v.service), enabled: bool(v.enabled) };
    case "move": return { type: v.type, id: uuid(v.id), before: v.before === null ? null : uuid(v.before) };
    default: throw new Error("Nieznane polecenie.");
  }
}
