import { BrowserWindow, WebContentsView, dialog, session, shell, type Session, type WebContents, type DownloadItem } from "electron";
import { adapters, internalURL, webURL, instagramInbox, attachmentURL, serviceUserAgent } from "../services/adapters.js";
import { partition, type AccountConfig, type RuntimeState } from "../shared/model.js";
import type { AccountRuntime } from "./lifecycle.js";
export const remotePreferences = { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, backgroundThrottling: false, spellcheck: true } as const;
export class Runtime implements AccountRuntime {
  readonly view: WebContentsView;
  readonly session: Session;
  readonly popups = new Set<BrowserWindow>();
  private downloads = new Set<DownloadItem>();
  private grants = new Set<string>();
  private active = true;
  private state: RuntimeState = { state: "loading" };
  constructor(private account: AccountConfig, private window: BrowserWindow, private changed: (id: string, state: RuntimeState) => void, private activate: (id: string) => void, private t: (source: string, params?: Record<string, string | number>) => string = source => source) {
    this.session = session.fromPartition(partition(account.id));
    this.session.setUserAgent(serviceUserAgent(account.service, this.session.getUserAgent()));
    this.session.webRequest.onBeforeRequest((_details, callback) => callback({ cancel: !this.active }));
    this.session.setPermissionCheckHandler((wc, permission, origin) => this.allowed(wc, permission, origin));
    this.session.setPermissionRequestHandler((wc, permission, callback, details) => {
      const origin = details.requestingUrl || wc?.getURL() || "";
      if (!this.active || !wc || wc.session !== this.session || !internalURL(this.account.service, origin)) { callback(false); return; }
      if (permission === "notifications") { callback(this.account.notifications); return; }
      if (!["media", "clipboard-read", "clipboard-sanitized-write", "fullscreen"].includes(permission)) { callback(false); return; }
      const key = this.grantKey(permission, origin);
      if (this.grants.has(key)) { callback(true); return; }
      const labels: Record<string, string> = { media: "mikrofon i kamerę", "clipboard-read": "odczyt schowka", "clipboard-sanitized-write": "zapis do schowka", fullscreen: "pełny ekran" };
      void dialog.showMessageBox(this.window, { type: "question", title: this.t("Uprawnienie konta"), message: this.t("{name}: zezwolić na {permission}?", { name: this.account.name, permission: this.t(labels[permission]!) }), detail: new URL(origin).origin, buttons: [this.t("Odmów"), this.t("Zezwól")], defaultId: 0, cancelId: 0 }).then(result => {
        const allow = result.response === 1 && this.active && !wc.isDestroyed() && internalURL(this.account.service, wc.getURL()) && new URL(wc.getURL()).origin === new URL(origin).origin;
        if (allow) this.grants.add(key);
        callback(allow);
      }).catch(() => callback(false));
    });
    this.session.setDevicePermissionHandler(() => false);
    this.session.on("will-download", this.onDownload);
    this.view = new WebContentsView({ webPreferences: { ...remotePreferences, session: this.session } });
    this.window.contentView.addChildView(this.view);
    this.view.setVisible(false);
    this.protect(this.view.webContents);
    this.view.webContents.on("did-start-loading", () => this.status({ state: "loading" }));
    this.view.webContents.on("did-stop-loading", () => { if (this.state.state !== "error") this.status({ state: "ready" }); });
    this.view.webContents.on("did-fail-load", (_event, code, _description, _url, mainFrame) => {
      if (mainFrame && code !== -3) this.status({ state: "error", message: code === -106 ? "Brak połączenia z internetem." : "Nie udało się otworzyć usługi (kod {code}).", params: { code } });
    });
    this.view.webContents.on("render-process-gone", () => this.status({ state: "error", message: "Widok konta został zatrzymany. Spróbuj ponownie." }));
    this.view.webContents.on("did-navigate", (_event, url) => {
      if (this.account.service === "instagram") {
        const inbox = instagramInbox(url);
        if (inbox) void this.view.webContents.loadURL(inbox).catch(() => this.loadError());
      }
    });
    this.update(account);
    void this.view.webContents.loadURL(adapters[account.service].url).catch(() => this.loadError());
  }
  private grantKey(permission: string, value: string): string { return `${permission}:${new URL(value).origin}`; }
  private allowed(wc: WebContents | null, permission: string, origin: string): boolean {
    if (!this.active || (wc && wc.session !== this.session) || !internalURL(this.account.service, origin)) return false;
    if (permission === "notifications") return this.account.notifications;
    return this.grants.has(this.grantKey(permission, origin));
  }
  private loadError(): void { if (this.active && this.state.state !== "error") this.status({ state: "error", message: "Nie udało się załadować usługi. Sprawdź połączenie i ponów próbę." }); }
  private status(state: RuntimeState): void {
    if (!this.active) return;
    this.state = state;
    this.changed(this.account.id, state);
  }
  private external(value: string): void {
    if (webURL(value)) void shell.openExternal(value).catch(() => this.status({ state: "error", message: "Nie można otworzyć przeglądarki systemowej." }));
  }
  private protect(wc: WebContents): void {
    const navigate = (event: Electron.Event, url: string) => {
      if (!internalURL(this.account.service, url) && !attachmentURL(this.account.service, url)) { event.preventDefault(); this.external(url); }
    };
    wc.on("will-navigate", navigate);
    wc.on("will-redirect", (event, url, _sameDocument, isMainFrame) => {
      if (isMainFrame) navigate(event, url);
    });
    wc.on("will-frame-navigate", details => {
      // Subframes may use official CDNs; never let them load local or custom protocols.
      if (!webURL(details.url) && !attachmentURL(this.account.service, details.url) && details.url !== "about:blank") details.preventDefault();
    });
    wc.on("will-attach-webview", event => event.preventDefault());
    wc.setWindowOpenHandler(({ url }) => {
      if (!this.active) return { action: "deny" };
      if (url === "about:blank" || internalURL(this.account.service, url) || attachmentURL(this.account.service, url)) return {
        action: "allow", overrideBrowserWindowOptions: {
          parent: this.window, width: 900, height: 720, autoHideMenuBar: true,
          webPreferences: { ...remotePreferences, session: this.session }
        }
      };
      this.external(url);
      return { action: "deny" };
    });
    wc.on("did-create-window", popup => {
      this.popups.add(popup);
      popup.setMenu(null);
      popup.webContents.setAudioMuted(this.account.muted);
      this.protect(popup.webContents);
      popup.on("closed", () => this.popups.delete(popup));
    });
    // Native notifications may ask their owning page to focus. No guessed account mapping.
    wc.on("focus", () => { if (this.active && wc === this.view.webContents) this.activate(this.account.id); });
  }
  private onDownload = (event: Electron.Event, item: DownloadItem): void => {
    if (!this.active) { event.preventDefault(); return; }
    this.downloads.add(item);
    item.setSaveDialogOptions({ title: this.t("Zapisz załącznik — {name}", { name: this.account.name }) });
    item.once("done", (_event, state) => {
      this.downloads.delete(item);
      if (state === "interrupted" && this.active) void dialog.showMessageBox(this.window, { type: "error", message: this.t("Pobieranie zostało przerwane."), detail: this.t("Ponów pobranie załącznika w komunikatorze.") });
    });
  };
  update(account: AccountConfig): void {
    this.account = account;
    this.view.webContents.setAudioMuted(account.muted);
    for (const popup of this.popups) popup.webContents.setAudioMuted(account.muted);
  }
  show(visible: boolean): void {
    const { width, height } = this.window.getContentBounds();
    this.view.setBounds({ x: 154, y: 64, width: Math.max(1, width - 154), height: Math.max(1, height - 64) });
    this.view.setVisible(visible && this.state.state === "ready");
  }
  focus(): void { if (!this.view.webContents.isDestroyed()) this.view.webContents.focus(); }
  reload(): void {
    this.status({ state: "loading" });
    void this.view.webContents.loadURL(adapters[this.account.service].url).catch(() => this.loadError());
  }
  async close(): Promise<void> {
    this.active = false;
    for (const item of this.downloads) item.cancel();
    this.downloads.clear();
    for (const popup of this.popups) popup.destroy();
    this.popups.clear();
    this.session.removeListener("will-download", this.onDownload);
    if (!this.view.webContents.isDestroyed()) {
      this.window.contentView.removeChildView(this.view);
      this.view.webContents.close({ waitForBeforeUnload: false });
    }
    // Unregister background workers when disabled; keep login cookies and site storage.
    // Network and permission gates above remain closed until this session is enabled again.
    await this.session.clearStorageData({ storages: ["serviceworkers"] });
    await this.session.closeAllConnections();
    await this.session.cookies.flushStore();
    this.session.flushStorageData();
    this.grants.clear();
  }
  async erase(): Promise<void> {
    await this.session.clearData();
    await this.session.clearAuthCache();
    await this.session.clearCache();
    await this.session.closeAllConnections();
  }
}
