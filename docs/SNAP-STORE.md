# MonoChat on Snap Store

The name `monochat` is registered to the owner's `piotrgrono` publisher account. Registration alone does not make the application available to install.

## Store description

Use WhatsApp, Messenger, Google Messages, Instagram Direct, Slack and Gmail in one window. MonoChat lets you add several accounts of the same service and switch between them from the sidebar. Each account keeps its own login session.

Give each account a name and arrange the sidebar to suit you. You can mute an account or pause accounts individually or by service. The interface supports English, Polish, German, French, Spanish and Italian, with automatic selection based on your system language.

MonoChat uses the services' official websites for sign-in and messaging. It does not require a separate MonoChat account and does not include telemetry. Service availability and sign-in restrictions depend on each provider.

MonoChat is an independent project and is not affiliated with the service providers.

Website: https://strony.olsztyn.pl/portfolio/monochat

Support: https://github.com/pgrono/monochat/issues

License: MIT

Store media: `assets/icons/512x512.png`, `docs/electron-empty.png`, `docs/electron-add-account.png`, `docs/electron-settings.png`.

## Build

The recipe downloads the DEB built by GitHub Actions for v0.1.0 and verifies its SHA256. It does not package the developer's local application profile. To change versions, update both the URL and checksum.

```sh
node scripts/prepare-snap.cjs
cd .runtime/snap-build
SNAPCRAFT_BUILD_ENVIRONMENT=multipass snapcraft pack
```

Snapcraft 9.1.3 and an Ubuntu 24.04 managed build environment are used. LXD is also supported by Snapcraft (`snapcraft pack --use-lxd`); on the owner's workstation its container failed during cgroup mounting, so this build uses Multipass.

## Publication checks

Keep `grade: devel` until the confined package has passed launch, account/session restart, file-dialog and desktop-integration tests. Publish initial test revisions to `edge`. Promote a tested revision only after changing the package grade to `stable` and confirming Store review.

The recipe uses Chromium's namespace sandbox with `--disable-setuid-sandbox`, which disables only the setuid helper. It retains Chromium's internal sandbox and requests `browser-support` with `allow-sandbox: true`. This permission requires Store review and does not auto-connect by default. Do not add `--no-sandbox` to bypass it. Audio recording and camera access remain optional permissions and require testing with the service and desktop.

Reference: https://snapcraft.io/docs/reference/interfaces/browser-support-interface/

## Flathub

This document concerns Snap Store. The existing Flatpak manifest is a local development candidate, generated with AI assistance, and is not eligible for Flathub submission. A human must independently prepare the Flathub manifest and handle submission and review. Flathub requires disclosure of AI-generated application material and evaluates project history and maintenance.

Reference: https://docs.flathub.org/docs/for-app-authors/requirements#generative-ai-policy
