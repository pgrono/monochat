import { resolveLanguage, translate } from "../shared/i18n.js";
import { app, BrowserWindow, dialog, ipcMain, Menu, Tray, screen, session } from "electron";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ConfigStore, removePartition } from "./config.js";
import { Accounts } from "./lifecycle.js";
import { Runtime } from "./runtime.js";
import { effective, partition, validateCommand, type Config, type Snapshot, type RuntimeState, type Command } from "../shared/model.js";
app.setName("MonoChat");
app.enableSandbox();
const APP_ID = "io.github.pgrono.monochat"; // Identity follows the owner-provided GitHub repository.
app.setAppUserModelId(APP_ID);
app.setDesktopName(`${APP_ID}.desktop`);
let window: BrowserWindow;
let store: ConfigStore;
let manager: Accounts<Runtime>;
let tray: Tray | undefined;
let quitting = false;
let stopped = false;
let notice = "";
const states: Record<string, RuntimeState> = {};
let work: Promise<unknown> = Promise.resolve();
const enqueue = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = work.then(fn, fn); work = next.catch(() => undefined); return next;
};
const language = () => resolveLanguage(store?.value.settings.language ?? "auto", app.getPreferredSystemLanguages());
const t = (source: string, params?: Record<string, string | number>): string => translate(language(), source, params);
function snapshot(): Snapshot {
  return { language: language(), systemLanguage: resolveLanguage("auto", app.getPreferredSystemLanguages()), config: { ...structuredClone(store.value), selected: manager.selected }, runtime: { ...states }, trayAvailable: !!tray && !tray.isDestroyed(), notice: notice || store.notice };
}
function publish(): void {
  if (window && !window.isDestroyed() && manager) { manager.layout(); window.webContents.send("monochat:state", snapshot()); }
}
function show(): void { if (window.isMinimized()) window.restore(); window.show(); window.focus(); }
async function trayHost(): Promise<boolean> {
  try {
    const { stdout } = await promisify(execFile)("gdbus", ["call", "--session", "--dest", "org.kde.StatusNotifierWatcher", "--object-path", "/StatusNotifierWatcher", "--method", "org.freedesktop.DBus.Properties.Get", "org.kde.StatusNotifierWatcher", "IsStatusNotifierHostRegistered"], { timeout: 2000 });
    return /\btrue\b/.test(stdout);
  } catch { return false; }
}
async function configureTray(): Promise<void> {
  if (!(await trayHost())) { tray?.destroy(); tray = undefined; return; }
  if (tray && !tray.isDestroyed()) return;
  tray = new Tray(join(__dirname, "../../assets/icons/32x32.png"));
  tray.setToolTip("MonoChat");
  updateMenus();
  tray.on("click", show);
}
function updateMenus(): void {
  tray?.setContextMenu(Menu.buildFromTemplate([{ label: t("Otwórz MonoChat"), click: show }, { type: "separator" }, { label: t("Zakończ"), click: () => app.quit() }]));
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: "MonoChat", submenu: [
    { label: t("Dodaj konto"), accelerator: "CommandOrControl+N", click: () => window.webContents.send("monochat:shortcut", "add") },
    { label: t("Ustawienia"), accelerator: "CommandOrControl+,", click: () => window.webContents.send("monochat:shortcut", "settings") },
    { label: t("Odśwież konto"), accelerator: "CommandOrControl+R", click: () => { if (manager.selected) manager.live.get(manager.selected)?.reload(); } },
    { label: t("Zakończ"), accelerator: "CommandOrControl+Q", click: () => app.quit() }
  ] }]));
}
async function reconcile(next: Config): Promise<void> { store.save(next); await manager.reconcile(store.value); publish(); }
async function command(c: Command): Promise<Snapshot> {
  const next = structuredClone(store.value);
  const account = "id" in c ? next.accounts.find(a => a.id === c.id) : undefined;
  if ("id" in c && !account) throw new Error("Konto nie istnieje.");
  switch (c.type) {
    case "snapshot": return snapshot();
    case "quit": app.quit(); return snapshot();
    case "dialog": manager.overlay = c.open; manager.layout(); return snapshot();
    case "add": {
      const id = randomUUID();
      next.accounts.push({ id, service: c.service, name: c.name, enabled: true, muted: false, notifications: true, order: next.accounts.length });
      // A new account is visible immediately, including when its service was paused.
      next.services[c.service] = true;
      next.selected = id;
      break;
    }
    case "update": {
      if (next.pendingDeletion.includes(c.id)) throw new Error("Dokończ usuwanie konta przed jego zmianą.");
      Object.assign(account!, { name: c.name, enabled: c.enabled, muted: c.muted, notifications: c.notifications, color: c.color }); break;
    }
    case "service": next.services[c.service] = c.enabled; break;
    case "language": next.settings.language = c.language; break;
    case "settings":
      await configureTray();
      if (c.closeToTray && !tray) throw new Error("Pulpit nie udostępnia zasobnika. Okno będzie zamykać aplikację.");
      next.settings.closeToTray = c.closeToTray; break;
    case "move": {
      if (c.before === c.id) return snapshot();
      const list = next.accounts.filter(a => a.id !== c.id);
      const index = c.before === null ? list.length : list.findIndex(a => a.id === c.before);
      if (index < 0) throw new Error("Niepoprawna kolejność kont.");
      list.splice(index, 0, account!);
      list.forEach((a, i) => { a.order = i; }); next.accounts = list; break;
    }
    case "select":
      if (!effective(next, account!)) throw new Error("Konto jest wyłączone.");
      next.selected = c.id; break;
    case "reload": manager.live.get(c.id)?.reload(); publish(); return snapshot();
    case "remove": {
      const answer = await dialog.showMessageBox(window, { type: "warning", title: t("Usuń lokalne konto"), message: t("Usunąć „{name}”?", { name: account!.name }), detail: t("Zniknie lokalna sesja tego konta. Ponowne dodanie wymaga logowania. Konto w usłudze pozostanie. Usuwanie pozostałych plików zostanie dokończone przy następnym uruchomieniu."), buttons: [t("Anuluj"), t("Usuń lokalne dane")], defaultId: 0, cancelId: 0 });
      if (answer.response !== 1) return snapshot();
      try {
        store.markDeletion(c.id);
        await manager.reconcile(store.value);
        const ses = session.fromPartition(partition(c.id));
        await ses.clearData(); await ses.clearAuthCache(); await ses.clearCache(); await ses.closeAllConnections();
        delete states[c.id];
        notice = "Wyczyszczono dane strony. Usunięcie katalogu konta oczekuje na ponowne uruchomienie MonoChat.";
      } catch {
        // If config persistence failed after writing the journal, still stop the account.
        try { await manager.reconcile(store.value); } catch { /* Retry remains available. */ }
        notice = "Nie udało się dokończyć czyszczenia. Konto jest zatrzymane. Ponów usuwanie lub uruchom aplikację ponownie.";
        publish(); throw new Error(notice);
      }
      publish(); return snapshot();
    }
  }
  await reconcile(next);
  if (c.type === "language") updateMenus();
  if (c.type === "select" || c.type === "add") manager.select(next.selected!);
  return snapshot();
}
async function start(): Promise<void> {
  store = new ConfigStore(app.getPath("userData"));
  // Run before any partition is opened; journal remains durable on failure.
  for (const id of [...store.value.pendingDeletion]) {
    try { removePartition(store.directory, id); store.finishDeletion(id); }
    catch { notice = "Nie udało się usunąć katalogu konta. Konto pozostaje zablokowane; ponów usuwanie w ustawieniach."; }
  }
  const saved = store.value.window;
  const display = screen.getDisplayMatching({ x: saved.x ?? 0, y: saved.y ?? 0, width: saved.width, height: saved.height }).workArea;
  const width = Math.min(saved.width, display.width), height = Math.min(saved.height, display.height);
  const bounds = { width, height, x: Math.max(display.x, Math.min(saved.x ?? display.x + (display.width - width) / 2, display.x + display.width - width)), y: Math.max(display.y, Math.min(saved.y ?? display.y + (display.height - height) / 2, display.y + display.height - height)) };
  window = new BrowserWindow({ ...bounds, minWidth: 760, minHeight: 500, title: "MonoChat", autoHideMenuBar: true, backgroundColor: "#f7f8fa", icon: join(__dirname, "../../assets/icons/256x256.png"), show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, preload: join(__dirname, "../preload/index.js") } });
  window.setMenu(null);
  const localURL = pathToFileURL(join(__dirname, "../renderer/index.html")).href;
  window.webContents.on("will-navigate", event => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  manager = new Accounts(account => new Runtime(account, window, (id, state) => { states[id] = state; publish(); }, id => {
    if (manager.selected === id && window.isVisible()) return;
    void enqueue(async () => { const next = structuredClone(store.value); next.selected = id; await reconcile(next); show(); manager.select(id); });
  }, t));
  ipcMain.handle("monochat:command", (event, value: unknown) => {
    const frame = event.senderFrame;
    if (event.sender !== window.webContents || !frame || frame !== window.webContents.mainFrame || frame.url !== localURL) throw new Error("Niedozwolony nadawca.");
    const input = validateCommand(value);
    return enqueue(() => command(input));
  });
  window.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown" || !(input.control || input.meta)) return;
    const key = input.key.toLowerCase();
    if (["n", ",", "r", "q"].includes(key)) {
      event.preventDefault();
      if (key === "q") app.quit();
      else if (key === "r" && manager.selected) manager.live.get(manager.selected)?.reload();
      else window.webContents.send("monochat:shortcut", key === "n" ? "add" : "settings");
    }
  });
  // Application menu accelerators also work while a remote WebContentsView has focus.
  updateMenus();
  window.on("resize", () => manager.layout());
  window.on("close", event => {
    if (quitting) return;
    event.preventDefault();
    void enqueue(async () => {
      if (store.value.settings.closeToTray && await trayHost() && tray && !tray.isDestroyed()) window.hide();
      else app.quit();
    });
  });
  await window.loadFile(join(__dirname, "../renderer/index.html"));
  await configureTray();
  await manager.reconcile(store.value);
  publish(); window.show();
}
app.on("before-quit", event => {
  if (stopped || !manager) return;
  event.preventDefault();
  if (quitting) return;
  quitting = true;
  void enqueue(async () => {
    try {
      const next = structuredClone(store.value);
      next.selected = manager.selected;
      if (!window.isDestroyed()) { const b = window.getNormalBounds(); next.window = { ...b, width: Math.max(760, b.width), height: Math.max(500, b.height) }; }
      store.save(next);
      await manager.closeAll();
    } catch { if (!window.isDestroyed()) await dialog.showMessageBox(window, { type: "error", message: t("Nie udało się zapisać wszystkich danych przed zakończeniem."), detail: t("Sprawdź wolne miejsce i uprawnienia katalogu MonoChat.") }); }
    finally { tray?.destroy(); stopped = true; app.quit(); }
  });
});
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => { if (window) show(); });
  app.on("activate", () => { if (window) show(); });
  void app.whenReady().then(start).catch(error => { dialog.showErrorBox("MonoChat", t(error instanceof Error ? error.message : "Błąd uruchomienia.")); stopped = true; app.quit(); });
}
