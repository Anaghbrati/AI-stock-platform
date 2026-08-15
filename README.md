📁 Project Structure
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
📦 Install Dependencies

If you clone this project on another device, you need to install the dependencies for both the Next.js frontend and the FastAPI backend.

1. Prerequisites

Install the following first:

Node.js 18+
npm
Python 3.10+

Check Node.js:

node --version

Check npm:

npm --version

Check Python:

python --version
2. Install Frontend Dependencies

From the project root:

npm install

This automatically installs all packages listed in:

package.json

and uses:

package-lock.json

to reproduce the correct dependency versions.

Core Frontend Packages

The project uses:

npm install @supabase/ssr @supabase/supabase-js lightweight-charts zod lucide-react date-fns
Package Purpose
Package	Purpose
next	Next.js framework
react	Frontend UI
react-dom	React browser rendering
@supabase/ssr	Supabase SSR integration
@supabase/supabase-js	Supabase client
lightweight-charts	Interactive financial charts
zod	Data/API validation
lucide-react	UI icons
date-fns	Date and time utilities

Important: When setting up the project on another device, you do not need to install these packages individually.

Simply run:

npm install
3. Install Backend Dependencies

Go to the market-data service:

cd market-data-service

Create a Python virtual environment:

python -m venv venv
Windows

Activate:

.\venv\Scripts\Activate.ps1
macOS / Linux
source venv/bin/activate

Install all Python dependencies:

pip install -r requirements.txt

The requirements.txt file contains the backend dependencies.

Current core dependencies:

fastapi
uvicorn
yfinance
4. Environment Variables

The .env.local file is intentionally not committed to GitHub because it can contain private credentials.

Create this file in the project root:

.env.local

Add:

# Market Data
MARKET_DATA_PROVIDER=yahoo
MARKET_DATA_API_URL=http://localhost:8000


# AI Providers
AI_PROVIDER=groq


GROQ_API_KEY=
GEMINI_API_KEY=


# Supabase - Future
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=


# News - Future
NEWS_PROVIDER=free

Never commit:

.env
.env.local
.env.*.local
▶️ Running the Project

The application currently requires two terminals.

Terminal 1 — Next.js Frontend

From the project root:

npm run dev

Frontend:

http://localhost:3000
Terminal 2 — FastAPI Market Data Service

Navigate to:

cd market-data-service

Activate the virtual environment.

Then run:

uvicorn app.main:app --reload --port 8000

Backend:

http://localhost:8000
📊 Testing the Application
Frontend
http://localhost:3000
Stock Page

Example:

http://localhost:3000/stock/RELIANCE.NS

Other examples:

http://localhost:3000/stock/TCS.NS
http://localhost:3000/stock/AAPL
🔌 Market Data API

The FastAPI service currently provides:

GET /api/quote/{ticker}

Example:

http://localhost:8000/api/quote/RELIANCE.NS

The API retrieves stock information using Yahoo Finance through yfinance.

📚 FastAPI Swagger Documentation

FastAPI provides interactive API documentation at:

http://localhost:8000/docs

Use this page to test the market-data API.

🧪 Production Build

Before pushing changes to GitHub, verify the Next.js production build:

npm run build

If successful:

✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages

Run the production application with:

npm start
🔌 Provider Architecture

The market-data layer is designed around an abstraction.

                    MarketDataProvider
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Yahoo Provider              Future Paid Provider
             │                           │
         yfinance                  Polygon / Kite

The core application does not directly depend on a specific market-data provider.

This allows future providers to be introduced without rewriting the stock pages or business logic.

💰 $0 Beta Strategy

The initial Beta version is designed to operate with zero out-of-pocket cost.

Service	Beta Provider
Frontend	Vercel Free
Source Control	GitHub
Market Data	Yahoo Finance / yfinance
Backend	FastAPI
Database	Supabase Free
Authentication	Supabase Free
AI	Groq / Gemini Free Tier
Charts	Lightweight Charts
Automation	GitHub Actions / Vercel Cron
🔄 Future Paid Provider Strategy

The architecture is designed for future provider replacement.

Market Data

Current:

MARKET_DATA_PROVIDER=yahoo

Future:

MARKET_DATA_PROVIDER=polygon

or:

MARKET_DATA_PROVIDER=kite
AI

Current:

AI_PROVIDER=groq

Future:

AI_PROVIDER=openai

or:

AI_PROVIDER=claude

The goal is to change provider configuration and adapters without rewriting the frontend or core business logic.
