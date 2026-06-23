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

## ⚖️ HAProxy Load Balancer

The `haproxy/` directory contains an optional **TCP load balancer** that sits in front of multiple Marzban nodes.  
When a node goes down, HAProxy automatically stops sending traffic to it and routes connections to healthy nodes.

### How It Works

```
Client → HAProxy server → node-1 (healthy)
                       → node-2 (healthy)
                       → node-3 (down — skipped automatically)
```

- Every **5 seconds** HAProxy checks TCP connectivity on each node port
- If a node fails **3 checks in a row** → removed from rotation
- After **2 successful checks** → added back automatically
- Balancing strategy: **leastconn** — new connections go to the node with the fewest active connections (optimal for long-lived VPN sessions)

### Prerequisites

- A separate VPS for HAProxy (recommended) or any server reachable by clients
- Docker & Docker Compose installed
- All Xray ports open in firewall: `443, 2053, 8080, 8443, 8880, 2087, 2096, 1080`

### Setup

**1. Copy and edit the env file:**

```bash
cp haproxy/.env.example haproxy/.env
nano haproxy/.env
```

Fill in the real IPs of your Marzban nodes:

```env
NODE_1_IP=1.2.3.4
NODE_2_IP=5.6.7.8
STATS_PASSWORD=your_password
```

**2. Start HAProxy:**

```bash
docker compose -f haproxy/docker-compose.yml up -d
```

**3. Point Marzban inbound hosts to HAProxy:**

In the Marzban panel → **Hosts** — change the address of each inbound to the IP or domain of your HAProxy server.

### Adding a Third Node

Uncomment the `node3` lines in `haproxy/haproxy.cfg` and add `NODE_3_IP` to `haproxy/.env`, then restart:

```bash
docker compose -f haproxy/docker-compose.yml restart
```

### Stats Dashboard

```
http://<haproxy-server>:8404/
```

Login: `admin` / `<STATS_PASSWORD>`

Shows real-time status of all nodes and backends — green means healthy, red means down.

> **Restrict port 8404** via firewall to your IP only — do not expose publicly.

### Limitations

- **Shadowsocks UDP (1080/udp)** is not proxied — HAProxy handles TCP only. Shadowsocks TCP (1080/tcp) works normally.
- HAProxy itself becomes a single point of entry — run it on a reliable server or set up a second HAProxy with keepalived for full HA.

### File Structure

```
haproxy/
├── docker-compose.yml   # HAProxy service
├── haproxy.cfg          # Load balancer config (all Xray ports)
├── .env.example         # Environment variable template
└── .env                 # Your config (gitignored)
```

---

## 💳 Subscription Site (site/)

The `site/` directory contains a standalone **customer-facing web service** for selling VPN subscriptions.  
It handles registration, payments via [Platega.io](https://platega.io), personal accounts, and automatic Marzban user provisioning.

### Architecture

```
site/
├── backend/    # NestJS API — auth, plans, payments, Marzban provisioning
└── frontend/   # React + Bootstrap — landing page, auth, personal dashboard
```

```
User browser
    │
    ▼
nginx (port 3000)
    ├── /api/*  ──► NestJS backend (port 3001)
    └── /*      ──► React static files
              │
              ▼
        Marzban Panel API ──► Marzban nodes
        Platega.io API    ──► payment processing
        Resend            ──► transactional email
```

### Features

- **Landing page** — pricing cards, live server status (from Marzban nodes)
- **Auth** — email + password registration, email verification, password reset
- **Personal dashboard** — subscription status, traffic usage, connection link + QR code, payment history
- **Payments** — СБП, Russian cards, international cards, crypto (via Platega)
- **Auto-provisioning** — Marzban user created/extended automatically on payment confirmation
- **Expiry notifications** — email reminder 3 days before subscription expires
- **Bilingual** — Russian and English UI

### Prerequisites

- Docker & Docker Compose
- [Platega.io](https://platega.io) merchant account (get `MERCHANT_ID` and `SECRET`)
- [Resend](https://resend.com) account and verified sender domain (get `API_KEY`)
- Running Marzban panel (from this repo or standalone)

### Setup

**1. Create the env file:**

```bash
cp site/backend/.env.example site/backend/.env
nano site/backend/.env
```

Fill in all required values:

```env
APP_URL=https://yourdomain.com

DATABASE_URL="file:./data/db.sqlite"

JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<another-random-64-char-string>

RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=noreply@yourdomain.com

PLATEGA_MERCHANT_ID=<uuid-from-platega-dashboard>
PLATEGA_SECRET=<secret-from-platega-dashboard>

MARZBAN_API_URL=https://panel.yourdomain.com
MARZBAN_USERNAME=admin
MARZBAN_PASSWORD=your-marzban-password
```

**2. Set Platega webhook URL:**

In your [Platega dashboard](https://app.platega.io) → Settings → Callback URL, set:

```
https://yourdomain.com/api/payments/webhook
```

**3. Start the service:**

```bash
docker compose -f site/docker-compose.yml up -d --build
```

The site will be available at `http://your-server:3000`. Put it behind nginx with SSL for production.

### Customizing Plans

Edit [`site/backend/src/config/plans.json`](site/backend/src/config/plans.json) to change tariff names, prices, traffic limits, and features. Requires rebuilding the backend image:

```bash
docker compose -f site/docker-compose.yml up -d --build backend
```

Example plan entry:

```json
{
  "id": "standard",
  "name": { "ru": "Стандарт", "en": "Standard" },
  "price": 349,
  "currency": "RUB",
  "durationDays": 30,
  "dataLimitGB": 150,
  "popular": true,
  "features": {
    "ru": ["150 ГБ трафика", "Все серверы", "Все протоколы"],
    "en": ["150 GB traffic", "All servers", "All protocols"]
  }
}
```

Set `"dataLimitGB": null` for unlimited traffic.

### Payment Flow

1. User selects a plan and payment method on the dashboard
2. Backend creates a payment record and calls Platega API → returns a redirect URL
3. User is redirected to Platega's payment page
4. After payment, Platega sends a webhook to `/api/payments/webhook`
5. Backend validates the webhook (`X-MerchantId` + `X-Secret` headers), then:
   - Creates or extends the user's Marzban account with the plan's data limit and expiry
   - Activates the subscription in the database
   - Sends a confirmation email via Resend

### User Dashboard

After login, users can:
- View their current plan, expiry date, and traffic usage
- See all connected servers with live status
- Copy their **subscription link** (works in all VPN clients: v2rayN, Shadowrocket, NekoBox, etc.)
- Scan a **QR code** to import the subscription on mobile
- View payment history
- Renew their subscription

### Managing Users

Users are managed in the **marz-x dashboard** (the main panel). Subscription site users correspond 1-to-1 with Marzban users — username format: `vpn_<12-char-user-id>`.

### Production Nginx Example

To serve the site over HTTPS on port 443 alongside the marz-x dashboard, add a new nginx server block:

```nginx
server {
    listen 443 ssl;
    server_name site.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/site.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/site.yourdomain.com/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
    }
}
```

### File Structure

```
site/
├── docker-compose.yml          # Frontend + backend services
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── .env.example            # Environment variable template
│   ├── .env                    # Your config (gitignored)
│   ├── prisma/
│   │   └── schema.prisma       # DB: User, Subscription, Payment, MarzbanUser
│   └── src/
│       ├── config/
│       │   └── plans.json      # Tariff plan definitions
│       └── modules/
│           ├── auth/           # Registration, login, JWT, email verification
│           ├── email/          # Resend email templates
│           ├── plans/          # GET /api/plans
│           ├── users/          # GET /api/users/me
│           ├── marzban/        # Marzban API client
│           ├── nodes/          # Node status cache (refresh every 30s)
│           ├── subscriptions/  # Subscription lifecycle, expiry checks (daily cron)
│           └── payments/       # Platega integration + webhook handler
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── i18n/               # ru.json / en.json translations
        ├── pages/
        │   ├── Landing/        # Pricing + server status
        │   ├── Auth/           # Login, Register, VerifyEmail, ForgotPassword, ResetPassword
        │   └── Dashboard/      # Subscription, servers, QR, payment history
        └── services/
            └── api.ts          # Axios client with JWT auto-refresh
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
