# 📈 AI Stock Analysis & Market Dashboard

An AI-powered stock analysis and market dashboard platform built with **Next.js, TypeScript, FastAPI, Yahoo Finance, and AI providers**.

The project is currently in its **Beta / MVP phase** and is designed to operate with a **$0 out-of-pocket infrastructure cost** using free-tier services.

---

## 🚀 Features

* 📊 Real-time / near-real-time stock market data
* 📈 Interactive stock charts
* 🔎 Individual stock analysis pages
* 🤖 AI-powered analysis architecture
* 🔌 Pluggable market-data provider architecture
* 🐍 FastAPI market-data backend
* ⚡ Next.js frontend
* 📡 Yahoo Finance integration through `yfinance`
* 🧩 Provider abstraction for future paid APIs
* 🧪 FastAPI Swagger API documentation
* 💰 Designed for a $0-cost Beta deployment

---

# 📁 Project Structure

```text
ai-stock-platform/
│
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── stock/
│   │   │   └── [ticker]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│       ├── providers/
│       │   └── market-data/
│       │       ├── index.ts
│       │       ├── provider.ts
│       │       ├── types.ts
│       │       └── yahoo.ts
│       │
│       └── services/
│           └── stock-service.ts
│
├── market-data-service/
│   ├── app/
│   │   ├── services/
│   │   │   └── yahoo_service.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── .env.local
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Lightweight Charts
* Zod
* Lucide React
* date-fns

## Backend

* Python
* FastAPI
* Uvicorn
* yfinance

## Market Data

* Yahoo Finance
* `yfinance`

## AI

* Groq
* Google Gemini

## Future Infrastructure

* Supabase
* Polygon
* Zerodha Kite
* OpenAI
* Claude

---

# 📦 Installation

If you clone this project on another device, you need to install dependencies for **both the Next.js frontend and the FastAPI backend**.

---

## 1. Prerequisites

Install the following:

* Node.js 18+
* npm
* Python 3.10+

### Check Node.js

```bash
node --version
```

### Check npm

```bash
npm --version
```

### Check Python

```bash
python --version
```

---

# 2. Install Frontend Dependencies

From the project root:

```bash
npm install
```

This automatically installs all packages listed in:

```text
package.json
```

and uses:

```text
package-lock.json
```

to reproduce the correct dependency versions.

## Core Frontend Packages

The project uses:

```bash
npm install @supabase/ssr @supabase/supabase-js lightweight-charts zod lucide-react date-fns
```

### Package Purpose

| Package                 | Purpose                      |
| ----------------------- | ---------------------------- |
| `next`                  | Next.js framework            |
| `react`                 | Frontend UI                  |
| `react-dom`             | React browser rendering      |
| `@supabase/ssr`         | Supabase SSR integration     |
| `@supabase/supabase-js` | Supabase client              |
| `lightweight-charts`    | Interactive financial charts |
| `zod`                   | Data/API validation          |
| `lucide-react`          | UI icons                     |
| `date-fns`              | Date and time utilities      |

> **Important:** You do not need to install these packages individually when setting up the project. Simply run:

```bash
npm install
```

---

# 3. Install Backend Dependencies

Navigate to the market-data service:

```bash
cd market-data-service
```

Create a Python virtual environment:

```bash
python -m venv venv
```

## Windows

Activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, you can use:

```powershell
.\venv\Scripts\activate
```

## macOS / Linux

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

The `requirements.txt` file contains the required backend packages:

```text
fastapi
uvicorn
yfinance
```

---

# 🔐 Environment Variables

The `.env.local` file is intentionally **not committed to GitHub** because it may contain private credentials.

Create the following file in the project root:

```text
.env.local
```

Add:

```env
# ==============================
# Market Data
# ==============================

MARKET_DATA_PROVIDER=yahoo
MARKET_DATA_API_URL=http://localhost:8000


# ==============================
# AI Providers
# ==============================

AI_PROVIDER=groq

GROQ_API_KEY=
GEMINI_API_KEY=


# ==============================
# Supabase - Future
# ==============================

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=


# ==============================
# News - Future
# ==============================

NEWS_PROVIDER=free
```

### ⚠️ Never commit secrets

Make sure the following are included in `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

Never commit:

* API keys
* Supabase credentials
* AI provider credentials
* Private environment variables

---

# ▶️ Running the Project

The application currently requires **two terminals**.

---

## Terminal 1 — Next.js Frontend

From the project root:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

## Terminal 2 — FastAPI Market Data Service

Navigate to:

```bash
cd market-data-service
```

Activate the Python virtual environment.

### Windows

```powershell
.\venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source venv/bin/activate
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

---

# 🌐 Application URLs

## Frontend

```text
http://localhost:3000
```

## Dashboard

```text
http://localhost:3000/dashboard
```

## Stock Page

Example:

```text
http://localhost:3000/stock/RELIANCE.NS
```

Other examples:

```text
http://localhost:3000/stock/TCS.NS
```

```text
http://localhost:3000/stock/AAPL
```

---

# 🔌 Market Data API

The FastAPI market-data service currently provides:

```http
GET /api/quote/{ticker}
```

### Example

```text
http://localhost:8000/api/quote/RELIANCE.NS
```

Another example:

```text
http://localhost:8000/api/quote/TCS.NS
```

The API retrieves stock information using **Yahoo Finance through `yfinance`**.

---

# 📚 FastAPI Swagger Documentation

FastAPI automatically provides interactive API documentation.

Open:

```text
http://localhost:8000/docs
```

You can use the Swagger UI to:

* View available endpoints
* Test API requests
* Check request parameters
* Inspect API responses
* Debug the market-data service

---

# 🧪 Production Build

Before pushing changes to GitHub, verify that the Next.js application builds successfully.

Run:

```bash
npm run build
```

A successful build should complete without TypeScript or compilation errors.

Then start the production server:

```bash
npm start
```

The production application will run on:

```text
http://localhost:3000
```

---

# 🔌 Provider Architecture

The market-data layer is designed around a provider abstraction.

```text
                    MarketDataProvider
                           │
              ┌────────────┴────────────┐
              │                         │
       Yahoo Provider             Future Provider
              │                         │
          yfinance                Polygon / Kite
```

The core application does **not directly depend on a specific market-data provider**.

Instead, providers implement a common interface.

This makes it possible to replace or add providers without rewriting:

* Stock pages
* Dashboard logic
* Business logic
* Market-data consumers

---

# 🏗️ Architecture Overview

```text
                         ┌──────────────────────┐
                         │      Next.js UI      │
                         │                      │
                         │ Dashboard / Stocks   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Stock Service      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Market Data Provider │
                         │      Interface       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ FastAPI Market Data  │
                         │       Service        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Yahoo Finance    │
                         │      yfinance        │
                         └──────────────────────┘
```

---

# 💰 $0 Beta Strategy

The initial Beta version is designed to operate with **zero out-of-pocket infrastructure cost**.

| Service        | Beta Provider                |
| -------------- | ---------------------------- |
| Frontend       | Vercel Free                  |
| Source Control | GitHub                       |
| Market Data    | Yahoo Finance / yfinance     |
| Backend        | FastAPI                      |
| Database       | Supabase Free                |
| Authentication | Supabase Free                |
| AI             | Groq / Gemini Free Tier      |
| Charts         | Lightweight Charts           |
| Automation     | GitHub Actions / Vercel Cron |

> Free-tier limits and provider policies can change over time. The architecture is designed so paid providers can be introduced later if required.

---

# 🔄 Future Paid Provider Strategy

The architecture is designed for future provider replacement.

## Market Data

### Current

```env
MARKET_DATA_PROVIDER=yahoo
```

### Future — Polygon

```env
MARKET_DATA_PROVIDER=polygon
```

### Future — Kite

```env
MARKET_DATA_PROVIDER=kite
```

The application can switch providers through the provider/adaptor layer rather than rewriting the entire application.

---

# 🤖 AI Provider Strategy

The same abstraction approach is planned for AI providers.

### Current

```env
AI_PROVIDER=groq
```

### Future — OpenAI

```env
AI_PROVIDER=openai
```

### Future — Claude

```env
AI_PROVIDER=claude
```

The objective is to keep AI-provider-specific implementation isolated from the core application logic.

---

# 🗺️ Development Roadmap

## Phase 1 — Beta

* [x] Next.js frontend
* [x] Stock pages
* [x] Dashboard foundation
* [x] FastAPI market-data service
* [x] Yahoo Finance integration
* [x] Provider abstraction
* [x] Interactive charts
* [x] Local development environment

## Phase 2 — Intelligence

* [ ] AI stock analysis
* [ ] AI-generated market summaries
* [ ] Financial metrics analysis
* [ ] News sentiment analysis
* [ ] Bullish / bearish signals
* [ ] AI explanations for signals

## Phase 3 — User Platform

* [ ] Supabase authentication
* [ ] User profiles
* [ ] Watchlists
* [ ] Saved stocks
* [ ] Portfolio tracking
* [ ] Personalized dashboard

## Phase 4 — Advanced Market Intelligence

* [ ] Technical indicators
* [ ] Fundamental analysis
* [ ] Market screening
* [ ] Advanced signals
* [ ] Alerts and notifications
* [ ] Historical performance analysis

## Phase 5 — Live Trading Integration

* [ ] Broker integration
* [ ] Paper trading
* [ ] Order management
* [ ] Risk management
* [ ] Trading automation

> ⚠️ Live trading functionality should only be introduced after proper testing, risk controls, regulatory review, and broker integration.

---

# 🧑‍💻 Development Workflow

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

### 2. Enter the project

```bash
cd ai-stock-platform
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Configure environment variables

Create:

```text
.env.local
```

and add the required variables.

### 5. Install backend dependencies

```bash
cd market-data-service
python -m venv venv
```

Activate the environment and install:

```bash
pip install -r requirements.txt
```

### 6. Start FastAPI

```bash
uvicorn app.main:app --reload --port 8000
```

### 7. Start Next.js

Open another terminal from the project root:

```bash
npm run dev
```

### 8. Open the application

```text
http://localhost:3000
```

---

# 🐛 Troubleshooting

## npm command not found

Verify Node.js installation:

```bash
node --version
npm --version
```

If npm is unavailable, reinstall Node.js and restart VS Code.

---

## FastAPI command not found

Make sure the virtual environment is activated.

Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
source venv/bin/activate
```

Then install dependencies:

```bash
pip install -r requirements.txt
```

---

## Port 8000 already in use

Run FastAPI on another port:

```bash
uvicorn app.main:app --reload --port 8001
```

Then update:

```env
MARKET_DATA_API_URL=http://localhost:8001
```

---

## Port 3000 already in use

Run Next.js on another port:

```bash
npm run dev -- -p 3001
```

Then open:

```text
http://localhost:3001
```

---

# 🔒 Security

Never commit sensitive credentials to GitHub.

Ensure your `.gitignore` contains:

```gitignore
node_modules/
.next/
venv/
.env
.env.local
.env.*.local
__pycache__/
*.pyc
```

If an API key is accidentally pushed to GitHub:

1. Revoke the exposed key.
2. Generate a new key.
3. Update `.env.local`.
4. Remove the secret from the repository history if necessary.

---

# 📄 License

This project is currently under development.

Add your preferred license here before public distribution.

---

# ⭐ Project Status

**Status:** 🟢 Beta / MVP Development

**Current Focus:**

```text
Next.js
   +
FastAPI
   +
Yahoo Finance
   +
Provider Architecture
   +
AI Integration
```

The architecture is intentionally designed to start at **$0 infrastructure cost** while remaining extensible enough to support paid market-data providers, AI providers, authentication, portfolio management, and live trading integrations in future versions.

---

## 🚀 Getting Started Quickly

For a fresh installation, the essential commands are:

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd market-data-service
python -m venv venv
```

Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
source venv/bin/activate
```

Then:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Finally open:

```text
http://localhost:3000
```

**Happy Building! 📈🤖**
