#!/bin/bash
# Server preparation script for Marz-X panel + VPN node installation.
# Run once on a fresh Ubuntu 22.04+ server before running install.sh or vpn/setup.sh.
# Requires root.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${GREEN}[prepare]${NC} $1"; }
warn()   { echo -e "${YELLOW}[prepare]${NC} $1"; }
error()  { echo -e "${RED}[prepare]${NC} $1" >&2; exit 1; }
section(){ echo -e "\n${BLUE}══════════════════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}══════════════════════════════════════════${NC}"; }

# ── Root check ─────────────────────────────────────────────────────────────────
if [ "$(id -u)" -ne 0 ]; then
  error "Run as root: sudo bash vpn/prepare.sh"
fi

# ── Default dashboard port (can be overridden via env) ─────────────────────────
DASHBOARD_PORT="${DASHBOARD_PORT:-6104}"

section "1/6  System packages"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  curl \
  ca-certificates \
  gnupg \
  lsb-release \
  openssl \
  jq \
  ufw \
  fail2ban \
  unzip \
  net-tools \
  python3

log "System packages installed"

section "2/6  Docker"

if command -v docker &>/dev/null; then
  warn "Docker already installed: $(docker --version)"
else
  log "Installing Docker (official script)..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  log "Docker installed: $(docker --version)"
fi

# Docker Compose plugin
if ! docker compose version &>/dev/null 2>&1; then
  log "Installing Docker Compose plugin..."
  COMPOSE_VERSION="v2.27.1"
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  COMPOSE_ARCH="linux-x86_64" ;;
    aarch64) COMPOSE_ARCH="linux-aarch64" ;;
    *)        error "Unsupported architecture: $ARCH" ;;
  esac
  mkdir -p /usr/libexec/docker/cli-plugins
  curl -fsSL \
    "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-${COMPOSE_ARCH}" \
    -o /usr/libexec/docker/cli-plugins/docker-compose
  chmod +x /usr/libexec/docker/cli-plugins/docker-compose
  log "Docker Compose installed: $(docker compose version)"
else
  warn "Docker Compose already installed: $(docker compose version)"
fi

section "3/6  Firewall (UFW)"

log "Configuring UFW rules (SSH protected, all VPN ports open)..."

# Allow SSH first so we don't lock ourselves out
ufw allow 22/tcp   comment 'SSH'              2>/dev/null || true

# Panel
ufw allow "${DASHBOARD_PORT}/tcp" comment "Marz-X dashboard" 2>/dev/null || true
ufw allow 8000/tcp comment 'Marzban panel'    2>/dev/null || true

# Certbot / HTTP challenge
ufw allow 80/tcp   comment 'HTTP/Certbot'     2>/dev/null || true

# Xray inbounds (must match vpn/xray_config.json)
ufw allow 443/tcp  comment 'VLESS WS TLS'     2>/dev/null || true
ufw allow 2053/tcp comment 'VLESS gRPC TLS'   2>/dev/null || true
ufw allow 8880/tcp comment 'VLESS WS'         2>/dev/null || true
ufw allow 8443/tcp comment 'VMess WS TLS'     2>/dev/null || true
ufw allow 8080/tcp comment 'VMess WS'         2>/dev/null || true
ufw allow 2087/tcp comment 'Trojan WS TLS'    2>/dev/null || true
ufw allow 2096/tcp comment 'Trojan TCP TLS'   2>/dev/null || true
ufw allow 1080/tcp comment 'Shadowsocks TCP'  2>/dev/null || true
ufw allow 1080/udp comment 'Shadowsocks UDP'  2>/dev/null || true

# Marzban node control port (panel → node)
ufw allow 62050/tcp comment 'Marzban node'    2>/dev/null || true

ufw --force enable
log "UFW enabled. Active rules:"
ufw status numbered | grep -E '^(Status|[0-9]+)' | head -30

section "4/6  Kernel / sysctl (VPN performance)"

cat > /etc/sysctl.d/99-marzx-vpn.conf <<'SYSCTL'
# IP forwarding (required for VPN routing)
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1

# BBR congestion control (better throughput for VPN)
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr

# Increase socket buffers for high-traffic VPN
net.core.rmem_max = 67108864
net.core.wmem_max = 67108864
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864

# Increase max open files
fs.file-max = 1000000

# Reduce TIME_WAIT accumulation
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
SYSCTL

sysctl -p /etc/sysctl.d/99-marzx-vpn.conf >/dev/null
log "Kernel parameters applied"

section "5/6  Fail2ban (SSH brute-force protection)"

cat > /etc/fail2ban/jail.d/sshd.conf <<'F2B'
[sshd]
enabled  = true
port     = ssh
maxretry = 5
bantime  = 3600
findtime = 600
F2B

systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban configured for SSH"

section "6/6  Directories"

mkdir -p \
  /root/marzban-dashboard/data \
  /root/marzban-dashboard/certs \
  /var/lib/marzban/certs \
  /var/lib/marzban-node

log "Required directories created"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Server preparation complete!         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Docker:         $(docker --version 2>/dev/null | cut -d',' -f1)"
echo -e "  Docker Compose: $(docker compose version 2>/dev/null | head -1)"
echo -e "  UFW:            enabled ($(ufw status | grep -c ALLOW) rules)"
echo -e "  IP forwarding:  $(sysctl -n net.ipv4.ip_forward)"
echo -e "  BBR:            $(sysctl -n net.ipv4.tcp_congestion_control)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Install the panel:     ${YELLOW}bash install.sh${NC}"
echo -e "  2. Set up the VPN node:   ${YELLOW}bash vpn/setup.sh${NC}"
echo -e "                            ${YELLOW}bash vpn/docker-compose.yml --profile certbot up certbot${NC}"
echo -e "                            ${YELLOW}docker compose -f vpn/docker-compose.yml up -d marzban-node${NC}"
echo ""
