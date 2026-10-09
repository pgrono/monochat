#!/bin/sh
set -eu
# Privileged installation only; never run the application as root.
if [ -f /opt/MonoChat/chrome-sandbox ]; then
  chown root:root /opt/MonoChat/chrome-sandbox
  chmod 4755 /opt/MonoChat/chrome-sandbox
fi
if command -v update-desktop-database >/dev/null 2>&1; then update-desktop-database -q || true; fi
