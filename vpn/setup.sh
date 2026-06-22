#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

log()   { echo -e "${GREEN}[setup]${NC} $1"; }
warn()  { echo -e "${YELLOW}[setup]${NC} $1"; }
error() { echo -e "${RED}[setup]${NC} $1" >&2; exit 1; }

log "=== Marzban Node Setup ==="

# 1. Create .env from .env.example
if [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    log "Created .env from .env.example"
else
    warn ".env already exists — skipping copy"
fi

# 2. Auto-generate XRAY_UUID if not set
current_uuid=$(grep -E '^XRAY_UUID=' "$ENV_FILE" | cut -d'=' -f2 | tr -d '[:space:]')
if [ -z "$current_uuid" ]; then
    if command -v python3 &>/dev/null; then
        UUID=$(python3 -c "import uuid; print(uuid.uuid4())")
    elif command -v uuidgen &>/dev/null; then
        UUID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    else
        error "python3 or uuidgen is required to generate XRAY_UUID"
    fi
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/^XRAY_UUID=.*/XRAY_UUID=${UUID}/" "$ENV_FILE"
    else
        sed -i "s/^XRAY_UUID=.*/XRAY_UUID=${UUID}/" "$ENV_FILE"
    fi
    log "Generated XRAY_UUID: ${UUID}"
else
    warn "XRAY_UUID already set — skipping"
fi

# 3. Create required local directories
mkdir -p "$SCRIPT_DIR/data" "$SCRIPT_DIR/certs"
log "Ensured data/ and certs/ directories exist"

echo ""
log "Setup complete. Next steps:"
echo ""
echo -e "  1. Edit ${YELLOW}vpn/.env${NC} and set:"
echo -e "       VPN_DOMAIN   — your server domain (must have DNS pointing here)"
echo -e "       ADMIN_EMAIL  — email for Let's Encrypt"
echo -e "       PANEL_API_URL — URL of your Marzban panel"
echo ""
echo -e "  2. Obtain TLS certificate (see README.md § VPN Node → TLS Certificate)"
echo ""
echo -e "  3. Start the node:"
echo -e "       ${YELLOW}docker compose -f vpn/docker-compose.yml up -d marzban-node${NC}"
echo ""
echo -e "  4. Add this node in your Marzban panel:"
echo -e "       Address: <server-ip>  Port: \${SERVICE_PORT:-62050}"
