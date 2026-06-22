<div align="center">
  <br><br>
  <h1>🚀 Marz-X</h1>
  <p><b>A Modern, Efficient & Feature-Rich Management Dashboard for Marzban</b></p>
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-quick-installation">Installation</a> •
    <a href="#-screenshots">Screenshots</a> •
    <a href="#-acknowledgements">Credits</a>
  </p>
  <br>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Platform-Ubuntu%2022.04%2B-orange.svg?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/Version-1.0-green.svg?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Docker-Ready-blue.svg?style=flat-square" alt="Docker">
</div>

---

## 📋 Overview

**Marz-X** is an independent, professional-grade management dashboard designed to interact with **Marzban** via its official public API.

It provides an elegant and intuitive web interface for managing users, subscriptions, traffic monitoring, and VPN server configuration — all without modifying the Marzban core.

Marz-X simplifies deployment by automating Docker, Nginx, SSL certificates, and Marzban setup in minutes.

> ⚠️ Marz-X does **not** modify or relicense Marzban. Marzban remains a separate project licensed under AGPL-3.0.

---

## ✨ Key Features

### 🔧 System Management
- **One-Click Auto Installation** — Deploy Dashboard, Docker, SSL certificates, and Marzban VPN node with a single command
- **Fully Dockerized Architecture** — Secure, isolated containerized environment with easy updates and maintenance
- **Automated Server Optimization** — Real-time monitoring and resource tuning for peak VPN performance on connected Marzban servers

### 👥 User & Subscription Management
- **Advanced User Management** — Create, edit, suspend, and reset user traffic with precise control over expiry dates
- **Subscription Management** — Manage customizable plans, data limits, and branded subscription links
- **Multi-Server Support** — Control multiple Marzban nodes from a single, unified interface

### 📊 Analytics & Monitoring
- **Usage Analysis & Bandwidth Monitoring** — View comprehensive historical server bandwidth data with upload/download traffic insights
- **Real-Time Dashboard** — Live system status and performance metrics at a glance
- **Native Marzban Integration** — Seamless real-time synchronization of users, traffic, and system status via official API

### ⚙️ Configuration & Control
- **Visual Xray Configuration** — Manage Xray Core via intuitive GUI—configure Inbounds, Outbounds, and Routing rules without JSON editing
- **Interactive Swagger API Documentation** — Explore and test all API endpoints with comprehensive OpenAPI/Swagger UI interface
- **Backup & Restore** — Ensure data safety with automatic backup and easy recovery functionality

---

## 🚀 Quick Installation

### System Requirements
| Requirement | Details |
|-------------|---------|
| **Operating System** | Ubuntu 22.04+ (Recommended) |
| **Access Level** | Root/sudo privileges |
| **Network** | Valid domain name pointed to your server IP |
| **Resources** | Minimum 1GB RAM, 1GB free disk space |

### Installation Command

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/wmm-x/marz-x/main/install.sh)"
```

The installer will automatically:
- ✅ Install and configure Docker
- ✅ Set up Nginx reverse proxy
- ✅ Provision SSL certificates via Let's Encrypt
- ✅ Deploy Marzban with complete dashboard
- ✅ Initialize database and configurations

---

## 🎨 Screenshots

### Dashboard & Analytics
<p align="center">
  <img src="https://raw.githubusercontent.com/wmm-x/marz-x/96f522445b691d9bb890d6d4ba4dc14e165212a3/screenshots/dark/dashboard-dark.png" width="48%" alt="Dark Dashboard" />
  <img src="https://raw.githubusercontent.com/wmm-x/marz-x/96f522445b691d9bb890d6d4ba4dc14e165212a3/screenshots/light/db-light.png" width="48%" alt="Light Dashboard" />
</p>

### Traffic Analytics
<p align="center">
   <img src="https://raw.githubusercontent.com/wmm-x/marz-x/96f522445b691d9bb890d6d4ba4dc14e165212a3/screenshots/dark/Analytics-dark.png" width="48%" alt="Dark Analytics" />
  <img src="https://raw.githubusercontent.com/wmm-x/marz-x/96f522445b691d9bb890d6d4ba4dc14e165212a3/screenshots/light/Analytics-light.png" width="48%" alt="Light Analytics" />
</p>

---

## 🔐 Technology Stack

- **Backend**: Node.js + Express
- **Database**: Prisma ORM with SQLite
- **Frontend**: React with modern responsive UI
- **API Documentation**: Swagger/OpenAPI UI
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx with SSL/TLS
- **VPN Core**: Xray Protocol

---


---

## 🛡️ VPN Node (Marzban-Node + Xray)

The `vpn/` directory contains a standalone **Marzban node** powered by Xray.  
It runs as a separate Docker Compose stack, independent of the main dashboard.

### Supported Protocols

| Protocol  | Transport | TLS | Port |
|-----------|-----------|-----|------|
| VLESS     | WebSocket | ✅  | 443  |
| VLESS     | gRPC      | ✅  | 2053 |
| VLESS     | WebSocket | ❌  | 8880 |
| VMess     | WebSocket | ✅  | 8443 |
| VMess     | WebSocket | ❌  | 8080 |
| Trojan    | WebSocket | ✅  | 2087 |
| Trojan    | TCP       | ✅  | 2096 |
| Shadowsocks | TCP/UDP | ❌  | 1080 |

### Prerequisites

- Docker & Docker Compose installed
- A domain name with DNS `A` record pointing to this server
- Port **80** free during certificate issuance (certbot standalone)
- Ports **443, 62050, 8080, 8443, 8880, 2053, 2087, 2096, 1080** open in firewall

### Setup

**1. Run the setup script** (creates `vpn/.env`, generates `XRAY_UUID`):

```bash
bash vpn/setup.sh
```

**2. Edit `vpn/.env`** and fill in:

```env
VPN_DOMAIN=vpn.yourdomain.com
ADMIN_EMAIL=you@example.com
PANEL_API_URL=https://panel.yourdomain.com
```

### TLS Certificate

> **Note:** Stop any service using port 80 before running certbot.

**Obtain certificate (run once):**

```bash
docker compose -f vpn/docker-compose.yml --profile certbot up certbot
```

Certificates are stored in `vpn/certs/live/<VPN_DOMAIN>/`.

**Renew certificate (run periodically or via cron):**

```bash
docker compose -f vpn/docker-compose.yml --profile certbot-renew up certbot-renew
```

Add to crontab for automatic renewal every 60 days:

```cron
0 3 1 */2 * cd /path/to/marz-x && docker compose -f vpn/docker-compose.yml --profile certbot-renew up certbot-renew >> /var/log/certbot-renew.log 2>&1
```

### Start the Node

```bash
docker compose -f vpn/docker-compose.yml up -d marzban-node
```

**View logs:**

```bash
docker compose -f vpn/docker-compose.yml logs -f marzban-node
```

**Stop the node:**

```bash
docker compose -f vpn/docker-compose.yml down
```

### Connect to Marzban Panel

After starting the node, add it in the Marzban panel:

1. Go to **Settings → Nodes → Add Node**
2. Set **Address** to your server IP or domain
3. Set **Port** to `62050` (or the value of `SERVICE_PORT` in `vpn/.env`)
4. Copy the panel certificate and paste it into the node settings

### File Structure

```
vpn/
├── docker-compose.yml   # Certbot + Marzban-node services
├── .env.example         # Environment variable template
├── .env                 # Your config (gitignored)
├── xray_config.json     # Xray inbound configuration (all protocols)
├── setup.sh             # First-run setup script
├── data/                # Node runtime data (gitignored)
└── certs/               # Let's Encrypt certificates (gitignored)
```

---

## 🙏 Acknowledgements

Marz-X is an advanced, feature-rich customization built upon the official **Marzban** project.

**Special Recognition:**
- 🙌 **[Gozargah Team](https://github.com/Gozargah/Marzban)** — For creating and maintaining Marzban, the powerful core engine powering this dashboard
- 💝 Community contributors and testers worldwide

> **Disclaimer**: Marz-X is a community-driven project and is not officially affiliated with or endorsed by the Marzban core development team.

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) file for complete details.

---

<div align="center">
  <br>
  <sub>🔗 <a href="https://github.com/wmm-x">Follow on GitHub</a> </sub>
  <br><br>
  <sub>Developed with ❤️ by <a href="https://github.com/wmm-x">wmm-x</a></sub>
  <br><br>
</div>
