# MonoChat

[Polski](#polski) · [English](#english)

## Polski

MonoChat pozwala korzystać z WhatsApp, Messengera, Wiadomości Google, Instagram Direct, Slacka i Gmaila w jednym oknie na Linuxie. Możesz dodać kilka kont tej samej usługi i przełączać się między nimi z paska po lewej stronie. Każde konto ma osobną sesję logowania.

To niezależna aplikacja korzystająca z oficjalnych stron usług. Nie wymaga zakładania konta MonoChat i nie zbiera telemetrii.

Wersja 0.1.0, dostępna w formatach AppImage i deb.

- Witryna projektu: [strony.olsztyn.pl/portfolio/monochat](https://strony.olsztyn.pl/portfolio/monochat).
- Własny kod i grafika MonoChat są udostępniane na licencji [MIT](LICENSE).

![Interfejs MonoChat](docs/electron-empty.png)

![Dodawanie konta w MonoChat](docs/electron-add-account.png)

![Ustawienia i wybór języka MonoChat](docs/electron-settings.png)

### Co możesz zrobić

- Dodać konta, nadać im własne nazwy i ustawić ich kolejność.
- Przełączać się między włączonymi kontami bez przeładowywania stron. Pozostałe konta nadal działają w tle.
- Wyłączyć jedno konto albo wszystkie konta danej usługi, zachowując ich ustawienia.
- Osobno wyciszyć dźwięk i wyłączyć powiadomienia dla każdego konta.
- Wybrać język interfejsu: angielski, polski, niemiecki, francuski, hiszpański lub włoski.
- Wysyłać załączniki przez systemowe okno wyboru pliku i wskazać miejsce zapisu pobieranych plików. MonoChat nie uruchamia ich automatycznie.

Aplikacja zapamiętuje rozmiar i położenie okna oraz zapobiega uruchomieniu drugiej kopii. Możesz włączyć zamykanie do zasobnika, jeśli pulpit go obsługuje, albo całkowicie zakończyć program.

### Instalacja i uruchomienie

MonoChat jest przygotowany dla Linux x86_64. Lokalne paczki znajdują się w `release/`:

- `MonoChat-0.1.0.AppImage`: pakiet AppImage. System może wymagać obsługi FUSE 2.
- `monochat_0.1.0_amd64.deb`: pakiet dla Ubuntu i Debiana.

Uruchamiaj program na zwykłym koncie użytkownika, z włączonym sandboxem Chromium. Szczegóły znajdziesz w [instrukcji po polsku](docs/INSTRUKCJA-PL.md).

### Dodawanie i obsługa kont

Kliknij **Dodaj konto**, wybierz usługę i wpisz nazwę konta. Zaloguj się na stronie usługi otwartej w aplikacji. Hasło podajesz wyłącznie na oficjalnej stronie, nigdy w ustawieniach MonoChat. Kolejne konto dodajesz w ten sam sposób.

W **Ustawieniach** znajdziesz wszystkie konta, również wyłączone. Możesz zmienić nazwę, aktywność, dźwięk i powiadomienia. Zmiany w danym koncie zatwierdzasz przyciskiem **Zapisz**. Kolejność ustawisz przeciąganiem lub przyciskami **Wyżej / Niżej**.

Przed usunięciem konta aplikacja prosi o potwierdzenie i pokazuje jego nazwę. Usuwa lokalną sesję; samo konto u dostawcy usługi pozostaje. Restart kończy usuwanie katalogu sesji. Jeśli czyszczenie się nie powiedzie, zobaczysz błąd i możliwość ponowienia.

### Język i skróty

W **Ustawieniach**, w polu **Język aplikacji**, możesz zostawić domyślne „Automatycznie” albo wybrać English, Polski, Deutsch, Français, Español lub Italiano. Tryb automatyczny wybiera pierwszy obsługiwany język systemu, a jeśli go nie znajdzie, używa angielskiego. Starsze ustawienia przechodzą na ten tryb bez zmian kont i sesji.

Zmiana języka działa od razu i zostaje zapamiętana po restarcie. Nie przeładowuje otwartych usług. Język ich stron ustawiasz osobno, w samych usługach.

- Ctrl+N otwiera dodawanie konta.
- Ctrl+, otwiera ustawienia.
- Ctrl+R odświeża wybraną usługę, wracając do jej adresu startowego.
- Ctrl+Q kończy program.
- Esc zamyka okno dialogowe MonoChat.

### Sesje i bezpieczeństwo

Każde konto ma stały identyfikator UUID i osobną, zapisywaną na dysku partycję przeglądarki. Konfiguracja jest zapisywana atomowo, z kopią ostatniej poprawnej wersji. Rejestr usuwania danych pozwala dokończyć tę operację po restarcie.

Strony usług działają w sandboxie, oddzielnie od interfejsu MonoChat. Nie mają dostępu do Node.js, API aplikacji ani skryptu preload. Okna logowania korzystają z sesji właściwego konta. Uprawnienia dotyczą konkretnego konta i adresu strony, a aplikacja sprawdza nawigację i polecenia przesyłane przez lokalny interfejs.

Podczas otwierania ustawień lub innego okna dialogowego MonoChat ukrywa widok usługi. Pokazuje też stan ładowania oraz komunikaty o braku sieci lub awarii strony, z możliwością ponowienia.

Program jest napisany w TypeScript i Electron, korzysta z WebContentsView, nie używa frameworka frontendowego ani własnego serwera.

### Działanie usług i prywatność

Logowanie, wiadomości i załączniki obsługują oficjalne strony dostawców. Wiadomości Google wymagają telefonu i konta zgodnie z zasadami Google; MonoChat nie wysyła SMS-ów samodzielnie. Instagram otwiera skrzynkę Direct i wraca do niej po przekierowaniu na stronę główną podczas logowania. Pozostała nawigacja Instagrama jest dostępna. Licznika nieprzeczytanych wiadomości nie ma, ponieważ nie potwierdzono sposobu jego wiarygodnego odczytu.

Powiadomienia korzystają z mechanizmów usług i pulpitu Linux. Wyłączenie konta zatrzymuje jego stronę oraz wyrejestrowuje service workery, czyli zadania strony działające w tle. Zachowuje przy tym cookies i zapisane dane, w tym sesję logowania.

Więcej informacji: [prywatność](PRIVACY.md), [bezpieczeństwo i zgłaszanie podatności](SECURITY.md), [zasady współpracy](CONTRIBUTING.md).

## English

MonoChat brings WhatsApp, Messenger, Google Messages, Instagram Direct, Slack and Gmail into one window on Linux. You can add several accounts from the same service and switch between them using the sidebar. Each account has its own sign-in session.

This is an independent app that uses the services' official websites. It requires no separate MonoChat account and collects no telemetry.

Version 0.1.0 is available in AppImage and deb formats.

- Project website: [strony.olsztyn.pl/portfolio/monochat](https://strony.olsztyn.pl/portfolio/monochat).
- Original MonoChat code and artwork use the [MIT](LICENSE) license.

![MonoChat interface](docs/electron-empty.png)

![Adding an account in MonoChat](docs/electron-add-account.png)

![MonoChat settings and language selection](docs/electron-settings.png)

### What you can do

- Add accounts, give them your own names and arrange them in the sidebar.
- Switch between enabled accounts without reloading their pages. Other enabled accounts keep running in the background.
- Disable one account or pause every account from a service while keeping their settings.
- Control audio and notifications separately for each account.
- Choose an English, Polish, German, French, Spanish or Italian interface.
- Upload attachments through the system file picker and choose where downloads are saved. MonoChat never runs downloaded files automatically.

The app remembers its window size and position and prevents a second copy from starting. You can enable closing to the system tray when your desktop supports it, or quit the app completely.

### Installation

MonoChat targets Linux x86_64. Local packages are in `release/`:

- `MonoChat-0.1.0.AppImage`: the AppImage package. Your system may need FUSE 2 support.
- `monochat_0.1.0_amd64.deb`: a package for Ubuntu and Debian.

Run the app as a regular user with Chromium sandboxing enabled.

### Adding and managing accounts

Click **Add account**, choose a service and enter a name. Sign in on the service page that opens in the app. Enter your password only on the official page, never in MonoChat settings. Repeat these steps to add another account.

**Settings** lists all accounts, including disabled ones. You can rename an account, enable or disable it, and change its audio and notification settings. Click **Save** to apply those changes. Reorder accounts by dragging them or using **Move up / Move down**.

Before removing an account, the app shows its name and asks for confirmation. It removes the local session; your account with the service remains. Restarting completes removal of the session directory. If cleanup fails, the app shows an error and lets you retry.

### Language and shortcuts

In **Settings**, under **Application language**, keep the default Automatic option or choose English, Polski, Deutsch, Français, Español or Italiano. Automatic uses the first supported system language and falls back to English. Older configurations switch to Automatic without changing accounts or sessions.

Language changes take effect immediately and persist across restarts. They do not reload the services. Each service website has its own language settings.

- Ctrl+N opens the account form.
- Ctrl+, opens settings.
- Ctrl+R reloads the selected service at its start URL.
- Ctrl+Q quits the app.
- Esc closes a MonoChat dialog.

### Sessions and security

Every account has a permanent UUID and a separate browser partition saved on disk. Configuration writes are atomic, with a backup of the last valid version. A deletion journal lets the app finish removing session data after a restart.

Service pages run in a sandbox, separate from the MonoChat interface. They have no access to Node.js, the app API or a preload script. Login windows use the session of the account that opened them. Permissions apply to a specific account and website origin. The app validates navigation and commands sent by its local interface.

MonoChat hides the service view while settings or another local dialog is open. It also shows loading states, network errors and page crashes, with an option to retry.

The app is written in TypeScript and Electron using WebContentsView. It has no frontend framework or application server.

### Service behavior and privacy

The providers' official pages handle sign-in, messages and attachments. Google Messages depends on your phone and account under Google's rules; MonoChat does not send SMS on its own. Instagram opens Direct and returns there if sign-in redirects to the home page. Its other navigation remains available. There is no unread counter because a reliable way to read it has not been verified.

Notifications use the mechanisms provided by each service and the Linux desktop. Disabling an account stops its page and unregisters service workers, the website tasks that run in the background. Cookies and stored site data, including the sign-in session, are kept.

Read more about [privacy](PRIVACY.md), [security and vulnerability reports](SECURITY.md), and [contributing](CONTRIBUTING.md).
