import { translate, languages, languageNames, type LanguagePreference } from "../shared/i18n.js";
import { adapters } from "../services/adapters.js";
import { effective, serviceIds, type API, type Command, type Snapshot, type AccountConfig } from "../shared/model.js";
declare global { interface Window { monochat: API } }
const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const modal = $<HTMLDialogElement>("dialog");
let state: Snapshot;
const t = (source: string, params?: Record<string, string | number>): string => translate(state?.language ?? "en", source, params);
let dragged: string | null = null;
let returnFocus: HTMLElement | null = null;
let dialogKind = "";
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string): void {
  $("toast").textContent = message; $("toast").hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $("toast").hidden = true; }, 9000);
}
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text: string, action: () => void, className?: string): HTMLButtonElement {
  const node = el("button", text, className); node.type = "button"; node.onclick = action; return node;
}
async function send(command: Command): Promise<boolean> {
  try { state = await window.monochat.command(command); render(); return true; }
  catch (error) { toast(error instanceof Error ? t(error.message.replace(/^Error invoking remote method [^:]+: Error: /, "")) : t("Operacja nie powiodła się.")); return false; }
}
function avatar(account: AccountConfig): HTMLElement {
  const node = el("span", undefined, "avatar");
  const icon = el("img"); icon.alt = ""; icon.src = account.service === "google-messages" ? "services-icons/googlemessages.png" : `services-icons/${account.service}.svg`; node.append(icon); node.dataset.service = account.service;
  node.setAttribute("aria-hidden", "true");
  // A DOM style property is not parsed as HTML and the color is validated by the main process.
  if (account.color) node.style.border = `2px solid ${account.color}`;
  return node;
}
function render(): void {
  document.documentElement.lang = state.language;
  document.body.hidden = false;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(node => { node.textContent = t(node.dataset.i18n!); });
  document.querySelectorAll<HTMLElement>("[data-i18n-label]").forEach(node => { node.setAttribute("aria-label", t(node.dataset.i18nLabel!)); });
  document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach(node => { node.title = t(node.dataset.i18nTitle!); });
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.account : undefined;
  const nav = $("accounts"); nav.replaceChildren();
  const enabled = state.config.accounts.filter(a => effective(state.config, a));
  $("count").textContent = String(enabled.length);
  $("sidebar-empty").hidden = enabled.length > 0;
  for (const account of enabled) {
    const node = button("", () => { void send({ type: "select", id: account.id }); }, "account");
    node.dataset.account = account.id; node.setAttribute("aria-current", String(account.id === state.config.selected)); node.draggable = true;
    node.append(avatar(account));
    const text = el("span", undefined, "account-label");
    text.append(el("strong", account.name), el("small", t(adapters[account.service].name) + (account.muted ? " · " + t("wyciszone") : ""))); node.append(text);
    node.ondragstart = event => { dragged = account.id; event.dataTransfer?.setData("text/plain", account.id); };
    node.ondragover = event => { event.preventDefault(); node.classList.add("drag-over"); };
    node.ondragleave = () => node.classList.remove("drag-over");
    node.ondrop = event => { event.preventDefault(); node.classList.remove("drag-over"); if (dragged) void send({ type: "move", id: dragged, before: account.id }); dragged = null; };
    node.ondragend = () => { dragged = null; };
    nav.append(node);
  }
  if (focused) nav.querySelector<HTMLElement>(`[data-account="${focused}"]`)?.focus();
  const selected = state.config.accounts.find(a => a.id === state.config.selected);
  const runtime = selected ? state.runtime[selected.id] : undefined;
  $("welcome").hidden = !!selected;
  $("current").textContent = selected?.name ?? "MonoChat";
  $("connection").textContent = selected ? t(adapters[selected.service].name) : t("Komunikatory");
  $("reload").hidden = !selected;
  $("status").hidden = !selected || runtime?.state === "ready";
  $("status-title").textContent = runtime?.state === "error" ? t("Nie można otworzyć konta") : t("Ładowanie konta…");
  $("status-message").textContent = runtime?.message ? t(runtime.message, runtime.params) : t("Połączenie z oficjalną stroną komunikatora.");
  $("retry").hidden = runtime?.state !== "error";
}
async function open(kind: "add" | "settings"): Promise<void> {
  if (!modal.open) returnFocus = document.activeElement as HTMLElement;
  if (!(await send({ type: "dialog", open: true }))) return;
  dialogKind = kind;
  modal.dataset.kind = kind;
  $("dialog-title").textContent = kind === "add" ? t("Dodaj konto") : t("Ustawienia");
  $("dialog-body").replaceChildren();
  if (kind === "add") addForm(); else settingsForm();
  if (!modal.open) modal.showModal();
  $("dialog-body").querySelector<HTMLElement>("input,select,button")?.focus();
}
async function close(): Promise<void> {
  if (!(await send({ type: "dialog", open: false }))) return;
  modal.close(); dialogKind = ""; returnFocus?.focus();
}
function field(title: string, input: HTMLElement): HTMLLabelElement { const label = el("label", title); label.append(input); return label; }
function checkbox(title: string, checked: boolean): { label: HTMLLabelElement; input: HTMLInputElement } {
  const input = el("input"); input.type = "checkbox"; input.checked = checked;
  const label = el("label", undefined, "checkbox"); label.append(input, document.createTextNode(title)); return { label, input };
}
function addForm(): void {
  const form = el("form", undefined, "form");
  const select = el("select"); select.name = "service";
  for (const id of serviceIds) { const option = el("option", t(adapters[id].name)); option.value = id; select.append(option); }
  const name = el("input"); name.name = "name"; name.maxLength = 80; name.required = true; name.placeholder = t("np. Prywatne lub Firma"); name.autocomplete = "off";
  const submit = el("button", t("Dodaj"), "primary"); submit.type = "submit";
  form.append(field(t("Komunikator"), select), field(t("Nazwa konta"), name), el("p", t("Zalogujesz się bezpośrednio na oficjalnej stronie usługi. Każde dodane konto ma osobną sesję."), "hint"), submit);
  form.onsubmit = async event => { event.preventDefault(); submit.disabled = true; const ok = await send({ type: "add", service: select.value as AccountConfig["service"], name: name.value }); submit.disabled = false; if (ok) await close(); };
  $("dialog-body").append(form);
}
function settingsForm(): void {
  const body = $("dialog-body");
  const language = el("select"); language.id = "language";
  const automatic = el("option", t("Automatycznie (system: {language})", { language: languageNames[state.systemLanguage] })); automatic.value = "auto"; language.append(automatic);
  for (const id of languages) { const option = el("option", languageNames[id]); option.value = id; language.append(option); }
  language.value = state.config.settings.language;
  language.onchange = async () => {
    language.disabled = true;
    if (await send({ type: "language", language: language.value as LanguagePreference })) { await open("settings"); $("language").focus(); }
    else { language.value = state.config.settings.language; language.disabled = false; }
  };
  body.append(field(t("Język aplikacji"), language), el("p", t("Zmiana działa od razu. Język stron komunikatorów ustawisz w poszczególnych usługach."), "hint"));
  if (state.notice) body.append(el("p", t(state.notice), "notice"));
  body.append(el("p", t("Włączone konta działają również w tle. Wyłączenie usługi zachowuje indywidualne ustawienia jej kont."), "hint"));
  const services = el("div", undefined, "services");
  for (const id of serviceIds) {
    const control = checkbox(t(adapters[id].name), state.config.services[id]);
    control.input.onchange = async () => { if (!(await send({ type: "service", service: id, enabled: control.input.checked }))) control.input.checked = state.config.services[id]; };
    services.append(control.label);
  }
  body.append(services, el("h3", t("Twoje konta"), "small-title"));
  if (!state.config.accounts.length) body.append(el("p", t("Nie masz jeszcze kont. Zacznij od przycisku „Dodaj konto”."), "hint"));
  state.config.accounts.forEach((account, index) => {
    const form = el("form", undefined, "settings-account");
    const head = el("div", undefined, "account-heading"); head.append(avatar(account), document.createTextNode(t(adapters[account.service].name)));
    const name = el("input"); name.value = account.name; name.required = true; name.maxLength = 80;
    const enabled = checkbox(t("Włączone"), account.enabled), muted = checkbox(t("Wycisz dźwięk"), account.muted), notifications = checkbox(t("Powiadomienia"), account.notifications);
    const controls = el("div", undefined, "settings-controls"); controls.append(enabled.label, muted.label, notifications.label);
    const color = el("input"); color.type = "color"; color.value = account.color ?? "#236b61"; color.setAttribute("aria-label", t("Kolor konta {name}", { name: account.name })); controls.append(color);
    const actions = el("div", undefined, "settings-actions");
    const save = el("button", t("Zapisz"), "primary"); save.type = "submit";
    const up = button(t("Wyżej"), async () => { if (await send({ type: "move", id: account.id, before: state.config.accounts[index - 1]!.id })) await open("settings"); }); up.disabled = index === 0;
    const down = button(t("Niżej"), async () => { if (await send({ type: "move", id: account.id, before: state.config.accounts[index + 2]?.id ?? null })) await open("settings"); }); down.disabled = index === state.config.accounts.length - 1;
    const remove = button(t("Usuń…"), async () => { if (await send({ type: "remove", id: account.id })) await open("settings"); }, "danger");
    actions.append(save, up, down, remove);
    const pending = state.config.pendingDeletion.includes(account.id);
    if (pending) { form.append(el("p", t("Usuwanie oczekuje na restart. W razie błędu możesz ponowić czyszczenie."), "notice")); name.disabled = enabled.input.disabled = muted.input.disabled = notifications.input.disabled = color.disabled = save.disabled = true; remove.textContent = t("Ponów usuwanie…"); }
    form.append(head, field(t("Nazwa konta"), name), controls, actions);
    form.onsubmit = async event => { event.preventDefault(); save.disabled = true; const ok = await send({ type: "update", id: account.id, name: name.value, enabled: enabled.input.checked, muted: muted.input.checked, notifications: notifications.input.checked, color: color.value }); save.disabled = false; if (ok) { save.textContent = t("Zapisano"); } };
    body.append(form);
  });
  const tray = checkbox(t("Zamykaj okno do zasobnika"), state.config.settings.closeToTray);
  tray.input.disabled = !state.trayAvailable;
  tray.input.onchange = async () => { if (!(await send({ type: "settings", closeToTray: tray.input.checked }))) tray.input.checked = state.config.settings.closeToTray; };
  body.append(el("h3", t("Pulpit Linux"), "small-title"), tray.label, el("p", state.trayAvailable ? t("Zakończ program przez menu zasobnika lub Ctrl+Q.") : t("Nie wykryto dostępnego zasobnika. Zamknięcie okna kończy program."), "hint"));
  body.append(el("p", t("Niezależny projekt. MonoChat nie jest powiązany z Meta ani Google. Powiadomienia korzystają z obsługi danej usługi i pulpitu; wskazanie konta i kliknięcie wymagają sprawdzenia w Twoim środowisku."), "hint"));
  body.append(button(t("Zakończ MonoChat"), () => { void send({ type: "quit" }); }));
}
$("add").onclick = $("first-account").onclick = () => { void open("add"); };
$("settings").onclick = () => { void open("settings"); };
$("close-dialog").onclick = () => { void close(); };
modal.oncancel = event => { event.preventDefault(); void close(); };
$("reload").onclick = $("retry").onclick = () => { if (state.config.selected) void send({ type: "reload", id: state.config.selected }); };
window.addEventListener("offline", () => toast(t("Brak połączenia z internetem. Konta spróbują połączyć się ponownie.")));
window.monochat.subscribe(value => { state = value; render(); });
window.monochat.shortcut(action => { if (action === "add" || action === "settings") void open(action); });
void send({ type: "snapshot" });
