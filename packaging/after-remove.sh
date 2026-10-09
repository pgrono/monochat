#!/bin/sh
set -eu
# Preserve all user data on uninstall.
if command -v update-desktop-database >/dev/null 2>&1; then update-desktop-database -q || true; fi
