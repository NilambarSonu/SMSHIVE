<p align="center">
  <img src="apps/web/public/logo.svg" width="80" alt="SMSHIVE Logo" />
</p>

<h1 align="center">SMSHIVE</h1>
<p align="center">
  <strong>The most powerful free SMS gateway. Turn any Android phone into a professional SMS sending machine.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-docs">API Docs</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 🚀 What is SMSHIVE?

SMSHIVE is a **self-hosted, open-source SMS gateway** that lets you send and receive SMS using your Android phone as the gateway device. Think of it as a free, no-limits alternative to [TextBee](https://textbee.dev).

### Key Differences from TextBee:

| Feature | SMSHIVE | TextBee |
|---|---|---|
| Messages/day | **Unlimited** | 50 (free) / 500 (paid) |
| Devices | **Unlimited** | 1 (free) / 5 (paid) |
| API Rate Limit | **1000 req/s** | 60 req/s |
| Webhooks | **Unlimited + HMAC** | Limited |
| Templates | **Unlimited** | None |
| Scheduled SMS | **✅ + Recurring Cron** | Basic |
| Team Members | **✅ Role-based** | None |
| Price | **Free Forever** | $10/mo+ |

## ✨ Features

- 🔥 **Unlimited Everything** — No message caps, no device limits, no feature gates
- 📱 **Multi-Device Gateway** — Connect unlimited Android phones with dual SIM support
- 🔌 **REST API** — Full RESTful API with Swagger documentation
- 📊 **Real-time Analytics** — Charts, delivery reports, and device performance metrics
- 📝 **Message Templates** — Reusable templates with dynamic variables
- ⏰ **Scheduled SMS** — One-time or recurring with cron expressions
- 🔗 **Webhooks** — HMAC-signed webhooks for all SMS events
- 🔑 **API Keys** — Scoped keys with rate limiting and IP whitelisting
- 👥 **Team Management** — Role-based access (Admin, Operator, Viewer)
- 📇 **Contact Book** — Full CRM with labels and CSV import
- 📦 **Bulk SMS** — Send to thousands with CSV upload and variable substitution
- 🌐 **Self-Hosted** — Your data stays on your infrastructure
- 🐳 **Docker Ready** — One-command deployment with Docker Compose

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│                  SMSHIVE                     │
│                                             │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │ Next.js  │   │ NestJS   │   │ MongoDB │ │
│  │ Web App  │──▶│ API      │──▶│         │ │
│  │ :3000    │   │ :8000    │   │ :27017  │ │
│  └──────────┘   └──────────┘   └─────────┘ │
│                      ▲                      │
│                      │ WebSocket            │
│                 ┌────┴────┐                 │
│                 │ Android │                 │
│                 │ App(s)  │                 │
│                 └─────────┘                 │
└─────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | NestJS, Passport.js, Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Realtime | Socket.io WebSockets |
| Deployment | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- Android phone (for SMS gateway)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repo
git clone https://github.com/yourusername/smshive.git
cd smshive

# Copy environment variables
cp .env.example .env

# Start everything
docker compose up -d

# Open http://localhost:3000
```

### Option 2: Local Development

```bash
# Clone and install
git clone https://github.com/yourusername/smshive.git
cd smshive
npm install

# Start MongoDB (or use cloud)
# Update .env with your MONGODB_URI

# Start API (port 8000)
npm run dev --workspace=apps/api

# Start Web (port 3000)  
npm run dev --workspace=apps/web
```

## 📡 API Documentation

Once running, Swagger docs are available at: `http://localhost:8000/api/docs`

### Quick Examples

**Send SMS:**
```bash
curl -X POST http://localhost:8000/api/v1/gateway/devices/{deviceId}/send-sms \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["+919876543210"], "message": "Hello from SMSHIVE!"}'
```

**Get Pending SMS (Android polls this):**
```bash
curl http://localhost:8000/api/v1/gateway/devices/{deviceId}/pending-sms \
  -H "x-api-key: your_api_key"
```

## 📁 Project Structure

```
smshive/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # Shared UI components
│   │   │   └── lib/            # Utils, API client, auth store
│   │   └── package.json
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── config/         # Environment configuration
│       │   ├── common/         # Guards, filters, interceptors
│       │   └── modules/        # Feature modules
│       │       ├── auth/       # JWT authentication
│       │       ├── users/      # User management
│       │       ├── devices/    # Device management
│       │       ├── sms/        # SMS records
│       │       ├── gateway/    # SMS routing engine
│       │       ├── templates/  # Message templates
│       │       ├── webhooks/   # Webhook management
│       │       ├── api-keys/   # API key management
│       │       ├── scheduled/  # Scheduled messages
│       │       ├── contacts/   # Contact book
│       │       ├── analytics/  # Stats & charts
│       │       └── realtime/   # WebSocket gateway
│       └── package.json
│
├── packages/
│   └── shared-types/           # Shared TypeScript types
│
├── docker-compose.yml          # Full stack deployment
└── package.json                # Root workspace config
```

## 🔐 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/smshive` | MongoDB connection string |
| `JWT_SECRET` | — | JWT signing secret (change in production!) |
| `JWT_EXPIRATION` | `15m` | Access token expiration |
| `JWT_REFRESH_SECRET` | — | Refresh token secret |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh token expiration |
| `API_PORT` | `8000` | API server port |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | API URL for frontend |

## 📱 Android Companion App

The Android app turns your phone into an SMS gateway device. It:
- Connects to your SMSHIVE instance via API key
- Polls for pending SMS and sends them via the phone's native SMS capability
- Reports delivery status back to the server
- Sends heartbeats for online/offline detection
- Supports dual SIM selection

> **Coming soon** — The Android APK will be built separately.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with 💜 by <strong>Ramamani Behera</strong> for the developer community
</p>
