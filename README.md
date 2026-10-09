# MonoChat

[Polski](#polski) · [English](#english)

## Polski

MonoChat to niezależna aplikacja desktopowa dla Linux, która łączy wiele kont WhatsApp, Messenger, Wiadomości Google i Instagram Direct w jednym oknie. Korzysta z oficjalnych stron usług. Jest napisana w TypeScript i Electron, bez frameworka frontendowego i własnego serwera.

**Status: wersja rozwojowa 0.1.0.** Aplikacja działa lokalnie, ma paczki AppImage i deb oraz testy izolacji sesji. Sprawdzono anonimowe ekrany logowania czterech usług. Pełne testy rozmów po zalogowaniu, załączników i publikacja w sklepach pozostają do wykonania. Szczegóły: [raport testów](docs/TESTING.md).

- Autor i opiekun: **Piotr Grono**, [piotr@strony.olsztyn.pl](mailto:piotr@strony.olsztyn.pl).
- Witryna projektu: [strony.olsztyn.pl/monochat](https://strony.olsztyn.pl/monochat).
- Kod źródłowy: [pgrono/monochat](https://github.com/pgrono/monochat).
- Licencja własnego kodu i grafiki MonoChat: [MIT](LICENSE).

![MonoChat — interfejs aplikacji](docs/electron-empty.png)

Zrzuty z działającej aplikacji na osobnym profilu demonstracyjnym. „Prywatne” i „Praca” to fikcyjne, nieaktywne konta — bez logowania, kontaktów i rozmów.

![Dodawanie konta w MonoChat](docs/electron-add-account.png)

![Ustawienia i wybór języka MonoChat](docs/electron-settings.png)

### Funkcje

- Wiele niezależnych kont tej samej usługi, każde z własnym UUID i trwałą partycją przeglądarki.
- Dodawanie, nazywanie, zmiana kolejności, wyłączanie i usuwanie kont; osobne ustawienia dźwięku i powiadomień.
- Włączanie i wyłączanie całej usługi z zachowaniem ustawień jej kont.
- Przełączanie aktywnych kont bez przeładowania stron. Włączone konta działają w tle.
- Interfejs angielski, polski, niemiecki, francuski, hiszpański i włoski.
- Automatyczny język systemu lub ręczny wybór w ustawieniach, działający od razu i zapamiętywany po restarcie.
- Osadzone strony odseparowane od lokalnego interfejsu, bez dostępu do Node.js ani API aplikacji.
- Atomowy zapis konfiguracji, kopia ostatniej poprawnej konfiguracji i trwały rejestr usuwania danych.
- Zapamiętanie okna, ochrona przed drugą kopią, opcjonalne zamykanie do zasobnika i jawne zakończenie programu.
- Lokalne pakiety AppImage/deb, kandydaci konfiguracji Flatpak/Snap oraz workflow sprawdzania i budowania w GitHub Actions.

### Instalacja i uruchomienie

Podstawowa platforma: **Linux x86_64**. Lokalne paczki po zbudowaniu znajdują się w `release/`:

- `MonoChat-0.1.0.AppImage` — uruchom jako zwykły użytkownik; system może wymagać zgodności z FUSE 2.
- `monochat_0.1.0_amd64.deb` — pakiet dla Ubuntu/Debian.

Paczki nie są jeszcze publicznym wydaniem ani aplikacją zaakceptowaną w sklepie. Nie uruchamiaj MonoChat jako root i nie dodawaj `--no-sandbox`. Szczegółowa [instrukcja po polsku](docs/INSTRUKCJA-PL.md) opisuje uruchomienie i ograniczenia.

### Korzystanie

Wybierz **Dodaj konto**, usługę oraz nazwę konta. Zaloguj się bezpośrednio na oficjalnej stronie. Możesz powtórzyć to dla kolejnych kont tej samej usługi. Nie wpisuj haseł do usług w formularzach ustawień MonoChat.

W **Ustawieniach** znajdziesz również wyłączone konta, przełączniki usług, dźwięku i powiadomień, kolejność oraz usuwanie. Zmiany pojedynczego konta zatwierdzaj przyciskiem **Zapisz**. Usunięcie dotyczy tylko lokalnej instancji i jej sesji, nie konta w usłudze. Restart kończy usunięcie katalogu partycji. Błąd czyszczenia pozostaje widoczny i umożliwia ponowienie.

**Ustawienia → Język aplikacji** pozwala wybrać Automatycznie, English, Polski, Deutsch, Français, Español lub Italiano. Tryb automatyczny wybiera pierwszy obsługiwany język systemu, a przy braku takiego języka — angielski. Zmiana nie przeładowuje komunikatorów. Język stron usług ustawiasz w samych usługach.

Skróty: **Ctrl+N** — dodawanie, **Ctrl+,** — ustawienia, **Ctrl+R** — przeładowanie bieżącej usługi, **Ctrl+Q** — zakończenie. **Esc** zamyka lokalny dialog. Kolejność można zmieniać przeciąganiem oraz przyciskami **Wyżej / Niżej**.

### Budowanie ze źródeł

Zalecany Node.js 24, minimum 22.12; wymagane npm i biblioteki GTK/NSS/ALSA potrzebne przez Electron. Testy runtime wymagają sesji graficznej; CI korzysta z Xvfb. Wersje zależności są przypięte w `package-lock.json`.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:electron
npm run dev
npm run dist
```

`npm run build` kompiluje aplikację i testy. `npm run dist` tworzy AppImage/deb bez publikacji. `npm run dist:dir` tworzy katalog `release/linux-unpacked/`. Testy wymagające okien uruchamiaj na osobnym ekranie Xvfb. Eksport rozmiarów ikony przez `npm run icons` wymaga FFmpeg.

Stos: Electron 44.7.0, electron-builder 26.17.0, TypeScript 6.0.3. Lint to niewielki zestaw kontroli AST dotyczących składni i bezpieczeństwa, a nie kompletny stylistyczny linter. Proces wydania wymaga osobnej akceptacji testów, wersji i commitu.

### Ograniczenia i prywatność

Logowanie, rozmowy i załączniki obsługują oficjalne strony. Google Messages wymaga telefonu/konta zgodnie z zasadami usługi; MonoChat nie wysyła SMS samodzielnie. Instagram otwiera Direct, ale pozostała nawigacja strony nie jest usuwana. Nie ma licznika nieprzeczytanych wiadomości, ponieważ nie potwierdzono wiarygodnej integracji.

Powiadomienia i dźwięk mają osobne przełączniki. Powiązanie powiadomienia z kontem, kliknięcie oraz wycofanie już pokazanych powiadomień wymagają dalszych testów. Wyłączenie konta zatrzymuje jego stronę i usuwa rejestrację service workerów, zachowując dane logowania; ponowne połączenie trzeba jeszcze sprawdzić w prawdziwych sesjach każdej usługi.

Nie potwierdzono pełnych scenariuszy po zalogowaniu: wysyłania i odbierania wiadomości, załączników, 2FA, dwóch równoczesnych prawdziwych kont WhatsApp ani rozmów audio/wideo. WhatsApp usuwa jedynie znaczniki produktu Electron/MonoChat z User-Agent, co umożliwiło pokazanie ekranu parowania QR. Pozostałe adaptery zachowują domyślny User-Agent. Usługi mogą ograniczać logowanie w osadzonych przeglądarkach.

MonoChat nie dodaje telemetrii i nie wymaga własnego konta użytkownika. [Prywatność](PRIVACY.md), [bezpieczeństwo i zgłaszanie podatności](SECURITY.md), [zasady współpracy](CONTRIBUTING.md).

### Publikacja

Kod: [GitHub](https://github.com/pgrono/monochat). **Flathub i Snap Store: nie zgłoszono.** Identyfikator aplikacji: `io.github.pgrono.monochat`. Konfiguracje sklepów są lokalnymi kandydatami i nie oznaczają akceptacji. [Instrukcja dystrybucji i pozostałe kroki](docs/PUBLISHING.md).

Opisane w dokumentacji wymagania Flathub dotyczące AI wymagają samodzielnego przygotowania manifestu oraz osobistego zgłoszenia przez wydawcę, a także ujawnienia użycia generowanego kodu, dokumentacji i grafiki. Przed zgłoszeniem trzeba ponownie sprawdzić aktualne reguły i ukończyć testy funkcjonalne.

Ikona MonoChat została wygenerowana narzędziem graficznym; [źródło i prompt](assets/ICON.md). Ikony usług mają osobne [informacje o pochodzeniu i licencjach](assets/services/README.md). Rambox CE był punktem odniesienia; nie skopiowano jego kodu ani grafiki. MonoChat nie jest powiązany z Rambox, Meta, WhatsApp ani Google. Nazwy usług służą identyfikacji integracji.

---

## English

An independent Linux desktop workspace for multiple WhatsApp, Messenger, Google Messages and Instagram Direct accounts. Written in TypeScript with Electron WebContentsView, without a frontend framework or application server.

**Development status (2026-10-09): working development build.** Dependencies and lockfile are installed, core and Electron isolation tests pass, and AppImage/deb packages are built. All four anonymous sign-in screens were checked in Electron, including WhatsApp QR pairing. Authenticated messaging and store acceptance remain unverified. See [test evidence and remaining work](docs/TESTING.md).

[Polska instrukcja](docs/INSTRUKCJA-PL.md) · [Privacy](PRIVACY.md) · [Security](SECURITY.md) · [Distribution](docs/PUBLISHING.md)

![MonoChat running in Electron](docs/electron-empty.png)

Screenshots of the running Electron application using a disposable demo profile. “Prywatne” and “Praca” are fictional disabled accounts, without sign-in, contacts or conversations.

![Add an account in MonoChat](docs/electron-add-account.png)

![MonoChat settings and language selection](docs/electron-settings.png)

### Implemented in source

- Separate immutable UUID and persistent Electron partition for every account.
- English, Polish, German, French, Spanish and Italian UI, selected automatically from the system language or manually in Settings.
- Account sidebar, add/rename, enable/disable, independent audio and notification controls, drag ordering and keyboard ordering buttons.
- Global service pause that retains individual account flags.
- Kept-alive enabled views; switching does not recreate or load them again.
- Local dialogs hide remote views. Startup, loading, network errors, retry and renderer crashes have UI states.
- Atomic configuration, backup recovery and a durable deletion journal. Account removal confirms its name and finishes directory removal on restart.
- Sandboxed remote pages without preload or application IPC. Validated local IPC, navigation rules, same-session login popups and origin-scoped permission prompts.
- Native file upload dialogs and downloads with save dialogs; downloads never auto-execute.
- Window geometry, single-instance lock, optional close-to-tray with a live Linux tray-host check, explicit quit.
- AppImage/deb build configuration, local Flatpak and Snap candidates, original icons and CI definitions.

### Build and run

Linux x86_64; Node.js 24 recommended (minimum 22.12), npm, GTK/NSS/ALSA libraries required by Electron. Graphical desktop session for runtime tests; CI uses Xvfb. AppImage may need FUSE 2 compatibility. Debian package installation configures Electron's sandbox helper. Never run MonoChat as root or disable Chromium sandboxing.

The repository includes a real npm lockfile. With Node 24 (`nvm use` when using nvm):

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:electron
npm run dev
npm run dist
```

`npm run build` compiles the main process, preload, renderer and tests. `npm run dist` asks electron-builder for x86_64 AppImage and deb files in `release/`. `npm run dist:dir` produces `release/linux-unpacked/` for package builders. Both packages exist locally. Project author and maintainer: Piotr Grono <piotr@strony.olsztyn.pl>. Release approval remains a separate step after acceptance testing.

The lint command is a small TypeScript AST check for syntax, unsafe Electron preferences, explicit `any`, dynamic code and HTML injection sinks; semantic checking is handled by `typecheck`. It is intentionally not described as a full general-purpose style linter.

Pinned versions: Electron 44.7.0, electron-builder 26.17.0, TypeScript 6.0.3, Node types 24.13.3. The dependency tree is recorded in `package-lock.json`. The `postinstall` script explicitly downloads the Electron binary with `install-electron`.

### Usage

**Settings → Application language** offers Automatic (the default) and six languages, listed by their native names. Changes apply immediately and persist across restarts. Automatic uses the first supported system language, falling back to English. Existing configurations migrate to Automatic without changing accounts or sessions. Service websites keep their own language settings.

Choose **Add account**, a service and a name. Authenticate in the official page. Repeat for additional accounts, including multiple accounts of the same service. Do not enter service passwords into any MonoChat settings field.

Use **Settings** for disabled accounts, service pause, audio, notifications, order and removal. Save individual account edits with **Save**. Removing an account affects this local installation only; the service account remains. Restart completes the queued partition-directory deletion. A failure stays visible and can be retried.

Shortcuts: Ctrl+N adds an account, Ctrl+, opens settings, Ctrl+R returns the selected service to its start URL, Ctrl+Q exits. Esc closes a local dialog. Reordering is also available through **Move up / Move down**.

### Integration boundaries

Official pages own authentication, message data and attachment UI. Google Messages depends on the user's phone/account and is not an independent SMS sender. Instagram starts at Direct and redirects the post-login root back to Direct; the remaining official navigation is not removed. There is no unread counter because no reliable integration has been verified.

Notification permission and audio are controlled separately. Native notification labels, click routing and already displayed notification withdrawal are not guaranteed by this implementation; these remain release-blocking acceptance checks. Service workers are unregistered on disable to stop background work; cookies and site storage are retained. Verify that this does not disrupt each service's reconnection workflow.

No successful authenticated messaging, attachment, 2FA or two-real-WhatsApp-account test has been performed. WhatsApp removes only the Electron/MonoChat product tokens from its User-Agent; this changed the unsupported-browser screen into a working QR pairing screen in the anonymous test. Other adapters keep the default User-Agent. Google may reject embedded-browser authentication. Voice/video are unverified. See the full matrix in [TESTING.md](docs/TESTING.md).

### Publication

Source repository: GitHub. Flathub: not submitted. Snap Store: not submitted. Application identity: `io.github.pgrono.monochat`. Repository: https://github.com/pgrono/monochat. Project homepage: https://strony.olsztyn.pl/monochat. Publisher: Piotr Grono (piotr@strony.olsztyn.pl). Store registration and acceptance are still pending.

Current Flathub policy forbids AI-generated/assisted manifests and automated AI submission interactions. The included Flatpak manifest is exclusively a local development candidate. A human publisher must author a compliant submission manifest and disclose generated application material. [Details and current sources](docs/PUBLISHING.md).

MIT for original source and MonoChat artwork. The new icon was generated with the built-in image-generation tool; [master and prompt](assets/ICON.md). Service icons have separate provenance in [assets/services/README.md](assets/services/README.md). Rambox CE was reviewed as a reference; no code or artwork was copied. MonoChat is unaffiliated with Rambox, Meta, WhatsApp or Google. Service names identify integrations only.
