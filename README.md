# WealthWell — Wealth Wellness Hub

A unified financial wellness dashboard that brings together traditional and digital assets into a single, intuitive interface. Built for the FinTech Innovators Hackathon 2026.

## Project Structure

```
wealthwell/
├── server/              ← Backend (Express.js API)
│   └── index.js         ← All API routes, auth, wellness engine
├── client/              ← Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx      ← Main application
│   │   └── main.jsx     ← Entry point
│   ├── index.html
│   └── vite.config.js   ← Proxies /api to backend
├── package.json         ← Root scripts
└── README.md
```

## Quick Start (Windows / Mac / Linux)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (download the LTS version)

### Setup

1. **Open this folder in VS Code**

2. **Open Terminal** (menu: Terminal → New Terminal)

3. **Install everything:**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

4. **Start the backend** (in one terminal):
   ```bash
   npm run server
   ```
   You should see: `🟢 WealthWell API server running on http://localhost:3001`

5. **Start the frontend** (open a SECOND terminal: Terminal → New Terminal):
   ```bash
   npm run client
   ```
   You should see a URL like `http://localhost:5173` — click it!

### Demo Login
- **Email:** sarah@wealthwell.com
- **Password:** demo1234
- **2FA Code:** any 6 digits (e.g., 123456)

## Features

### Core
- 🔐 Authentication with 2FA (authenticator-based)
- 🏠 Guided onboarding with account linking
- 💼 Wealth Wallet — unified view of all assets (add/delete assets)
- 📊 Dashboard with net worth tracking, wealth trends, allocation charts

### Analytics & AI
- 📈 Financial Wellness Score (0-100) with 6 sub-metrics
- 🕸️ Radar chart breakdown (diversification, liquidity, growth, risk, tax, emergency fund)
- 🤖 AI Coach with conversational chat interface
- 💡 7 types of auto-generated insights (risk warnings, tax opportunities, positive signals)
- 🎯 Scenario Simulator (market crash, rate hike, bull run, recession + custom)

### Business Model
- 💳 3-tier subscription: Lite (free), Pro ($9.90/mo), Family ($19.90/mo)
- 🔗 Stripe checkout integration (mock for demo)

### Security
- 🔒 Session-based authentication with Bearer tokens
- 📱 Two-factor authentication flow
- 🛡️ Read-only data access model
- 🔐 Password hashing (SHA-256)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/verify-2fa | Verify authenticator code |
| POST | /api/auth/logout | End session |
| GET | /api/portfolio | Get all assets + allocation |
| POST | /api/portfolio/assets | Add new asset |
| DELETE | /api/portfolio/assets/:id | Remove asset |
| GET | /api/wellness | Get wellness score + metrics |
| GET | /api/insights | Get AI-generated insights |
| POST | /api/ai/chat | Chat with AI coach |
| POST | /api/scenarios/simulate | Run scenario simulation |
| POST | /api/payments/create-checkout | Create Stripe checkout |
| GET | /api/payments/subscription | Get subscription status |
| GET | /api/user/profile | Get user profile |
| PUT | /api/user/profile | Update profile |

## Tech Stack
- **Frontend:** React 18, Vite, Recharts, Lucide React
- **Backend:** Node.js, Express.js
- **Auth:** Session tokens + TOTP-ready 2FA
- **Payments:** Stripe integration (mock)
- **AI:** Context-aware keyword engine (production: LLM API integration)

## Contextualized for Singapore
- CPF (OA/SA), SRS, HDB, COE references
- SGD currency
- SingPass login option
- Singapore-specific financial products (SSBs, T-bills, STI ETF)
- MAS regulatory references
