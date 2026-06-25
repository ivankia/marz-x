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
echo -e "\033[1;37m         Dashboard Installer\033[0m"
echo -e "\033[1;90m===========================================================\033[0m"

# ==============================================================================
#                               DEPENDENCIES
# ==============================================================================
echo "[PACK] Updating system and installing dependencies..."
apt update -y
apt install -y curl ca-certificates openssl jq ufw

if ! command -v docker &>/dev/null; then
  echo "[DOCKER] Docker not found. Installing..."
  curl -fsSL https://get.docker.com | sh
  echo "[OK] Docker installed."
else
  echo "[OK] Docker already installed."
fi

# ==============================================================================
#                          PART 1: DASHBOARD CONFIGURATION
# ==============================================================================
echo ""
echo "--- [CONFIG] Dashboard Configuration ---"
read -p "Enter your Domain (e.g., panel.example.com): " DOMAIN_NAME
read -p "Enter Dashboard Public Port [6104]: " HTTPS_PORT
HTTPS_PORT=${HTTPS_PORT:-6104}

if [ -z "$DOMAIN_NAME" ]; then
  echo "[X] Error: You must provide a domain name."
  exit 1
fi

echo ""
read -p "Auto Optimize Interval (Minutes) [10]: " OPTIMIZE_INTERVAL
OPTIMIZE_INTERVAL=${OPTIMIZE_INTERVAL:-10}

echo ""
echo "[SECURE] Setup Dashboard Admin Credentials"
read -p "Admin Username [admin]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}

read -p "Admin Password [admin123]: " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

# Generate Secure Keys
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
MARZBAN_ADMIN_PASS=$(openssl rand -base64 12)
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# ==============================================================================
#                          PART 2: SSL GENERATION
# ==============================================================================
INSTALL_DIR="/root/marzban-dashboard"
SOURCE_DIR="$(pwd)"
mkdir -p $INSTALL_DIR/certs

echo "[BUILD] Building dashboard image from source..."
docker build -t marz-x-dashboard:local "$SOURCE_DIR"
echo "[OK] Image built: marz-x-dashboard:local"

echo "[NET] Creating Docker network marzx-net..."
docker network create marzx-net 2>/dev/null || echo "[OK] Network marzx-net already exists."

cd $INSTALL_DIR

mkdir -p postgres-init
cat > postgres-init/01-create-databases.sql <<'SQL'
SELECT 'CREATE DATABASE marzx_site' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marzx_site')\gexec
SELECT 'CREATE DATABASE marzx_dashboard' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marzx_dashboard')\gexec
SQL

echo ""
if [ -d "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
  echo "[SSL] Certificate already exists for $DOMAIN_NAME in /etc/letsencrypt/live/"
  echo "[SSL] Copying existing certificate to dashboard directory..."
  cp -r /etc/letsencrypt/live/$DOMAIN_NAME $INSTALL_DIR/certs/live/
  cp -r /etc/letsencrypt/archive/$DOMAIN_NAME $INSTALL_DIR/certs/archive/ 2>/dev/null || true
  cp -r /etc/letsencrypt/renewal/$DOMAIN_NAME.conf $INSTALL_DIR/certs/renewal/ 2>/dev/null || true
  echo "[OK] Existing SSL Certificate copied successfully."
elif [ -d "$INSTALL_DIR/certs/live/$DOMAIN_NAME" ]; then
  echo "[SSL] Certificate already exists for $DOMAIN_NAME in dashboard directory."
  echo "[OK] Using existing SSL Certificate."
else
  echo "[SSL] No existing certificate found. Requesting new SSL Certificate for $DOMAIN_NAME..."
  docker compose down 2>/dev/null || true
  if command -v systemctl >/dev/null; then
    systemctl stop nginx 2>/dev/null || true
    systemctl stop apache2 2>/dev/null || true
  fi
  docker run -it --rm --name certbot \
    -v "$(pwd)/certs:/etc/letsencrypt" \
    -v "$(pwd)/certs-data:/var/lib/letsencrypt" \
    -p 80:80 \
    certbot/certbot certonly --standalone \
    -d "$DOMAIN_NAME" \
    --email "admin@$DOMAIN_NAME" --agree-tos --no-eff-email --non-interactive
  if [ ! -d "certs/live/$DOMAIN_NAME" ]; then
    echo "[X] SSL Generation Failed! Port 80 might be blocked or DNS is incorrect."
    exit 1
  fi
  echo "[OK] SSL Certificate obtained successfully."
fi

# ==============================================================================
#                          PART 3: DASHBOARD INSTALLATION
# ==============================================================================
echo ""
echo "[FILE] Creating Dashboard configuration files..."

cat > .env <<EOF
NODE_ENV=production
PORT=5000
BACKUP_INTERVAL_MINUTES=60
AUTO_OPTIMIZE_INTERVAL_MINUTES=${OPTIMIZE_INTERVAL}
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/marzx_dashboard"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
JWT_SECRET="${JWT_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
ADMIN_USER="${ADMIN_USER}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
ADMIN_NAME="Administrator"
MARZBAN_ADMIN="MarzbanAdminx"
MARZBAN_ADMIN_PASS="${MARZBAN_ADMIN_PASS}"
EOF

cat > nginx.conf <<EOF
events { worker_connections 1024; }
http {
    include mime.types;
    default_type application/octet-stream;
    server {
        listen $HTTPS_PORT ssl;
        error_page 497 https://\$host:\$server_port\$request_uri;
        server_name $DOMAIN_NAME;
        ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        root /usr/share/nginx/html;
        index index.html;

        location = /api-docs {
            return 301 \$scheme://\$host:\$server_port/api-docs/;
        }

        location /api-docs/ {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        location /swagger-theme.css {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        location /api/ {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF

cat > docker-compose.yml <<EOF
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: marzx-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: marzx_dashboard
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - marzx-net

  dashboard:
    container_name: marzban-dashboard
    image: marz-x-dashboard:local
    restart: always
    ports:
      - "${HTTPS_PORT}:${HTTPS_PORT}"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./certs:/etc/letsencrypt
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /var/lib/marzban:/var/lib/marzban
    env_file:
      - .env
    networks:
      - marzx-net

networks:
  marzx-net:
    external: true
EOF

echo "[START] Starting Marzban Dashboard..."
docker compose up -d
echo "[OK] Dashboard is running at https://$DOMAIN_NAME:$HTTPS_PORT"

# ==============================================================================
#                          PART 3.5: CLI TOOL SETUP (marz-x)
# ==============================================================================
echo ""
echo "[INSTALL] Installing 'marz-x' CLI tool..."

cat > /usr/local/bin/marz-x << 'EOF'
#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DASH_DIR="/root/marzban-dashboard"

show_header() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}      [START] Marz-X Management Menu      ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

wait_key() {
    echo ""
    read -n 1 -s -r -p "Press any key to return to menu..."
    echo ""
}

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[X] Please run as root (sudo marz-x)${NC}"
  exit 1
fi

while true; do
    show_header
    echo "1) Update Panel"
    echo "2) Start Services"
    echo "3) Stop Services"
    echo "4) View Logs"
    echo "5) Panel Info"
    echo "6) Change Panel Port"
    echo "7) Uninstall Dashboard"
    echo "8) Exit"
    echo ""
    read -p "Select an option [1-8]: " OPTION

    case $OPTION in
        1)
            echo ""
            echo -e "${YELLOW}Updating Marzban Dashboard...${NC}"

            CLI_MENU_URL="https://raw.githubusercontent.com/wmm-x/marz-x/main/cli-menu.sh"
            CLI_TEMP=$(mktemp)

            curl -fsSL "$CLI_MENU_URL" -o "$CLI_TEMP" 2>/dev/null || true
            cp /usr/local/bin/marz-x /usr/local/bin/marz-x.backup 2>/dev/null || true
            install -m 755 "$CLI_TEMP" /usr/local/bin/marz-x
            rm -f "$CLI_TEMP"
            CLI_UPDATED=true

            if [ -d "$DASH_DIR" ]; then
                cd $DASH_DIR
                echo -e "${YELLOW}Stopping and removing old container...${NC}"
                docker compose down || true
                echo -e "${YELLOW}Removing old dashboard images...${NC}"
                docker rmi malindamalshan/marzban-dashboard:latest 2>/dev/null || true
                docker rmi $(docker images | grep malindamalshan/marzban-dashboard | awk '{print $3}') 2>/dev/null || true
                echo -e "${YELLOW}Cleaning up unused images...${NC}"
                docker image prune -f --filter "dangling=true" 2>/dev/null || true

                echo -e "${YELLOW}Verifying SSL certificate paths...${NC}"
                ACTUAL_CERT_DIR=$(find /root/marzban-dashboard/certs/live -mindepth 1 -maxdepth 1 -type d 2>/dev/null | head -1)
                if [ -n "$ACTUAL_CERT_DIR" ]; then
                    ACTUAL_DOMAIN=$(basename "$ACTUAL_CERT_DIR")
                    echo -e "${GREEN}Found SSL certificate for: ${ACTUAL_DOMAIN}${NC}"
                    sed -i "s|ssl_certificate /etc/letsencrypt/live/.*/fullchain.pem|ssl_certificate /etc/letsencrypt/live/${ACTUAL_DOMAIN}/fullchain.pem|g" "$DASH_DIR/nginx.conf"
                    sed -i "s|ssl_certificate_key /etc/letsencrypt/live/.*/privkey.pem|ssl_certificate_key /etc/letsencrypt/live/${ACTUAL_DOMAIN}/privkey.pem|g" "$DASH_DIR/nginx.conf"
                    sed -i "s|server_name .*;|server_name ${ACTUAL_DOMAIN};|g" "$DASH_DIR/nginx.conf"
                else
                    echo -e "${YELLOW}No SSL certificate found. You may need to re-run installation for certificate setup.${NC}"
                fi

                echo -e "${YELLOW}Rebuilding dashboard image from source...${NC}"
                docker build -t marz-x-dashboard:local "$DASH_DIR/../marz-x" 2>/dev/null || \
                docker build -t marz-x-dashboard:local "$(dirname "$DASH_DIR")/marz-x" 2>/dev/null || \
                { echo -e "${RED}[X] Could not find marz-x source directory. Run install.sh again.${NC}"; wait_key; continue; }

                echo -e "${YELLOW}Starting dashboard with latest image...${NC}"
                docker compose up -d --force-recreate

                echo -e "${GREEN}[OK] Dashboard updated successfully!${NC}"

                RUNNING_IMAGE=$(docker inspect marzban-dashboard --format='{{.Config.Image}}' 2>/dev/null || echo "unknown")
                echo -e "${GREEN}Running image: ${RUNNING_IMAGE}${NC}"

                docker image prune -f 2>/dev/null || true
                docker volume prune -f 2>/dev/null || true

                echo ""
                echo -e "${GREEN}[OK] Dashboard and CLI menu update completed!${NC}"

                if [ "$CLI_UPDATED" = true ]; then
                    echo -e "${BLUE}[INFO] Restarting menu to apply CLI updates...${NC}"
                    sleep 2
                    exec marz-x
                fi
            else
                echo -e "${RED}Dashboard directory not found!${NC}"
            fi
            wait_key
            ;;

        2)
            echo ""
            echo -e "${GREEN}Starting Dashboard...${NC}"
            if [ -d "$DASH_DIR" ]; then
                cd $DASH_DIR && docker compose up -d
            else
                echo -e "${RED}Dashboard directory not found!${NC}"
            fi
            if command -v marzban &>/dev/null; then
                echo -e "${GREEN}Starting Marzban Server...${NC}"
                marzban restart
            fi
            echo -e "${GREEN}[OK] Start command executed.${NC}"
            wait_key
            ;;

        3)
            echo ""
            echo -e "${YELLOW}Stopping Dashboard...${NC}"
            if [ -d "$DASH_DIR" ]; then
                cd $DASH_DIR && docker compose down
            fi
            if command -v marzban &>/dev/null; then
                echo ""
                read -p "Do you want to stop Marzban VPN Server as well? [y/N]: " STOP_VPN
                if [[ "$STOP_VPN" =~ ^[Yy]$ ]]; then
                    echo -e "${YELLOW}Stopping Marzban Server...${NC}"
                    marzban stop
                fi
            fi
            echo -e "${GREEN}[OK] Stop command executed.${NC}"
            wait_key
            ;;

        4)
            echo ""
            echo "Which logs would you like to view?"
            echo "1) Dashboard Logs"
            echo "2) Marzban VPN Logs"
            read -p "Select [1-2]: " LOG_CHOICE
            if [ "$LOG_CHOICE" == "1" ]; then
                echo -e "${BLUE}Showing Dashboard Logs (Press CTRL+C to exit)...${NC}"
                sleep 1
                cd $DASH_DIR && docker compose logs -f
            elif [ "$LOG_CHOICE" == "2" ]; then
                if command -v marzban &>/dev/null; then
                    echo -e "${BLUE}Showing Marzban VPN Logs (Press CTRL+C to exit)...${NC}"
                    sleep 1
                    marzban logs
                else
                    echo -e "${RED}Marzban VPN Server is not installed.${NC}"
                    wait_key
                fi
            else
                echo "Invalid selection."
            fi
            ;;

        5)
            echo ""
            echo -e "${BLUE}========================================${NC}"
            echo -e "${BLUE}      PANEL INFORMATION${NC}"
            echo -e "${BLUE}========================================${NC}"
            echo ""
            if [ -f "$DASH_DIR/.env" ]; then
                DASHBOARD_DOMAIN=$(grep -i "server_name" "$DASH_DIR/nginx.conf" 2>/dev/null | head -1 | awk '{print $2}' | sed 's/;//' || echo "Not found")
                DASHBOARD_PORT=$(grep -i "listen" "$DASH_DIR/nginx.conf" 2>/dev/null | grep "ssl" | head -1 | awk '{print $2}' | sed 's/ssl;//' | sed 's/;//' || echo "Not found")
                ADMIN_USER=$(grep "^ADMIN_USER=" "$DASH_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "Not found")
                ADMIN_PASS=$(grep "^ADMIN_PASSWORD=" "$DASH_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "Not found")
                echo -e "${GREEN}MARZ-X DASHBOARD${NC}"
                echo -e "   Domain:   ${YELLOW}${DASHBOARD_DOMAIN}${NC}"
                echo -e "   Port:     ${YELLOW}${DASHBOARD_PORT}${NC}"
                echo -e "   URL:      ${YELLOW}https://${DASHBOARD_DOMAIN}:${DASHBOARD_PORT}${NC}"
                echo -e "   Username: ${YELLOW}${ADMIN_USER}${NC}"
                echo -e "   Password: ${YELLOW}${ADMIN_PASS}${NC}"
                echo ""
            else
                echo -e "${RED}Dashboard configuration not found!${NC}"
            fi
            if command -v marzban &>/dev/null; then
                if [ -f "/opt/marzban/.env" ]; then
                    MARZBAN_SUDO_USER=$(grep "^SUDO_USERNAME=" "/opt/marzban/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "Not found")
                    MARZBAN_SUDO_PASS=$(grep "^SUDO_PASSWORD=" "/opt/marzban/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "Not found")
                    echo -e "${GREEN}MARZBAN VPN SERVER${NC}"
                    echo -e "   URL:      ${YELLOW}https://${DASHBOARD_DOMAIN}:8000${NC}"
                    echo -e "   Username: ${YELLOW}${MARZBAN_SUDO_USER}${NC}"
                    echo -e "   Password: ${YELLOW}${MARZBAN_SUDO_PASS}${NC}"
                    echo ""
                fi
            fi
            echo -e "${BLUE}========================================${NC}"
            wait_key
            ;;

        6)
            echo ""
            echo -e "${BLUE}========================================${NC}"
            echo -e "${BLUE}      CHANGE PANEL PORT${NC}"
            echo -e "${BLUE}========================================${NC}"
            echo ""
            if [ -f "$DASH_DIR/nginx.conf" ]; then
                CURRENT_PORT=$(grep -i "listen" "$DASH_DIR/nginx.conf" 2>/dev/null | grep "ssl" | head -1 | awk '{print $2}' | sed 's/ssl;//' | sed 's/;//' || echo "6104")
                echo -e "${YELLOW}Current Panel Port: ${CURRENT_PORT}${NC}"
                echo ""
                read -p "Enter new port number: " NEW_PORT
                if ! [[ "$NEW_PORT" =~ ^[0-9]+$ ]]; then
                    echo -e "${RED}Invalid port! Port must be a number.${NC}"
                    wait_key
                elif [ "$NEW_PORT" -lt 1 ] || [ "$NEW_PORT" -gt 65535 ]; then
                    echo -e "${RED}Invalid port! Port must be between 1 and 65535.${NC}"
                    wait_key
                else
                    echo -e "${YELLOW}Updating panel port from ${CURRENT_PORT} to ${NEW_PORT}...${NC}"
                    cd $DASH_DIR && docker compose down || true
                    sed -i "s/listen ${CURRENT_PORT} ssl;/listen ${NEW_PORT} ssl;/" "$DASH_DIR/nginx.conf"
                    DASHBOARD_DOMAIN=$(grep -i "server_name" "$DASH_DIR/nginx.conf" 2>/dev/null | head -1 | awk '{print $2}' | sed 's/;//' || echo "")
                    cd $DASH_DIR && docker compose up -d
                    echo ""
                    echo -e "${GREEN}[OK] Port changed successfully!${NC}"
                    echo -e "${GREEN}New URL: https://${DASHBOARD_DOMAIN}:${NEW_PORT}${NC}"
                    echo ""
                fi
            else
                echo -e "${RED}Dashboard configuration not found!${NC}"
            fi
            wait_key
            ;;

        7)
            echo ""
            echo -e "${RED}[!!] DANGER ZONE [!!]${NC}"
            echo "This will completely remove the Marzban Dashboard and this Menu tool."
            echo "Your Marzban VPN Server (if installed) will remain safe."
            echo ""
            read -p "Are you sure you want to uninstall Marz-X Dashboard? [y/N]: " CONFIRM
            if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Removing Dashboard Container...${NC}"
                cd $DASH_DIR && docker compose down || true
                echo -e "${YELLOW}Removing Docker Images...${NC}"
                docker rmi malindamalshan/marzban-dashboard:latest 2>/dev/null || true
                docker image prune -f 2>/dev/null || true
                echo -e "${YELLOW}Removing Volumes and Data...${NC}"
                docker volume prune -f 2>/dev/null || true
                echo -e "${YELLOW}Removing Dashboard Files...${NC}"
                echo -e "${BLUE}[INFO] Preserving SSL certificates for future installations...${NC}"
                if [ -d "$DASH_DIR/certs/live" ]; then
                    PRESERVED_DOMAINS=$(ls -1 "$DASH_DIR/certs/live" 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
                    [ -n "$PRESERVED_DOMAINS" ] && echo -e "${BLUE}[INFO] Found certificates for: $PRESERVED_DOMAINS${NC}"
                fi
                cd $DASH_DIR
                rm -f .env docker-compose.yml nginx.conf 2>/dev/null || true
                rm -rf data 2>/dev/null || true
                find $DASH_DIR -mindepth 1 -maxdepth 1 ! -name 'certs' -exec rm -rf {} + 2>/dev/null || true
                echo -e "${GREEN}[OK] SSL certificates preserved in: $DASH_DIR/certs${NC}"
                echo -e "${YELLOW}Removing 'marz-x' CLI tool...${NC}"
                rm /usr/local/bin/marz-x
                sudo systemctl restart docker 2>/dev/null || true
                echo -e "${GREEN}[OK] Dashboard uninstalled successfully!${NC}"
                echo -e "${BLUE}[INFO] SSL certificates preserved in: $DASH_DIR/certs${NC}"
                echo ""
                read -p "Do you also want to uninstall Marzban VPN Server? [y/N]: " UNINSTALL_MARZBAN
                if [[ "$UNINSTALL_MARZBAN" =~ ^[Yy]$ ]]; then
                    if command -v marzban &>/dev/null; then
                        marzban uninstall
                        echo -e "${GREEN}[OK] Marzban VPN Server uninstalled.${NC}"
                    else
                        echo -e "${RED}Marzban VPN Server is not installed.${NC}"
                    fi
                fi
                echo ""
                echo -e "${GREEN}[OK] Complete Uninstall Done!${NC}"
                exit 0
            else
                echo "Cancelled."
                wait_key
            fi
            ;;

        8)
            echo "Exiting..."
            exit 0
            ;;

        *)
            echo -e "${RED}Invalid option.${NC}"
            sleep 1
            ;;
    esac
done
EOF

chmod +x /usr/local/bin/marz-x
echo "[OK] 'marz-x' menu installed successfully!"

# ==============================================================================
#                               FIREWALL
# ==============================================================================
echo ""
echo "[FW] Configuring firewall..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp   comment 'SSH'             2>/dev/null || true
  ufw allow 80/tcp   comment 'HTTP/Certbot'    2>/dev/null || true
  ufw allow 443/tcp  comment 'HTTPS/VLESS TLS' 2>/dev/null || true
  ufw allow "${HTTPS_PORT}/tcp" comment 'Dashboard' 2>/dev/null || true
  ufw allow 8000/tcp comment 'Marzban panel'   2>/dev/null || true
  ufw --force enable >/dev/null 2>&1 || true
  echo "[OK] UFW configured."
else
  echo "[INFO] UFW not installed — skipping firewall config."
fi

# ==============================================================================
#                               DONE
# ==============================================================================
echo ""
echo "------------------------------------------------------------------"
echo "[OK] MARZ-X DASHBOARD Installation Complete!"
echo "------------------------------------------------------------------"
echo "Access at: https://$DOMAIN_NAME:$HTTPS_PORT"
echo "Username:  $ADMIN_USER"
echo "Password:  $ADMIN_PASSWORD"
echo ""
echo "To manage the panel, type: marz-x"
echo "------------------------------------------------------------------"
