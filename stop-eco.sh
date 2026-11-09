#!/usr/bin/env bash

set -eu

SERVICE_NAME="ms-cache"
BASE="$HOME/.local/share/ms-cache"
BIN="$BASE/bin/cache-service"
CONFIG="$BASE/settings.json"
SERVICE_FILE="$HOME/.config/systemd/user/${SERVICE_NAME}.service"

if command -v systemctl >/dev/null 2>&1; then
    systemctl --user stop "$SERVICE_NAME.service" 2>/dev/null ||
        echo "Hinweis: Der systemd-Dienst lief nicht oder war nicht erreichbar."
    systemctl --user disable "$SERVICE_NAME.service" 2>/dev/null ||
        echo "Hinweis: Der systemd-Dienst war nicht aktiviert oder war nicht erreichbar."
else
    echo "Hinweis: systemctl nicht gefunden; überspringe systemd-Bereinigung."
fi

# Stop only processes whose executable is the binary installed by start-eco.sh.
for process in /proc/[0-9]*; do
    [ -e "$process/exe" ] || continue
    process_exe=$(readlink "$process/exe" 2>/dev/null || true)
    if [ "$process_exe" = "$BIN" ]; then
        pid=${process##*/}
        if kill -TERM "$pid" 2>/dev/null; then
            echo "Prozess $pid beendet."
        else
            echo "Warnung: Prozess $pid konnte nicht beendet werden." >&2
        fi
    fi
done

if [ -f "$SERVICE_FILE" ] || [ -L "$SERVICE_FILE" ]; then
    rm -f -- "$SERVICE_FILE"
fi
if [ -f "$BIN" ] || [ -L "$BIN" ]; then
    rm -f -- "$BIN"
fi
if [ -f "$CONFIG" ] || [ -L "$CONFIG" ]; then
    rm -f -- "$CONFIG"
fi

if command -v systemctl >/dev/null 2>&1; then
    systemctl --user daemon-reload ||
        echo "Warnung: systemd konnte nicht neu geladen werden." >&2
fi

for directory in "$BASE/bin" "$BASE"; do
    if [ -d "$directory" ] && ! rmdir -- "$directory" 2>/dev/null; then
        echo "Hinweis: Verzeichnis nicht leer, bleibt erhalten: $directory"
    fi
done

echo "Linux-Bereinigung abgeschlossen."
