# Contributing

Use Node.js 24 and the pinned dependencies. Generate the first lockfile on a connected machine, review it, then use `npm ci`. Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run test:electron` before proposing changes. Build packages with `npm run dist`; validate an installed package on an ordinary non-root desktop account.

Keep dependencies small and remote pages unprivileged. New services, cloud sync, plugins and proprietary protocol implementations are outside the first release's scope. Service-specific URL/navigation behavior belongs in `src/services/adapters.ts`. Never add real account credentials or session fixtures to the repository.

Use the controlled Electron session test for cookies/storage and restart checks. UI-only fixtures do not establish service compatibility. Log into real services yourself; never send passwords, QR images or two-factor codes to maintainers. Record the platform, package, version and exact scenario in test reports without conversation contents.

Original source is MIT. Do not copy GPL Rambox code into this codebase under an MIT label. Review licenses before adding assets or dependencies. Rebuild bundled third-party notices before each public release.

Store submission rules matter: the local Flatpak manifest was AI-generated and must not be submitted to Flathub. The owner must independently author a compliant manifest and disclosure, and perform submission interactions personally under current Flathub policy.
