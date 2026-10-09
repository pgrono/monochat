# Snap Store review request draft

The installed Snap test passed on Ubuntu 24.04. This draft has not been submitted to the Snap Store forum.

Title: Browser sandbox permission for MonoChat

I maintain MonoChat, an open-source desktop application that opens the official web interfaces of six messaging and email services. It supports multiple accounts with separate persistent Electron sessions.

I am requesting approval for `browser-support` with `allow-sandbox: true` for the `monochat` snap, published by `piotrgrono`.

The application loads remote web content, so I want to retain Chromium's internal sandbox in addition to Snap confinement. Remote pages run with `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` and `webSecurity: true`. They do not receive the local interface's privileged IPC bridge.

Revision 1 was rejected for the browser-support permission and a setuid `chrome-sandbox` helper. The revised recipe removes setuid permissions and selects Chromium's namespace sandbox with `--disable-setuid-sandbox`. It does not use `--no-sandbox`.

Source: https://github.com/pgrono/monochat

Package recipe: https://github.com/pgrono/monochat/blob/main/packaging/snap/snapcraft.yaml

The application has no telemetry. Camera and audio recording are optional service features and are separate from this request. The installed strict Snap passed startup, account configuration and restart persistence tests on Ubuntu 24.04: https://github.com/pgrono/monochat/actions/runs/37945213766 . These automated checks do not cover authenticated messaging, camera or microphone. I can address any packaging changes needed for review.
