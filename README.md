# WealthWell: Wealth Wellness Hub

A unified financial wellness dashboard bringing together traditional and digital assets into a single, intuitive interface. With built-in LLM-integration to provide personalised insights on one's personal finance. Built for the FinTech Innovators Hackathon 2026.

---

## 🚀 Quick Start (Docker: Recommended for Judges)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

**1. Set up your environment file**

Copy the provided template:
```bash
cp .env.example .env
```

Then open `.env` and fill in your own credentials (see [Environment Variables](#environment-variables) below).

**2. Build and run**
```bash
docker compose up --build
```

**3. Open the app**
```
http://localhost:3001
```

**Demo login:**
- Email: `sarah@wealthwell.com`
- Password: `demo1234`
- 2FA Code: any 6 digits (e.g. `123456`)

---

## 🔑 Environment Variables

Create a `.env` file in the root folder (copy from `.env.example`). You need to fill in two things:

### 1. LLM — Groq API Key (required for AI Chat feature)

The AI Coach uses [Groq](https://groq.com) for fast LLM inference.

1. Go to [console.groq.com](https://console.groq.com) and sign up (free)
2. Create an API key under **API Keys**
3. Paste it into `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

> **If left blank:** The AI Chat feature will return a fallback message instead of crashing. All other features work normally.

---

### 2. Email — Gmail SMTP (optional, for monthly report emails)

The email report feature sends monthly summaries via Gmail.

1. Use any Gmail account
2. Enable **2-Step Verification** on that account
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Create an App Password (select "Mail" + "Other")
5. Paste into `.env`:
```
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

> **If left blank:** Email sending is skipped and a preview is logged to the console instead. All other features work normally — **you do not need this to evaluate the app.**

---

### Full `.env` reference

```
# LLM (Groq) — get free key at console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Email (Gmail SMTP) — optional, see instructions above
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_gmail_app_password

# Server (leave as-is)
PORT=3001
NODE_ENV=production
```

---

## 🐳 Docker Commands

| Action | Command |
|---|---|
| First build + start | `docker compose up --build` |
| Start (after first build) | `docker compose up` |
| Stop | `docker compose down` |
| View live logs | `docker compose logs -f` |
| Health check | `curl http://localhost:3001/api/health` |

---

## 💻 Local Development (without Docker)

### Prerequisites
- Node.js v18+

### Setup

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Run

Open **two terminals:**

```bash
# Terminal 1 — Backend (port 3001)
npm run server

# Terminal 2 — Frontend (port 5173)
npm run client
```

Then open `http://localhost:5173`

> For local dev, set environment variables the PowerShell way:
> ```powershell
> $env:GROQ_API_KEY="your_key_here"
> $env:SMTP_USER="yourgmail@gmail.com"
> $env:SMTP_PASS="your_app_password"
> node server/index.js
> ```

---

## 📁 Project Structure

```
wealthwell/
├── .env                  ← Your secrets (never commit this)
├── .env.example          ← Template for judges to copy
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json          ← Root/server dependencies
├── server/
│   └── index.js          ← Express API (auth, wellness engine, AI, email)
└── client/
    ├── package.json      ← Frontend dependencies
    ├── vite.config.js    ← Dev proxy + build config
    ├── index.html
    └── src/
        ├── App.jsx       ← Main React application
        ├── main.jsx      ← Entry point
        ├── i18n.js       ← Internationalisation setup
        └── locales/      ← Translations (en, zh, hi, es, fr)
```

---

## ✨ Features

| Category | Feature |
|---|---|
| Auth | Login with 2FA, session tokens |
| Portfolio | Wealth Wallet — add/delete assets (cash, CPF, equities, crypto, property, vehicle) |
| Dashboard | Net worth tracking, wealth trends, allocation charts |
| Wellness | Financial Wellness Score (0–100) across 6 sub-metrics |
| AI | AI Coach chat, 7 auto-generated insight types, scenario simulator |
| Subscriptions | Lite / Pro / Family tiers with Stripe checkout (mock) |
| Email | Scheduled multilingual monthly report emails |
| i18n | Full UI in English, 中文, हिन्दी, Español, Français |

---

## 🇸🇬 Singapore Context

- CPF (OA/SA), SRS, HDB, COE references
- SGD as default currency
- SingPass login option
- Singapore-specific products: SSBs, T-bills, STI ETF
- MAS regulatory references

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Recharts, Lucide React, i18next
- **Backend:** Node.js, Express.js, Nodemailer
- **AI:** Groq LLM API (llama3-8b)
- **Auth:** Bearer token sessions + TOTP-ready 2FA
- **Payments:** Stripe integration (mock demo)
- **Deployment:** Docker + Docker Compose
