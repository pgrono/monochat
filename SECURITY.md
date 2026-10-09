# Security

This is an unvalidated development version. No security support promise is made for the initial source snapshot. Report potential vulnerabilities privately to piotr@strony.olsztyn.pl. Do not put sensitive evidence into public issues; GitHub private vulnerability reporting may also be used if enabled.

Remote service WebContentsViews use sandbox, context isolation and web security with Node integration disabled. They have no preload. Login popups inherit the owning session and the same restrictions. Only the main frame of the exact local renderer can use the command IPC channel. Main-process validation reconstructs accepted command fields and rejects invalid UUIDs, services and settings. Local content has a restrictive CSP and uses DOM text APIs.

Navigation uses exact HTTPS host matches. External URLs must be HTTP(S), without embedded credentials. Permissions are associated with the account and official origin; microphone/camera/clipboard/fullscreen require an explicit prompt. Unsupported permissions and device access are denied. Permission decisions are kept only for the active runtime. Notification permission follows that instance's visible setting.

Destructive operations use generated UUIDs, never user labels, and refuse symlinked partition paths. A separate journal survives configuration recovery. No broad userData deletion exists in production code.

Completed checks include compilation against Electron 44.7.0 typings, runtime IPC rejection, controlled session isolation, popup inheritance and worker termination. Outstanding acceptance work includes native notification withdrawal, media permission behavior, authenticated service flows, and distro/installed-package sandbox checks. See docs/TESTING.md. Unit tests are not a replacement for these checks.

Do not fix packaging failures by adding `--no-sandbox`, ignoring certificate errors, enabling Node integration or granting all permissions. Preserve Electron/Chromium license and notice files in binary distributions.
