// Polish source strings are stable message keys; other columns: en, de, fr, es, it.
export const languages = ["en", "pl", "de", "fr", "es", "it"] as const;
export type Language = typeof languages[number];
export type LanguagePreference = Language | "auto";
export const languageNames: Record<Language, string> = { en: "English", pl: "Polski", de: "Deutsch", fr: "Français", es: "Español", it: "Italiano" };
export function languagePreference(value: unknown): LanguagePreference {
  if (value !== "auto" && !languages.includes(value as Language)) throw new Error("Niepoprawny język.");
  return value as LanguagePreference;
}
export function resolveLanguage(preference: LanguagePreference, systemLocale: string | readonly string[]): Language {
  if (preference !== "auto") return preference;
  for (const locale of typeof systemLocale === "string" ? [systemLocale] : systemLocale) {
    const base = locale.trim().toLowerCase().split(/[-_.@]/)[0];
    if (languages.includes(base as Language)) return base as Language;
  }
  return "en";
}
export const messages: Record<string, readonly [string, string, string, string, string]> = {
  "Konta": [
    "Accounts",
    "Konten",
    "Comptes",
    "Cuentas",
    "Account"
  ],
  "Konta komunikatorów": [
    "Messaging accounts",
    "Messenger-Konten",
    "Comptes de messagerie",
    "Cuentas de mensajería",
    "Account di messaggistica"
  ],
  "Dodaj pierwsze konto, aby rozpocząć rozmowy.": [
    "Add your first account to start chatting.",
    "Füge dein erstes Konto hinzu, um zu chatten.",
    "Ajoutez votre premier compte pour discuter.",
    "Añade tu primera cuenta para empezar a chatear.",
    "Aggiungi il tuo primo account per iniziare a chattare."
  ],
  "Dodaj konto": [
    "Add account",
    "Konto hinzufügen",
    "Ajouter un compte",
    "Añadir cuenta",
    "Aggiungi account"
  ],
  "Ustawienia": [
    "Settings",
    "Einstellungen",
    "Paramètres",
    "Ajustes",
    "Impostazioni"
  ],
  "Komunikatory": [
    "Messaging services",
    "Messenger",
    "Messageries",
    "Servicios de mensajería",
    "Servizi di messaggistica"
  ],
  "Odśwież konto (Ctrl+R)": [
    "Reload account (Ctrl+R)",
    "Konto neu laden (Ctrl+R)",
    "Recharger le compte (Ctrl+R)",
    "Recargar cuenta (Ctrl+R)",
    "Ricarica account (Ctrl+R)"
  ],
  "Odśwież": [
    "Reload",
    "Neu laden",
    "Recharger",
    "Recargar",
    "Ricarica"
  ],
  "Odśwież konto": [
    "Reload account",
    "Konto neu laden",
    "Recharger le compte",
    "Recargar cuenta",
    "Ricarica account"
  ],
  "Dodaj pierwsze konto": [
    "Add your first account",
    "Füge dein erstes Konto hinzu",
    "Ajoutez votre premier compte",
    "Añade tu primera cuenta",
    "Aggiungi il tuo primo account"
  ],
  "Wybierz komunikator i zaloguj się na jego stronie. Możesz dodać kilka kont tej samej usługi.": [
    "Choose a service and sign in on its website. You can add several accounts for the same service.",
    "Wähle einen Messenger und melde dich auf seiner Website an. Du kannst mehrere Konten desselben Dienstes hinzufügen.",
    "Choisissez une messagerie et connectez-vous sur son site. Vous pouvez ajouter plusieurs comptes du même service.",
    "Elige un servicio e inicia sesión en su web. Puedes añadir varias cuentas del mismo servicio.",
    "Scegli un servizio e accedi sul suo sito. Puoi aggiungere più account dello stesso servizio."
  ],
  "Obsługiwane komunikatory": [
    "Supported services",
    "Unterstützte Messenger",
    "Messageries prises en charge",
    "Servicios compatibles",
    "Servizi supportati"
  ],
  "Wiadomości Google": [
    "Google Messages",
    "Google Messages",
    "Google Messages",
    "Mensajes de Google",
    "Google Messaggi"
  ],
  "Każde konto ma własną sesję logowania na tym komputerze.": [
    "Each account has its own sign-in session on this computer.",
    "Jedes Konto hat eine eigene Anmeldesitzung auf diesem Computer.",
    "Chaque compte dispose de sa propre session sur cet ordinateur.",
    "Cada cuenta tiene su propia sesión en este ordenador.",
    "Ogni account ha la propria sessione di accesso su questo computer."
  ],
  "Ładowanie konta…": [
    "Loading account…",
    "Konto wird geladen…",
    "Chargement du compte…",
    "Cargando cuenta…",
    "Caricamento account…"
  ],
  "Spróbuj ponownie": [
    "Try again",
    "Erneut versuchen",
    "Réessayer",
    "Reintentar",
    "Riprova"
  ],
  "Zamknij": [
    "Close",
    "Schließen",
    "Fermer",
    "Cerrar",
    "Chiudi"
  ],
  "Operacja nie powiodła się.": [
    "The operation failed.",
    "Der Vorgang ist fehlgeschlagen.",
    "L’opération a échoué.",
    "La operación ha fallado.",
    "Operazione non riuscita."
  ],
  "wyciszone": [
    "muted",
    "stumm",
    "muet",
    "silenciado",
    "silenziato"
  ],
  "Nie można otworzyć konta": [
    "Unable to open account",
    "Konto kann nicht geöffnet werden",
    "Impossible d’ouvrir le compte",
    "No se puede abrir la cuenta",
    "Impossibile aprire l’account"
  ],
  "Połączenie z oficjalną stroną komunikatora.": [
    "Connecting to the service’s official website.",
    "Verbindung zur offiziellen Website des Messengers.",
    "Connexion au site officiel de la messagerie.",
    "Conectando con la web oficial del servicio.",
    "Connessione al sito ufficiale del servizio."
  ],
  "np. Prywatne lub Firma": [
    "e.g. Personal or Work",
    "z. B. Privat oder Arbeit",
    "ex. Personnel ou Travail",
    "p. ej., Personal o Trabajo",
    "es. Personale o Lavoro"
  ],
  "Dodaj": [
    "Add",
    "Hinzufügen",
    "Ajouter",
    "Añadir",
    "Aggiungi"
  ],
  "Komunikator": [
    "Service",
    "Messenger",
    "Messagerie",
    "Servicio",
    "Servizio"
  ],
  "Nazwa konta": [
    "Account name",
    "Kontoname",
    "Nom du compte",
    "Nombre de la cuenta",
    "Nome account"
  ],
  "Zalogujesz się bezpośrednio na oficjalnej stronie usługi. Każde dodane konto ma osobną sesję.": [
    "Sign in directly on the service’s official website. Each account has a separate session.",
    "Melde dich direkt auf der offiziellen Website des Dienstes an. Jedes Konto hat eine eigene Sitzung.",
    "Connectez-vous directement sur le site officiel du service. Chaque compte dispose d’une session distincte.",
    "Inicia sesión directamente en la web oficial del servicio. Cada cuenta tiene una sesión independiente.",
    "Accedi direttamente sul sito ufficiale del servizio. Ogni account ha una sessione separata."
  ],
  "Włączone konta działają również w tle. Wyłączenie usługi zachowuje indywidualne ustawienia jej kont.": [
    "Enabled accounts also run in the background. Turning off a service preserves its individual account settings.",
    "Aktivierte Konten laufen auch im Hintergrund. Beim Deaktivieren eines Dienstes bleiben die einzelnen Kontoeinstellungen erhalten.",
    "Les comptes activés fonctionnent aussi en arrière-plan. Désactiver un service conserve les paramètres de ses comptes.",
    "Las cuentas activadas también funcionan en segundo plano. Desactivar un servicio conserva los ajustes de cada cuenta.",
    "Gli account attivi funzionano anche in background. Disattivare un servizio mantiene le impostazioni dei singoli account."
  ],
  "Twoje konta": [
    "Your accounts",
    "Deine Konten",
    "Vos comptes",
    "Tus cuentas",
    "I tuoi account"
  ],
  "Nie masz jeszcze kont. Zacznij od przycisku „Dodaj konto”.": [
    "No accounts yet. Start with “Add account”.",
    "Noch keine Konten. Beginne mit „Konto hinzufügen“.",
    "Aucun compte pour le moment. Cliquez sur « Ajouter un compte ».",
    "Aún no tienes cuentas. Empieza con «Añadir cuenta».",
    "Non hai ancora account. Inizia con «Aggiungi account»."
  ],
  "Włączone": [
    "Enabled",
    "Aktiviert",
    "Activé",
    "Activada",
    "Attivo"
  ],
  "Wycisz dźwięk": [
    "Mute audio",
    "Ton stummschalten",
    "Couper le son",
    "Silenciar audio",
    "Disattiva audio"
  ],
  "Powiadomienia": [
    "Notifications",
    "Benachrichtigungen",
    "Notifications",
    "Notificaciones",
    "Notifiche"
  ],
  "Kolor konta {name}": [
    "Account color: {name}",
    "Kontofarbe: {name}",
    "Couleur du compte : {name}",
    "Color de la cuenta: {name}",
    "Colore account: {name}"
  ],
  "Zapisz": [
    "Save",
    "Speichern",
    "Enregistrer",
    "Guardar",
    "Salva"
  ],
  "Wyżej": [
    "Move up",
    "Nach oben",
    "Monter",
    "Subir",
    "Sposta su"
  ],
  "Niżej": [
    "Move down",
    "Nach unten",
    "Descendre",
    "Bajar",
    "Sposta giù"
  ],
  "Usuń…": [
    "Remove…",
    "Entfernen…",
    "Supprimer…",
    "Eliminar…",
    "Rimuovi…"
  ],
  "Usuwanie oczekuje na restart. W razie błędu możesz ponowić czyszczenie.": [
    "Removal is pending a restart. If it fails, you can retry cleanup.",
    "Die Entfernung wartet auf einen Neustart. Bei einem Fehler kannst du die Bereinigung wiederholen.",
    "La suppression attend un redémarrage. En cas d’erreur, vous pouvez réessayer le nettoyage.",
    "La eliminación está pendiente de reinicio. Si falla, puedes reintentar la limpieza.",
    "La rimozione è in attesa di un riavvio. In caso di errore puoi riprovare la pulizia."
  ],
  "Ponów usuwanie…": [
    "Retry removal…",
    "Entfernen erneut versuchen…",
    "Réessayer la suppression…",
    "Reintentar eliminación…",
    "Riprova rimozione…"
  ],
  "Zapisano": [
    "Saved",
    "Gespeichert",
    "Enregistré",
    "Guardado",
    "Salvato"
  ],
  "Zamykaj okno do zasobnika": [
    "Close window to tray",
    "Beim Schließen im Infobereich belassen",
    "Réduire dans la zone de notification à la fermeture",
    "Cerrar en la bandeja del sistema",
    "Riduci nell’area di notifica alla chiusura"
  ],
  "Pulpit Linux": [
    "Linux desktop",
    "Linux-Desktop",
    "Bureau Linux",
    "Escritorio Linux",
    "Desktop Linux"
  ],
  "Zakończ program przez menu zasobnika lub Ctrl+Q.": [
    "Quit using the tray menu or Ctrl+Q.",
    "Beende die App über das Menü im Infobereich oder mit Strg+Q.",
    "Quittez via le menu de la zone de notification ou Ctrl+Q.",
    "Sal mediante el menú de la bandeja o Ctrl+Q.",
    "Esci dal menu dell’area di notifica o con Ctrl+Q."
  ],
  "Nie wykryto dostępnego zasobnika. Zamknięcie okna kończy program.": [
    "No system tray detected. Closing the window quits the app.",
    "Kein Infobereich erkannt. Das Schließen des Fensters beendet die App.",
    "Aucune zone de notification détectée. Fermer la fenêtre quitte l’application.",
    "No se ha detectado una bandeja del sistema. Cerrar la ventana cierra la aplicación.",
    "Nessuna area di notifica rilevata. Chiudendo la finestra si esce dall’app."
  ],
  "Niezależny projekt. MonoChat nie jest powiązany z Meta ani Google. Powiadomienia korzystają z obsługi danej usługi i pulpitu; wskazanie konta i kliknięcie wymagają sprawdzenia w Twoim środowisku.": [
    "Independent project. MonoChat is not affiliated with Meta or Google. Notifications depend on the service and desktop; account attribution and click behavior need testing in your environment.",
    "Unabhängiges Projekt. MonoChat ist nicht mit Meta oder Google verbunden. Benachrichtigungen hängen vom Dienst und Desktop ab; Kontozuordnung und Klickverhalten müssen in deiner Umgebung getestet werden.",
    "Projet indépendant. MonoChat n’est affilié ni à Meta ni à Google. Les notifications dépendent du service et du bureau ; l’attribution au compte et le clic doivent être testés dans votre environnement.",
    "Proyecto independiente. MonoChat no está afiliado a Meta ni a Google. Las notificaciones dependen del servicio y del escritorio; la identificación de la cuenta y el clic deben probarse en tu entorno.",
    "Progetto indipendente. MonoChat non è affiliato a Meta o Google. Le notifiche dipendono dal servizio e dal desktop; l’attribuzione all’account e il clic vanno verificati nel tuo ambiente."
  ],
  "Zakończ MonoChat": [
    "Quit MonoChat",
    "MonoChat beenden",
    "Quitter MonoChat",
    "Salir de MonoChat",
    "Esci da MonoChat"
  ],
  "Brak połączenia z internetem. Konta spróbują połączyć się ponownie.": [
    "No internet connection. Accounts will try to reconnect.",
    "Keine Internetverbindung. Die Konten versuchen, sich erneut zu verbinden.",
    "Pas de connexion Internet. Les comptes tenteront de se reconnecter.",
    "Sin conexión a Internet. Las cuentas intentarán reconectarse.",
    "Nessuna connessione Internet. Gli account proveranno a riconnettersi."
  ],
  "Język aplikacji": [
    "Application language",
    "Sprache der App",
    "Langue de l’application",
    "Idioma de la aplicación",
    "Lingua dell’app"
  ],
  "Automatycznie (system: {language})": [
    "Automatic (system: {language})",
    "Automatisch (System: {language})",
    "Automatique (système : {language})",
    "Automático (sistema: {language})",
    "Automatico (sistema: {language})"
  ],
  "Zmiana działa od razu. Język stron komunikatorów ustawisz w poszczególnych usługach.": [
    "Changes apply immediately. Set the language of messaging websites in each service.",
    "Änderungen gelten sofort. Die Sprache der Messenger-Websites stellst du im jeweiligen Dienst ein.",
    "Le changement est immédiat. Réglez la langue des sites de messagerie dans chaque service.",
    "El cambio se aplica al instante. Configura el idioma de las webs de mensajería en cada servicio.",
    "La modifica è immediata. Imposta la lingua dei siti di messaggistica nei singoli servizi."
  ],
  "Otwórz MonoChat": [
    "Open MonoChat",
    "MonoChat öffnen",
    "Ouvrir MonoChat",
    "Abrir MonoChat",
    "Apri MonoChat"
  ],
  "Zakończ": [
    "Quit",
    "Beenden",
    "Quitter",
    "Salir",
    "Esci"
  ],
  "Usuń lokalne konto": [
    "Remove local account",
    "Lokales Konto entfernen",
    "Supprimer le compte local",
    "Eliminar cuenta local",
    "Rimuovi account locale"
  ],
  "Usunąć „{name}”?": [
    "Remove “{name}”?",
    "„{name}“ entfernen?",
    "Supprimer « {name} » ?",
    "¿Eliminar «{name}»?",
    "Rimuovere «{name}»?"
  ],
  "Zniknie lokalna sesja tego konta. Ponowne dodanie wymaga logowania. Konto w usłudze pozostanie. Usuwanie pozostałych plików zostanie dokończone przy następnym uruchomieniu.": [
    "This account’s local session will be removed. Adding it again requires signing in. Your account with the service will remain. Remaining files will be removed on the next start.",
    "Die lokale Sitzung dieses Kontos wird entfernt. Erneutes Hinzufügen erfordert eine Anmeldung. Dein Konto beim Dienst bleibt bestehen. Übrige Dateien werden beim nächsten Start entfernt.",
    "La session locale de ce compte sera supprimée. Un nouvel ajout nécessitera une connexion. Votre compte auprès du service sera conservé. Les fichiers restants seront supprimés au prochain démarrage.",
    "Se eliminará la sesión local de esta cuenta. Para volver a añadirla tendrás que iniciar sesión. Tu cuenta en el servicio se conservará. Los archivos restantes se eliminarán en el próximo inicio.",
    "La sessione locale di questo account verrà rimossa. Per aggiungerlo di nuovo dovrai accedere. L’account presso il servizio rimarrà. I file rimanenti saranno rimossi al prossimo avvio."
  ],
  "Anuluj": [
    "Cancel",
    "Abbrechen",
    "Annuler",
    "Cancelar",
    "Annulla"
  ],
  "Usuń lokalne dane": [
    "Remove local data",
    "Lokale Daten entfernen",
    "Supprimer les données locales",
    "Eliminar datos locales",
    "Rimuovi dati locali"
  ],
  "Uprawnienie konta": [
    "Account permission",
    "Kontoberechtigung",
    "Autorisation du compte",
    "Permiso de la cuenta",
    "Autorizzazione account"
  ],
  "{name}: zezwolić na {permission}?": [
    "{name}: allow {permission}?",
    "{name}: {permission} erlauben?",
    "{name} : autoriser {permission} ?",
    "{name}: ¿permitir {permission}?",
    "{name}: consentire {permission}?"
  ],
  "mikrofon i kamerę": [
    "microphone and camera access",
    "Mikrofon- und Kamerazugriff",
    "l’accès au microphone et à la caméra",
    "el acceso al micrófono y a la cámara",
    "l’accesso a microfono e fotocamera"
  ],
  "odczyt schowka": [
    "reading the clipboard",
    "Lesen der Zwischenablage",
    "la lecture du presse-papiers",
    "la lectura del portapapeles",
    "la lettura degli appunti"
  ],
  "zapis do schowka": [
    "writing to the clipboard",
    "Schreiben in die Zwischenablage",
    "l’écriture dans le presse-papiers",
    "la escritura en el portapapeles",
    "la scrittura negli appunti"
  ],
  "pełny ekran": [
    "fullscreen",
    "Vollbild",
    "le plein écran",
    "la pantalla completa",
    "lo schermo intero"
  ],
  "Odmów": [
    "Deny",
    "Ablehnen",
    "Refuser",
    "Denegar",
    "Nega"
  ],
  "Zezwól": [
    "Allow",
    "Erlauben",
    "Autoriser",
    "Permitir",
    "Consenti"
  ],
  "Brak połączenia z internetem.": [
    "No internet connection.",
    "Keine Internetverbindung.",
    "Pas de connexion Internet.",
    "Sin conexión a Internet.",
    "Nessuna connessione Internet."
  ],
  "Nie udało się otworzyć usługi (kod {code}).": [
    "Could not open the service (code {code}).",
    "Der Dienst konnte nicht geöffnet werden (Code {code}).",
    "Impossible d’ouvrir le service (code {code}).",
    "No se ha podido abrir el servicio (código {code}).",
    "Impossibile aprire il servizio (codice {code})."
  ],
  "Widok konta został zatrzymany. Spróbuj ponownie.": [
    "The account view stopped. Try again.",
    "Die Kontoansicht wurde angehalten. Versuche es erneut.",
    "La vue du compte s’est arrêtée. Réessayez.",
    "La vista de la cuenta se ha detenido. Inténtalo de nuevo.",
    "La vista dell’account si è arrestata. Riprova."
  ],
  "Nie udało się załadować usługi. Sprawdź połączenie i ponów próbę.": [
    "Could not load the service. Check your connection and try again.",
    "Der Dienst konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.",
    "Impossible de charger le service. Vérifiez votre connexion et réessayez.",
    "No se ha podido cargar el servicio. Comprueba la conexión y reinténtalo.",
    "Impossibile caricare il servizio. Controlla la connessione e riprova."
  ],
  "Nie można otworzyć przeglądarki systemowej.": [
    "Unable to open the system browser.",
    "Der Systembrowser kann nicht geöffnet werden.",
    "Impossible d’ouvrir le navigateur système.",
    "No se puede abrir el navegador del sistema.",
    "Impossibile aprire il browser di sistema."
  ],
  "Zapisz załącznik — {name}": [
    "Save attachment — {name}",
    "Anhang speichern — {name}",
    "Enregistrer la pièce jointe — {name}",
    "Guardar archivo adjunto — {name}",
    "Salva allegato — {name}"
  ],
  "Pobieranie zostało przerwane.": [
    "The download was interrupted.",
    "Der Download wurde unterbrochen.",
    "Le téléchargement a été interrompu.",
    "La descarga se ha interrumpido.",
    "Il download è stato interrotto."
  ],
  "Ponów pobranie załącznika w komunikatorze.": [
    "Download the attachment again in the service.",
    "Lade den Anhang im Messenger erneut herunter.",
    "Relancez le téléchargement dans la messagerie.",
    "Vuelve a descargar el archivo adjunto en el servicio.",
    "Scarica di nuovo l’allegato nel servizio."
  ],
  "Niepoprawny język.": [
    "Invalid language.",
    "Ungültige Sprache.",
    "Langue non valide.",
    "Idioma no válido.",
    "Lingua non valida."
  ],
  "Niepoprawny identyfikator konta.": [
    "Invalid account ID.",
    "Ungültige Konto-ID.",
    "Identifiant de compte non valide.",
    "Identificador de cuenta no válido.",
    "ID account non valido."
  ],
  "Niepoprawne dane.": [
    "Invalid data.",
    "Ungültige Daten.",
    "Données non valides.",
    "Datos no válidos.",
    "Dati non validi."
  ],
  "Niepoprawna wartość logiczna.": [
    "Invalid boolean value.",
    "Ungültiger Wahrheitswert.",
    "Valeur booléenne non valide.",
    "Valor booleano no válido.",
    "Valore booleano non valido."
  ],
  "Nieznana usługa.": [
    "Unknown service.",
    "Unbekannter Dienst.",
    "Service inconnu.",
    "Servicio desconocido.",
    "Servizio sconosciuto."
  ],
  "Nazwa musi mieć od 1 do 80 znaków.": [
    "The name must contain 1 to 80 characters.",
    "Der Name muss 1 bis 80 Zeichen enthalten.",
    "Le nom doit contenir de 1 à 80 caractères.",
    "El nombre debe tener entre 1 y 80 caracteres.",
    "Il nome deve contenere da 1 a 80 caratteri."
  ],
  "Niepoprawny kolor.": [
    "Invalid color.",
    "Ungültige Farbe.",
    "Couleur non valide.",
    "Color no válido.",
    "Colore non valido."
  ],
  "Niepoprawna liczba.": [
    "Invalid number.",
    "Ungültige Zahl.",
    "Nombre non valide.",
    "Número no válido.",
    "Numero non valido."
  ],
  "Nieobsługiwana wersja konfiguracji. Dane pozostają na dysku.": [
    "Unsupported configuration version. Data remains on disk.",
    "Nicht unterstützte Konfigurationsversion. Die Daten bleiben auf der Festplatte.",
    "Version de configuration non prise en charge. Les données restent sur le disque.",
    "Versión de configuración no compatible. Los datos permanecen en el disco.",
    "Versione della configurazione non supportata. I dati rimangono sul disco."
  ],
  "Niepoprawna lista kont.": [
    "Invalid account list.",
    "Ungültige Kontoliste.",
    "Liste de comptes non valide.",
    "Lista de cuentas no válida.",
    "Elenco account non valido."
  ],
  "Powtórzony identyfikator konta.": [
    "Duplicate account ID.",
    "Doppelte Konto-ID.",
    "Identifiant de compte en double.",
    "Identificador de cuenta duplicado.",
    "ID account duplicato."
  ],
  "Powtórzone zadanie usuwania.": [
    "Duplicate removal task.",
    "Doppelter Löschauftrag.",
    "Tâche de suppression en double.",
    "Tarea de eliminación duplicada.",
    "Operazione di rimozione duplicata."
  ],
  "Wybrane konto nie istnieje.": [
    "The selected account does not exist.",
    "Das ausgewählte Konto existiert nicht.",
    "Le compte sélectionné n’existe pas.",
    "La cuenta seleccionada no existe.",
    "L’account selezionato non esiste."
  ],
  "Nieznane polecenie.": [
    "Unknown command.",
    "Unbekannter Befehl.",
    "Commande inconnue.",
    "Comando desconocido.",
    "Comando sconosciuto."
  ],
  "Konto nie istnieje.": [
    "The account does not exist.",
    "Das Konto existiert nicht.",
    "Le compte n’existe pas.",
    "La cuenta no existe.",
    "L’account non esiste."
  ],
  "Dokończ usuwanie konta przed jego zmianą.": [
    "Finish removing the account before changing it.",
    "Schließe die Entfernung des Kontos ab, bevor du es änderst.",
    "Terminez la suppression du compte avant de le modifier.",
    "Termina de eliminar la cuenta antes de modificarla.",
    "Completa la rimozione dell’account prima di modificarlo."
  ],
  "Pulpit nie udostępnia zasobnika. Okno będzie zamykać aplikację.": [
    "No system tray is available. Closing the window will quit the app.",
    "Kein Infobereich verfügbar. Das Schließen des Fensters beendet die App.",
    "Aucune zone de notification disponible. Fermer la fenêtre quittera l’application.",
    "No hay bandeja del sistema disponible. Cerrar la ventana cerrará la aplicación.",
    "Area di notifica non disponibile. Chiudendo la finestra si uscirà dall’app."
  ],
  "Niepoprawna kolejność kont.": [
    "Invalid account order.",
    "Ungültige Kontoreihenfolge.",
    "Ordre des comptes non valide.",
    "Orden de cuentas no válido.",
    "Ordine degli account non valido."
  ],
  "Konto jest wyłączone.": [
    "The account is disabled.",
    "Das Konto ist deaktiviert.",
    "Le compte est désactivé.",
    "La cuenta está desactivada.",
    "L’account è disattivato."
  ],
  "Wyczyszczono dane strony. Usunięcie katalogu konta oczekuje na ponowne uruchomienie MonoChat.": [
    "Website data cleared. The account directory will be removed when MonoChat restarts.",
    "Website-Daten gelöscht. Der Kontoordner wird beim Neustart von MonoChat entfernt.",
    "Données du site effacées. Le dossier du compte sera supprimé au redémarrage de MonoChat.",
    "Datos del sitio borrados. La carpeta de la cuenta se eliminará al reiniciar MonoChat.",
    "Dati del sito cancellati. La cartella dell’account sarà rimossa al riavvio di MonoChat."
  ],
  "Nie udało się dokończyć czyszczenia. Konto jest zatrzymane. Ponów usuwanie lub uruchom aplikację ponownie.": [
    "Cleanup could not be completed. The account is stopped. Retry removal or restart the app.",
    "Die Bereinigung konnte nicht abgeschlossen werden. Das Konto ist angehalten. Wiederhole die Entfernung oder starte die App neu.",
    "Le nettoyage n’a pas pu être terminé. Le compte est arrêté. Réessayez la suppression ou redémarrez l’application.",
    "No se ha podido completar la limpieza. La cuenta está detenida. Reintenta la eliminación o reinicia la aplicación.",
    "Impossibile completare la pulizia. L’account è arrestato. Riprova la rimozione o riavvia l’app."
  ],
  "Nie udało się usunąć katalogu konta. Konto pozostaje zablokowane; ponów usuwanie w ustawieniach.": [
    "Could not remove the account directory. The account remains blocked; retry removal in settings.",
    "Der Kontoordner konnte nicht entfernt werden. Das Konto bleibt gesperrt; wiederhole die Entfernung in den Einstellungen.",
    "Impossible de supprimer le dossier du compte. Le compte reste bloqué ; réessayez dans les paramètres.",
    "No se ha podido eliminar la carpeta de la cuenta. La cuenta sigue bloqueada; reintenta la eliminación en los ajustes.",
    "Impossibile rimuovere la cartella dell’account. L’account rimane bloccato; riprova nelle impostazioni."
  ],
  "Niedozwolony nadawca.": [
    "Unauthorized sender.",
    "Unzulässiger Absender.",
    "Expéditeur non autorisé.",
    "Remitente no autorizado.",
    "Mittente non autorizzato."
  ],
  "Nie udało się zapisać wszystkich danych przed zakończeniem.": [
    "Could not save all data before quitting.",
    "Vor dem Beenden konnten nicht alle Daten gespeichert werden.",
    "Impossible d’enregistrer toutes les données avant de quitter.",
    "No se han podido guardar todos los datos antes de salir.",
    "Impossibile salvare tutti i dati prima di uscire."
  ],
  "Sprawdź wolne miejsce i uprawnienia katalogu MonoChat.": [
    "Check free disk space and MonoChat folder permissions.",
    "Prüfe den freien Speicherplatz und die Berechtigungen des MonoChat-Ordners.",
    "Vérifiez l’espace disque et les autorisations du dossier MonoChat.",
    "Comprueba el espacio libre y los permisos de la carpeta MonoChat.",
    "Controlla lo spazio libero e i permessi della cartella MonoChat."
  ],
  "Błąd uruchomienia.": [
    "Startup error.",
    "Startfehler.",
    "Erreur au démarrage.",
    "Error de inicio.",
    "Errore di avvio."
  ],
  "Konfiguracja pochodzi z nowszej wersji MonoChat. Zaktualizuj aplikację.": [
    "The configuration is from a newer MonoChat version. Update the app.",
    "Die Konfiguration stammt aus einer neueren MonoChat-Version. Aktualisiere die App.",
    "La configuration provient d’une version plus récente de MonoChat. Mettez l’application à jour.",
    "La configuración procede de una versión más reciente de MonoChat. Actualiza la aplicación.",
    "La configurazione proviene da una versione più recente di MonoChat. Aggiorna l’app."
  ],
  "Odtworzono ostatnią poprawną konfigurację. Dane sesji pozostały na dysku.": [
    "The last valid configuration was restored. Session data remains on disk.",
    "Die letzte gültige Konfiguration wurde wiederhergestellt. Sitzungsdaten bleiben auf der Festplatte.",
    "La dernière configuration valide a été restaurée. Les données de session restent sur le disque.",
    "Se ha restaurado la última configuración válida. Los datos de sesión permanecen en el disco.",
    "È stata ripristinata l’ultima configurazione valida. I dati di sessione rimangono sul disco."
  ],
  "Nie można odczytać konfiguracji ani kopii. Zachowano wszystkie dane. Przywróć config.json z kopii przed uruchomieniem.": [
    "Cannot read the configuration or backup. All data is preserved. Restore config.json from a backup before starting.",
    "Konfiguration und Sicherung können nicht gelesen werden. Alle Daten bleiben erhalten. Stelle config.json vor dem Start aus einer Sicherung wieder her.",
    "Impossible de lire la configuration ou sa sauvegarde. Toutes les données sont conservées. Restaurez config.json depuis une sauvegarde avant de démarrer.",
    "No se puede leer la configuración ni su copia. Se han conservado todos los datos. Restaura config.json desde una copia antes de iniciar.",
    "Impossibile leggere la configurazione o la copia di backup. Tutti i dati sono conservati. Ripristina config.json da un backup prima di avviare."
  ],
  "Uszkodzony dziennik usuwania. Dane zachowano.": [
    "Corrupt removal journal. Data is preserved.",
    "Beschädigtes Löschprotokoll. Die Daten bleiben erhalten.",
    "Journal de suppression corrompu. Les données sont conservées.",
    "Registro de eliminación dañado. Los datos se han conservado.",
    "Registro di rimozione danneggiato. I dati sono conservati."
  ],
  "Niebezpieczna ścieżka partycji.": [
    "Unsafe partition path.",
    "Unsicherer Partitionspfad.",
    "Chemin de partition non sûr.",
    "Ruta de partición insegura.",
    "Percorso della partizione non sicuro."
  ],
  "Niebezpieczna ścieżka konta.": [
    "Unsafe account path.",
    "Unsicherer Kontopfad.",
    "Chemin de compte non sûr.",
    "Ruta de cuenta insegura.",
    "Percorso dell’account non sicuro."
  ]
};
const columns: Record<Exclude<Language, "pl">, number> = { en: 0, de: 1, fr: 2, es: 3, it: 4 };
export function translate(language: Language, source: string, params: Record<string, string | number> = {}): string {
  const text = language === "pl" ? source : messages[source]?.[columns[language]] ?? source;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => String(params[key] ?? match));
}
