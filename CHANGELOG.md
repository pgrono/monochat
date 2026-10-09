# Changelog

## 0.1.0 — Unreleased (2026-10-09)

- Set the final project homepage, Piotr Grono author/maintainer contact and MIT copyright; prepared the source repository for GitHub.

- Added English, Polish, German, French, Spanish and Italian UI with system-language detection, immediate settings override and persistent preference; existing configurations migrate safely.

- Narrowed the account sidebar from 248 to 154px, giving services 94px more space; tightened spacing and truncated long labels.
- Changed the application icon to black and white with an angular uppercase M.
- Replaced the application icon with a generated master and reproducible PNG exports.
- Set the owner-provided homepage/repository and GitHub-based desktop identity.
- Included AppStream and Debian copyright metadata in the deb; documented PackageKit's local-license reporting limitation.

- Implemented Electron/TypeScript multi-account source, Polish interface and four official service adapters.
- Added account lifecycle, origin permissions, durable configuration and deletion journal.
- Added isolated-session test source, core unit tests, original icons and desktop metadata.
- Added build/release workflows and local packaging candidates.
- Installed pinned dependencies and recorded the lockfile; verified clean npm ci and full compilation on Node 24.
- Passed two-process Electron isolation/restart tests, including popup session inheritance and service-worker shutdown.
- Fixed WhatsApp entry screen by removing Electron product tokens only in its adapter.
- Reworked the Polish interface into compact desktop controls, with actual service icons and accessibility checks.
- Added Linux desktop identity and local launcher to associate the window with MonoChat.
- Built local AppImage/deb packages. Authenticated acceptance, cross-distro checks and publication remain incomplete.
