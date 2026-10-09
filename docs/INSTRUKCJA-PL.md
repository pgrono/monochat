# MonoChat — instrukcja

Stan: 9 października 2026. Aplikacja uruchamia się w Electron. Powstały paczki AppImage i deb, a testy mechanizmów izolacji przeszły. Sprawdzono ekrany logowania wszystkich usług, w tym parowanie WhatsApp. Rozmowy na prawdziwych kontach i publikacja nadal oczekują na weryfikację. [Wyniki testów](TESTING.md).

## Uruchomienie ze źródeł

Potrzebujesz Linux x86_64, Node.js 24, npm, połączenia z npm/GitHub oraz sesji graficznej. W tym projekcie wykonaj `nvm use` (jeśli korzystasz z nvm), następnie `npm ci` i `npm run dev`. Lockfile jest już zapisany, a instalacja pobiera również binarkę Electron.

Kontrole: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:electron`. Budowanie: `npm run build`; pakowanie: `npm run dist`.

Lokalne paczki: `release/MonoChat-0.1.0.AppImage` oraz `release/monochat_0.1.0_amd64.deb`. Identyfikator to `io.github.pgrono.monochat`; witryna to `https://strony.olsztyn.pl/monochat`. Autor i opiekun: Piotr Grono, piotr@strony.olsztyn.pl. Paczki nie są publicznym wydaniem. Można też uruchomić `release/linux-unpacked/monochat`. Nigdy nie dodawaj `--no-sandbox`.

Na tym komputerze dodano do menu skrót **MonoChat**, wskazujący lokalną wersję `release/linux-unpacked/monochat`. Po zmianie katalogu projektu skrót wymaga aktualizacji.

## Konta

1. Kliknij **Dodaj konto**, wybierz komunikator i wpisz własną nazwę, np. „Prywatne” lub „Firma”.
2. Kliknij **Dodaj**. Zaloguj się lub sparuj urządzenie na oficjalnej stronie. Hasło, kod QR i 2FA obsługujesz samodzielnie.
3. Dodaj kolejne konto w ten sam sposób. Każda instancja otrzymuje oddzielną sesję, także w obrębie jednego komunikatora.
4. Wybieraj konto na lewym pasku. Włączone konta mają pozostać uruchomione w tle.

Dodanie konta do wyłączonej globalnie usługi włącza tę usługę i przywraca jej wcześniej aktywne instancje.

W **Ustawieniach** zmienisz nazwę, kolor, aktywność, wyciszenie i powiadomienia. Zmiany pojedynczego konta zatwierdź przyciskiem **Zapisz**. Przełączniki usług działają od razu; zachowują indywidualne ustawienia aktywności. Kolejność zmienisz przeciąganiem na pasku lub przyciskami **Wyżej / Niżej** w ustawieniach.

## Wyłączanie i usuwanie

Wyłączenie zamyka stronę i jej okna pomocnicze, anuluje pobierania, blokuje sieć i uprawnienia tej instancji oraz usuwa rejestracje workerów działających w tle. Cookies i pozostałe dane logowania zostają. Ponowne włączenie otwiera tę samą partycję; zachowanie rzeczywistych usług wymaga testu.

**Usuń…** wymaga potwierdzenia z nazwą konta. Dane strony są czyszczone, a katalog partycji usuwany przed otwarciem sesji przy następnym starcie. Do restartu ustawienia pokazują oczekujące usuwanie. Błąd nie jest raportowany jako sukces. Usunięcie instancji nie usuwa konta w WhatsApp, Meta czy Google. Pobrane i zapisane przez Ciebie załączniki pozostają w wybranych katalogach.

## Pulpit i skróty

Ctrl+N — dodaj konto; Ctrl+, — ustawienia; Ctrl+R — ponownie otwórz bieżącą usługę; Ctrl+Q — zakończ; Esc — zamknij lokalne okno dialogowe.

Zamykanie do zasobnika jest domyślnie wyłączone. Możesz je włączyć tylko po wykryciu hosta zasobnika. Jeżeli host przestanie działać, zamknięcie okna zakończy aplikację. Nie ma autostartu.

## Dane i ograniczenia

Dane znajdują się w katalogu wyznaczonym przez Electron `userData` dla MonoChat. Nie zmieniaj identyfikatorów kont ani nazw katalogów partycji ręcznie. Nie publikuj tego katalogu ani nie dołączaj go do zgłoszeń błędów. Pełne szyfrowanie danych sesji nie jest zaimplementowane.

Google Messages wymaga telefonu i konta zgodnie z zasadami Google. Instagram otwiera Direct, lecz pozostałe menu oficjalnej strony może nadal być widoczne. Powiadomienia, przypisanie kliknięcia do konta, załączniki oraz rozmowy głosowe/wideo pozostają niezweryfikowane. Nie ma automatycznych aktualizacji AppImage/deb — zastępujesz paczkę nowszym wydaniem. Flatpak i Snap mają korzystać z aktualizacji swoich platform.

Licencja kodu: **MIT**. Instalator Zorina może pokazywać „Nieznana licencja” dla lokalnego deb z powodu ograniczenia PackageKit; licencja jest zapisana w paczce oraz metadanych AppStream.

## Język aplikacji

W **Ustawienia → Język aplikacji** wybierz **Automatycznie** albo English, Polski, Deutsch, Français, Español lub Italiano. Domyślnie MonoChat wybiera pierwszy obsługiwany język z ustawień systemowych; jeśli żadnego nie obsługuje, używa angielskiego. Ręczna zmiana działa od razu i jest zapamiętywana po restarcie. Powrót do Automatycznie przywraca wybór systemowy. Nazwy Twoich kont oraz ich sesje pozostają bez zmian. Język stron komunikatorów zmieniasz w samych usługach.


## Slack i Gmail

W formularzu „Dodaj konto” wybierz Slack lub Gmail i nadaj własną nazwę. Slack otwiera logowanie przez e-mail lub adres przestrzeni roboczej; Gmail otwiera logowanie Google. Każda dodana instancja ma odrębną sesję. Konta można wyłączać, wyciszać i usuwać tak samo jak pozostałe usługi.

Google może ograniczyć logowanie w osadzonej przeglądarce. Firmowe SSO Slacka kierujące do własnej domeny organizacji nie jest obecnie potwierdzone. Zakres wykonanej weryfikacji opisuje TESTING.md.
