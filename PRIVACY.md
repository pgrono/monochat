# Privacy / Prywatność

MonoChat has no application backend, telemetry, analytics, account registration or cloud synchronization. Enabled service pages connect directly to their providers and their third parties. Those providers' terms and privacy policies apply.

Each account stores its own Chromium session in Electron's application userData directory. Cookies, IndexedDB, localStorage, caches and authentication state can contain sensitive data and allow access to accounts. MonoChat does not promise encryption of all session data. Protect the operating-system account and disk. Passwords are entered into official service pages, not application forms; MonoChat does not read password fields or maintain a separate message database.

Configuration includes names, UUIDs, order, enabled flags, sound/notification settings and window geometry. A backup and deletion journal are kept locally. Removal clears site data and queues the partition directory for removal at next startup. Previously saved attachments are not removed. Native desktop notifications may remain in system notification history after an account is disabled or removed; withdrawal has not been verified.

No diagnostic upload exists. Do not include session directories, QR codes, cookies, screenshots of conversations or URL tokens in bug reports. The application does not intentionally log these values. Chromium may produce its own stderr diagnostics; review any terminal capture before sharing.

Po polsku: aplikacja nie ma telemetrii ani własnego serwera. Strony komunikatorów łączą się z dostawcami usług. Sesje zapisują się lokalnie i są wrażliwe; nie obiecujemy ich pełnego szyfrowania. Usunięcie konta czyści dane strony, a katalog sesji znika po restarcie. Twoje zapisane załączniki i historia powiadomień systemowych nie są automatycznie kasowane.
