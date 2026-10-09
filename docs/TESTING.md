# Test report — 2026-10-09

Host: Zorin OS 18.1 (Ubuntu noble family), Linux x86_64, kernel 7.0.0-34-generic, Wayland desktop session. Node 24.21.0, npm 11.18.0, Electron 44.7.0 / Chromium 152.0.7977.130. Earlier offline-only results are superseded by the runtime evidence below. Chromium sandbox remained enabled throughout.

## Executed

| Check | Result / scope |
| --- | --- |
| Clean dependency installation | `npm ci` passed with the real lockfile and explicit `install-electron` postinstall. No project-local Playwright dependency added |
| Typecheck, lint, build | Full `npm run typecheck`, `npm run lint`, `npm run build` passed |
| Core tests | `npm test`: 12 passed, covering UUID partitions, config persistence/backup/corruption, deletion journal, scoped removal/symlinks, malformed config/IPC, navigation and lifecycle |
| Electron session test | `npm run test:electron`: write and restart/read processes passed using disposable profiles and controlled HTTPS responses |
| Session isolation | Separate cookies, localStorage and IndexedDB; persistent cookies/storage after process restart; rename/switch retain WebContents without navigation; disable destroys it, enable reuses session; deletion leaves the other account intact |
| Popup / worker isolation | Same-session popup without Node/app bridge; popup destroyed and running service workers removed on disable; registrations absent after enable |
| Remote capabilities | `require`, `process` and `window.monochat` absent; disabled notifications return denied. No `--no-sandbox` flag |
| Actual UI with shared Playwright | Empty state, add four accounts, modal hides service views, settings, invalid IPC rejected; screenshots from real Electron. No horizontal page overflow at 760×500 |
| Accessibility | axe on real Electron empty screen and settings: zero detected violations (legacy mode required because Electron lacks CDP Target.createTarget). This does not certify full accessibility |
| Service entry screens | WhatsApp QR pairing instructions, Messenger Facebook login form, Instagram login form, Google Messages welcome/sign-in page, all inside Electron |
| Build artifacts | AppImage (~120 MiB) and deb (~95 MiB) generated; deb metadata inspected; asar excludes tests, profiles, cookies and secrets |
| Desktop identity | Packaged binary: `app.getName()` and window title are MonoChat; Xprop confirms `_NET_WM_NAME=MonoChat`, `WM_CLASS=local.monochat.MonoChat`. Matching launcher/icon installed locally |

The initial WhatsApp request showed “WhatsApp works with Google Chrome 100+”. Removing only Electron/MonoChat product tokens from that session's User-Agent produced the QR login screen on the same bundled Chromium. Actual browser/platform versions and security settings are retained. Other services' User-Agents are unchanged.

The session fixture was repaired before execution: JavaScript storage key/value literals had been missing quotes. It now also tests a controlled popup and real service-worker registration. The Electron run sometimes prints an NSS root-certificate warning; the four HTTPS entry pages loaded without ignoring certificate errors.

Screenshots: `electron-empty.png`, `electron-settings.png`. They show anonymous local test accounts, no conversations or login QR. Older `interface-preview.png` is a historical renderer-only preview.

## Repeat UI checks

Use the existing shared Playwright/axe installation. Do not install temporary copies. On this workstation:

```sh
MONOCHAT_PLAYWRIGHT_MODULE=/home/piotr/Soft/playwright/node_modules/playwright \
MONOCHAT_AXE_MODULE=/home/piotr/Soft/playwright/node_modules/@axe-core/playwright \
node tests/electron-ui.cjs
```

The optional script uses a fresh disposable profile and contacts real service entry pages. Set `MONOCHAT_EXECUTABLE` to a packaged binary to test that artifact. It can open windows: use an isolated desktop for future runs, not the owner's working desktop. The benchmark now creates hidden windows after the owner reported distracting test-window flicker.

## Remaining acceptance

All authenticated scenarios below are **pending**, for all four services:

- Successful login, QR pairing completion, 2FA and re-authentication.
- Send/receive text and attachments; upload/download cancellation.
- Restart preserves real login; real service reconnects after disable.
- Native notification label and click route to the right account; withdrawal of existing notifications, sound and mute.
- Two real WhatsApp accounts simultaneously. Controlled-session isolation does not establish this.
- Camera/microphone approval, clipboard and calls/video.
- Detailed hostile IPC sender tests, popup redirects across official identity providers and frame permission tests.

The owner authenticates directly in each official service. Never send credentials, QR codes or tokens to an agent.

## Packaging / desktop acceptance

The actual AppImage executable passed the complete UI script under isolated Xvfb, with sandbox enabled and all four real entry pages. The deb was extracted with `dpkg-deb -x` into a disposable staging root; its `/opt/MonoChat/monochat` passed the same UI/axe checks and X11 identity assertions. This validates both packaged application payloads, but does not test apt installation hooks or an upgrade. No Xvfb package was installed system-wide: the distro package was downloaded and extracted under `/tmp`. Xvfb avoided further test-window flicker on the owner's desktop.

Still verify system-installed deb and AppImage mount/FUSE, Ubuntu LTS and Fedora, X11 and native Wayland/Xwayland, portals, tray host loss, monitor changes and upgrades. This Zorin test is not a Fedora or separate Ubuntu certification. Flatpak and Snap recipes remain unbuilt development candidates; no store submission occurred.

Native notifications use the service implementation, without DOM scraping or duplicated message notifications. Reliable per-account notification identity/click handling and removal of already displayed notifications are unresolved. Google can reject embedded login after the initial welcome page. Instagram starts at Direct and redirects its root back to Direct; the remaining native navigation is not hidden.

## Resource measurements

AMD Ryzen 9 7940HS, 16 logical CPUs, 29.15 GiB physical RAM, the Zorin Wayland session above. Anonymous live entry pages; 20-second warmup, five samples two seconds apart. All instances reported ready. Summed process working sets can count shared pages multiple times; these are not private-memory figures or a logged-in conversation workload. Normal desktop activity/build work was also present. CPU averages exclude the first baseline sample (zero).

| Instances | Mean summed working set | Mean summed Electron CPU |
| --- | ---: | ---: |
| 1 WhatsApp | 1100 MiB | 0.195% |
| 4 (one of each service) | 1792 MiB | 0.140% |
| 8 (two of each service) | 2745 MiB | 0.195% |

Raw samples and environment: `docs/benchmarks/{1,4,8}.json`. Working sets show that multiple full web clients have a material memory cost; no constant low-memory guarantee is made. Repeat with real authenticated accounts before making performance claims.

## Icon and package metadata follow-up (2026-10-09)

Generated a replacement MonoChat master using the built-in image tool and exported alpha-preserving icon sizes. The owner-provided homepage is `http://prestaaddons.com/monochat`, with planned source at `https://github.com/pgrono/monochat`. Desktop identity is now `io.github.pgrono.monochat`; userData and account UUIDs are unchanged.

Rebuilt AppImage/deb. The extracted final deb payload again passed the shared Playwright/axe test on isolated Xvfb; Xprop confirmed the new WM_CLASS and MonoChat title. AppStream validation passed with only the informational HTTP-homepage warning. Desktop validation passed. The deb includes `/usr/share/metainfo/io.github.pgrono.monochat.metainfo.xml` and `/usr/share/doc/monochat/copyright`; control fields are `License: MIT` and the requested homepage.

A read-only query to the installed PackageKit returned `license: unknown` and the correct project URL. This matches its APT backend source, which hardcodes `unknown`, so the local-file installer license tile remains a system limitation. MIT is additionally stated in the package's description; no system package manager modification was made.

The public maintainer email has not been supplied. The `.invalid` placeholder remains only in that contact field, and release preflight continues to reject it. No GitHub repository or store submission was created.

### 2026-10-09: compact sidebar and purple icon

Rebuilt AppImage/deb after changing the sidebar from 248 to 208px and generating a purple angular M icon. Build and lint passed. The extracted deb executable passed the shared Playwright test on Xvfb, including explicit sidebar width and service-view alignment assertions, four anonymous login screens, dialogs and 760×500 layout. Axe reported no violations on the empty/settings screens. Desktop icon cache and screenshots were refreshed. This was not a system installation or authenticated messaging test.

### 2026-10-09: final 154px sidebar and monochrome icon

Build and lint passed. Packaged linux-unpacked executable passed the Xvfb UI test with 154px sidebar, no sidebar/brand overflow, matching service-view bounds and four anonymous login screens. Axe: no violations. Final black-and-white icon screenshots refreshed, AppImage/deb rebuilt and checksums updated. No authenticated account test or system-wide deb installation.

### 2026-10-09: six-language UI

15 unit tests passed, including locale matching (regional/POSIX tags and preferred-language ordering), unsupported-language fallback, legacy migration, strict IPC, preference persistence and completeness/interpolation checks for all translations. Type checking, lint and packaging passed.

`tests/electron-i18n.cjs` passed on Xvfb with both development Electron and the final `release/linux-unpacked/monochat`: EN/PL/DE/FR/ES/IT settings and add form, application menu, intercepted/cancelled native removal prompt, account-name/UUID preservation and zero axe violations. Three launches confirmed system-French automatic selection, persistence of manual Italian under a German system language, returning to automatic German and English fallback for Japanese. The test uses a disposable profile with an inactive sample account; no private data or real removal.

The final packaged UI test also confirmed that switching PL → DE → PL preserves webContents IDs and page performance.timeOrigin across four live anonymous services. No reload occurred. Updated screenshots and AppImage/deb checksums. No new system-wide deb installation or authenticated messaging tests.

Run the language test using the shared Playwright/axe module paths and Xvfb, as for `tests/electron-ui.cjs`, substituting `tests/electron-i18n.cjs`. `MONOCHAT_EXECUTABLE` optionally selects the packaged binary.


## Slack and Gmail — 2026-10-09

New adapters use https://slack.com/signin and https://mail.google.com/mail/u/0/. Confirmed the official Slack email/workspace entry screen and Gmail Google Account sign-in form in Electron 44.7.0 with the normal User-Agent and sandbox enabled. Two anonymous accounts of each service were opened in independent persistent sessions. UI selection, separate cookies, switching without view replacement, global Slack pause/resume, six service choices and compact layout passed; axe reported no violations in Settings. `tests/electron-services.cjs` is the optional live smoke test (shared Playwright/axe modules).

Actual Slack workspace conversations, sending/receiving Gmail messages, attachments and authenticated restarts still require owner sign-in. Showing the sign-in form alone does not confirm successful authentication. Google may reject embedded-browser sign-in: https://support.google.com/accounts/answer/7675428 . Slack email/workspace sign-in is documented at https://slack.com/help/articles/212681477-Sign-in-to-Slack . Provider-managed SSO at arbitrary corporate domains is not allowlisted; these links open externally and that flow is not confirmed in the embedded session. Standard Google, Apple and Microsoft login hosts are allowed for Slack without granting application privileges.

Configuration migration only defaults missing Slack/Gmail flags to enabled, preserves all account IDs and old service flags, rejects malformed flags. Unit coverage includes Slack subdomain boundaries, lookalike hosts, credentials, ports, schemes, blob attachments and unchanged User-Agent.
