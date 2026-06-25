#!/bin/bash

set -e

# Root Check
if [ "$EUID" -ne 0 ]; then
  echo "[X] Please run as root (sudo)"
  exit 1
fi

echo -e "\033[1;90m===========================================================\033[0m"
echo -e "\033[1;97m    __  __    _    ____  _____         __  __\033[0m"
echo -e "\033[1;96m   |  \/  |  / \  |  _ \|__  /         \ \/ /\033[0m"
echo -e "\033[1;36m   | |\/| | / _ \ | |_) | / /   _____   \  / \033[0m"
echo -e "\033[0;36m   | |  | |/ ___ \|  _ < / /_  |_____|  /  \ \033[0m"
echo -e "\033[0;34m   |_|  |_/_/   \_\_| \_\____|         /_/\_\\\\"
echo ""
echo -e "\033[1;37m              M A R Z - X\033[0m"
echo -e "\033[1;37m         VPN Node Installer\033[0m"
echo -e "\033[1;90m===========================================================\033[0m"

# ==============================================================================
#                               DEPENDENCIES
# ==============================================================================
echo "[PACK] Updating system and installing dependencies..."
apt update -y
apt install -y curl ca-certificates openssl jq ufw python3

if ! command -v docker &>/dev/null; then
  echo "[DOCKER] Docker not found. Installing..."
  curl -fsSL https://get.docker.com | sh
  echo "[OK] Docker installed."
else
  echo "[OK] Docker already installed."
fi

# ==============================================================================
#                               CONFIGURATION
# ==============================================================================
echo ""
echo "--- [CONFIG] VPN Node Configuration ---"

read -p "Enter VPN Domain (e.g., vpn.example.com): " VPN_DOMAIN
if [ -z "$VPN_DOMAIN" ]; then
  echo "[X] Error: You must provide a domain name."
  exit 1
fi

read -p "Enter Admin Email for Let's Encrypt [admin@$VPN_DOMAIN]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@$VPN_DOMAIN}

read -p "Node service port [62050]: " SERVICE_PORT
SERVICE_PORT=${SERVICE_PORT:-62050}

read -p "Node name (shown in panel) [node-1]: " NODE_NAME
NODE_NAME=${NODE_NAME:-node-1}

# Generate UUID
if command -v python3 &>/dev/null; then
  UUID=$(python3 -c "import uuid; print(uuid.uuid4())")
elif command -v uuidgen &>/dev/null; then
  UUID=$(uuidgen | tr '[:upper:]' '[:lower:]')
else
  UUID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || openssl rand -hex 16 | sed 's/\(........\)\(....\)\(....\)\(....\)\(............\)/\1-\2-\3-\4-\5/')
fi
echo "[OK] Generated Xray UUID: $UUID"

# ==============================================================================
#                               INSTALL DIRECTORY
# ==============================================================================
INSTALL_DIR="/root/marzban-node"
SOURCE_DIR="$(pwd)"
XRAY_CONFIG_RAW_URL="https://raw.githubusercontent.com/wmm-x/marz-x/main/xray_config.json"

mkdir -p "$INSTALL_DIR/data" "$INSTALL_DIR/certs"
cd "$INSTALL_DIR"

# ==============================================================================
#                               SSL CERTIFICATE
# ==============================================================================
echo ""
if [ -d "/etc/letsencrypt/live/$VPN_DOMAIN" ]; then
  echo "[SSL] Certificate already exists for $VPN_DOMAIN in /etc/letsencrypt/live/"
  mkdir -p "$INSTALL_DIR/certs/live" "$INSTALL_DIR/certs/archive"
  cp -r "/etc/letsencrypt/live/$VPN_DOMAIN" "$INSTALL_DIR/certs/live/"
  cp -r "/etc/letsencrypt/archive/$VPN_DOMAIN" "$INSTALL_DIR/certs/archive/" 2>/dev/null || true
  echo "[OK] Existing SSL Certificate copied."
elif [ -d "$INSTALL_DIR/certs/live/$VPN_DOMAIN" ]; then
  echo "[SSL] Certificate already exists in node directory."
  echo "[OK] Using existing SSL Certificate."
else
  echo "[SSL] Requesting new SSL Certificate for $VPN_DOMAIN..."
  docker compose down 2>/dev/null || true
  if command -v systemctl >/dev/null; then
    systemctl stop nginx 2>/dev/null || true
    systemctl stop apache2 2>/dev/null || true
  fi
  docker run -it --rm --name certbot \
    -v "$INSTALL_DIR/certs:/etc/letsencrypt" \
    -v "$INSTALL_DIR/certs-data:/var/lib/letsencrypt" \
    -p 80:80 \
    certbot/certbot certonly --standalone \
    -d "$VPN_DOMAIN" \
    --email "$ADMIN_EMAIL" --agree-tos --no-eff-email --non-interactive
  if [ ! -d "$INSTALL_DIR/certs/live/$VPN_DOMAIN" ]; then
    echo "[X] SSL Generation Failed! Port 80 might be blocked or DNS is incorrect."
    exit 1
  fi
  echo "[OK] SSL Certificate obtained."
fi

# ==============================================================================
#                               XRAY CONFIG
# ==============================================================================
echo ""
if [ -f "$SOURCE_DIR/xray_config.json" ]; then
  cp "$SOURCE_DIR/xray_config.json" "$INSTALL_DIR/xray_config.json"
  echo "[OK] Xray config copied from source."
elif [ -f "$SOURCE_DIR/vpn/xray_config.json" ]; then
  cp "$SOURCE_DIR/vpn/xray_config.json" "$INSTALL_DIR/xray_config.json"
  echo "[OK] Xray config copied from vpn/."
else
  echo "[XRAY] Downloading default Xray config..."
  curl -fsSL "$XRAY_CONFIG_RAW_URL" -o "$INSTALL_DIR/xray_config.json"
  echo "[OK] Xray config downloaded."
fi

# ==============================================================================
#                               CREATE FILES
# ==============================================================================
echo "[FILE] Creating node configuration files..."

cat > .env <<EOF
VPN_DOMAIN=${VPN_DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}
SERVICE_PORT=${SERVICE_PORT}
XRAY_API_PORT=62051
XRAY_UUID=${UUID}
NODE_NAME=${NODE_NAME}
SSL_CLIENT_CERT_FILE=
EOF

cat > docker-compose.yml <<EOF
services:
  certbot:
    image: certbot/certbot:latest
    container_name: vpn-certbot
    volumes:
      - ./certs:/etc/letsencrypt
    command: >
      certonly --standalone
      --non-interactive --agree-tos
      --email \${ADMIN_EMAIL}
      -d \${VPN_DOMAIN}
    ports:
      - "80:80"
    profiles:
      - certbot

  certbot-renew:
    image: certbot/certbot:latest
    container_name: vpn-certbot-renew
    volumes:
      - ./certs:/etc/letsencrypt
    command: renew --standalone
    ports:
      - "80:80"
    profiles:
      - certbot-renew

  marzban-node:
    image: gozargah/marzban-node:latest
    container_name: marzban-node
    restart: always
    network_mode: host
    env_file:
      - .env
    environment:
      - SERVICE_PORT=\${SERVICE_PORT:-62050}
      - XRAY_API_PORT=\${XRAY_API_PORT:-62051}
      - SERVICE_PROTOCOL=rpyc
      - SSL_CLIENT_CERT_FILE=\${SSL_CLIENT_CERT_FILE:-}
    volumes:
      - ./data:/var/lib/marzban-node
      - ./certs/live/${VPN_DOMAIN}:/var/lib/marzban/certs:ro
      - ./xray_config.json:/etc/opt/marzban/xray_config.json:ro
EOF

# ==============================================================================
#                               FIREWALL
# ==============================================================================
echo "[FW] Configuring firewall..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp   comment 'SSH'              2>/dev/null || true
  ufw allow 80/tcp   comment 'HTTP/Certbot'     2>/dev/null || true
  ufw allow 443/tcp  comment 'VLESS WS TLS'     2>/dev/null || true
  ufw allow 2053/tcp comment 'VLESS gRPC TLS'   2>/dev/null || true
  ufw allow 8880/tcp comment 'VLESS WS'         2>/dev/null || true
  ufw allow 8443/tcp comment 'VMess WS TLS'     2>/dev/null || true
  ufw allow 8080/tcp comment 'VMess WS'         2>/dev/null || true
  ufw allow 2087/tcp comment 'Trojan WS TLS'    2>/dev/null || true
  ufw allow 2096/tcp comment 'Trojan TCP TLS'   2>/dev/null || true
  ufw allow 1080/tcp comment 'Shadowsocks TCP'  2>/dev/null || true
  ufw allow 1080/udp comment 'Shadowsocks UDP'  2>/dev/null || true
  ufw allow "${SERVICE_PORT}/tcp" comment 'Marzban node' 2>/dev/null || true
  ufw --force enable >/dev/null 2>&1 || true
  echo "[OK] UFW configured with required ports."
else
  echo "[INFO] UFW not installed — skipping firewall config."
fi

# ==============================================================================
#                               START NODE
# ==============================================================================
echo "[START] Starting Marzban Node..."
docker compose up -d marzban-node

echo ""
echo "------------------------------------------------------------------"
echo "[OK] MARZBAN NODE INSTALLATION COMPLETE!"
echo "------------------------------------------------------------------"
echo "Domain:       $VPN_DOMAIN"
echo "Service Port: $SERVICE_PORT"
echo "Node Dir:     $INSTALL_DIR"
echo ""
echo "Next step — add this node in your Marzban panel:"
echo "  Settings > Nodes > Add Node"
echo "  Address: <this server IP>"
echo "  Port:    $SERVICE_PORT"
echo "------------------------------------------------------------------"
