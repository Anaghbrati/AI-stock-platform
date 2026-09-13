
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  ChevronRight,
  CircleDollarSign,
  Eye,
  LineChart,
  LogIn,
  LogOut,
  Menu,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  User,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   SCROLL REVEAL
========================================================= */

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("feature-visible");
          observer.unobserve(element);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`feature-reveal ${className}`}>
      {children}
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Watchlist", href: "/watchlist" },
  { name: "Alerts", href: "/alerts" },
  { name: "AI Scanner", href: "/scanner" },
  { name: "Signals", href: "/signals" },
  { name: "Portfolio", href: "/portfolio" },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    
    <>
     
      <header className="navbar-enter fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative rounded-2xl border border-white/[0.09] bg-[#090C12]/80 px-3 py-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-4">
            <div className="flex h-11 items-center justify-between gap-3">
              {/* BRAND */}
              <Link
                href="/dashboard"
                className="group flex shrink-0 items-center gap-2.5"
              >
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.18)]">
                  <div className="absolute inset-[1px] rounded-[7px] bg-[#0B0E14]" />
                  <LineChart className="relative z-10 h-4 w-4 text-rose-400" />
                </div>

                <div className="hidden sm:block">
                  <div className="text-sm font-semibold tracking-tight text-white">
                    AI Stock
                  </div>
                  <div className="text-[8px] font-medium uppercase tracking-[0.18em] text-slate-600">
                    Intelligence
                  </div>
                </div>
              </Link>

              {/* DESKTOP NAV */}
              <nav className="hidden items-center gap-0.5 lg:flex">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative rounded-lg px-3 py-2 text-[11px] font-medium text-slate-500 transition-all duration-300 hover:bg-white/[0.045] hover:text-white"
                  >
                    {item.name}

                    <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-rose-400 opacity-0 transition-all duration-300 group-hover:w-5 group-hover:opacity-100" />
                  </Link>
                ))}
              </nav>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-1.5">
                {/* MARKET STATUS */}
                <div className="hidden items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.035] px-2.5 py-2 xl:flex">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-400">
                    Market Data
                  </span>
                </div>

                {/* PROFILE */}
                <Link
                  href="/profile"
                  aria-label="Profile"
                  className="group flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-500 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                >
                  <User className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </Link>

                {/* LOGIN / LOGOUT */}
                <Link
                  href="/login"
                  className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] font-semibold text-slate-300 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white sm:flex"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Link>

                {/* MOBILE MENU */}
                <button
                  type="button"
                  onClick={() => setMobileOpen((value) => !value)}
                  aria-label="Toggle navigation"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                >
                  {mobileOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* MOBILE NAV */}
            <div
              className={`overflow-hidden transition-all duration-300 lg:hidden ${
                mobileOpen
                  ? "max-h-[500px] border-t border-white/[0.07] pt-3 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <nav className="grid gap-1 pb-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white"
                  >
                    {item.name}
                    <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
                  </Link>
                ))}

                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-slate-400 transition hover:bg-white/[0.045] hover:text-white"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
        {eyebrow}
      </div>

      <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
        {title}
      </h2>

      <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function Glow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-[110px] ${className}`}
    />
  );
}

/* =========================================================
   SMALL STAT
========================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]">
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

/* =========================================================
   STOCK PREVIEW
========================================================= */

function StockPreview() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1119]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.08),transparent_30%)]" />

      <div className="relative p-5 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                <BarChart3 className="h-4 w-4 text-slate-300" />
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  RELIANCE
                </div>
                <div className="text-[10px] text-slate-500">
                  RELIANCE.NS
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-tight text-white">
                ₹1,420.80
              </span>

              <span className="mb-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                -1.30%
              </span>
            </div>
          </div>

          <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-red-400">
            BEARISH
          </div>
        </div>

        <div className="mt-7 h-[190px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 p-3">
          <svg
            viewBox="0 0 800 240"
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="stockFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="stockLine" x1="0" x2="1">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            <path
              d="M0 48 L55 60 L100 51 L145 77 L190 67 L235 93 L280 84 L325 105 L370 92 L415 128 L460 118 L505 142 L550 126 L595 157 L640 148 L685 173 L730 163 L800 190 L800 240 L0 240 Z"
              fill="url(#stockFill)"
            />

            <path
              className="draw-chart"
              d="M0 48 L55 60 L100 51 L145 77 L190 67 L235 93 L280 84 L325 105 L370 92 L415 128 L460 118 L505 142 L550 126 L595 157 L640 148 L685 173 L730 163 L800 190"
              fill="none"
              stroke="url(#stockLine)"
              strokeWidth="4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            <line
              x1="0"
              y1="118"
              x2="800"
              y2="118"
              stroke="white"
              strokeOpacity="0.07"
              strokeDasharray="5 8"
            />
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Market Cap" value="₹17.01L Cr" />
          <MiniStat label="P/E" value="22.78" />
          <MiniStat label="52W High" value="₹1,611.8" />
          <MiniStat label="52W Low" value="₹1,249.8" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TECHNICAL PREVIEW
========================================================= */

function TechnicalPreview() {
  const metrics = [
    ["RSI", "37.10", "Neutral"],
    ["MACD", "-7.50", "Bearish"],
    ["Histogram", "-4.57", "Negative"],
    ["EMA20 / EMA50", "Below", "Bearish"],
  ];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1119] p-5 sm:p-7">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-red-500/10 blur-[90px]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Technical Intelligence
            </div>

            <div className="mt-2 text-lg font-semibold text-white">
              Momentum snapshot
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <div className="text-4xl font-semibold text-red-400">-4/10</div>
            <div className="mt-1 text-xs text-slate-500">Signal score</div>
          </div>

          <div className="rounded-full bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-red-400">
            BEARISH
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {metrics.map(([label, value, status], index) => (
            <div
              key={label}
              className="technical-row flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="text-sm text-slate-400">{label}</span>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-white">
                  {value}
                </span>

                <span className="text-[10px] font-medium text-slate-500">
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AI PREVIEW
========================================================= */

function AIAnalysisPreview() {
  const points = [
    "Price remains below EMA20 and EMA50.",
    "MACD remains below its signal line.",
    "RSI is weak but not deeply oversold.",
  ];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1119] p-5 sm:p-7">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              AI Market Analysis
            </div>

            <div className="text-xs text-slate-500">
              Context-aware reasoning
            </div>
          </div>

          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-3 w-3" />
            AI
          </span>
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.07] bg-black/20 p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
            Outlook
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-semibold text-red-400">
              BEARISH
            </span>

            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-400">
              MEDIUM RISK
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {points.map((text, index) => (
              <div
                key={text}
                className="ai-point flex gap-3"
                style={{ animationDelay: `${index * 180}ms` }}
              >
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                <p className="text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SCANNER
========================================================= */

function ScannerPreview() {
  const steps = [
    {
      title: "Market",
      description: "Universe",
      icon: LineChart,
      color: "text-blue-400",
    },
    {
      title: "Sectors",
      description: "Relative strength",
      icon: BarChart3,
      color: "text-cyan-400",
    },
    {
      title: "Stocks",
      description: "Quantitative filter",
      icon: Radar,
      color: "text-violet-400",
    },
    {
      title: "AI",
      description: "Reasoning layer",
      icon: BrainCircuit,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0C111A] p-5 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.10),transparent_40%)]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              AI Scanner
            </div>

            <div className="mt-2 text-xl font-semibold text-white">
              From market to ranked opportunities
            </div>
          </div>

          <div className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-medium text-blue-400 sm:block">
            MULTI-STAGE SCAN
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                <div
                  className="scanner-node rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                  style={{ animationDelay: `${index * 180}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${step.color}`} />
                    <span className="text-[9px] text-slate-600">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="mt-6 text-sm font-semibold text-white">
                    {step.title}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {step.description}
                  </div>
                </div>

                {index !== steps.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-slate-600 md:block" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
            <span>Quantitative filtering</span>
            <ArrowRight className="h-3 w-3" />
            <span>Top candidates</span>
            <ArrowRight className="h-3 w-3" />
            <span>AI reasoning</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white">Ranked results</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIGNALS
========================================================= */

function SignalPreview() {
  const stats = [
    ["5D", "54.55%", "803"],
    ["10D", "54.49%", "802"],
    ["20D", "55.69%", "799"],
  ];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1119] p-5 sm:p-7">
      <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Signal Track Record
            </div>

            <div className="mt-2 text-xl font-semibold text-white">
              Historical accountability
            </div>
          </div>

          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {stats.map(([period, rate, count], index) => (
            <div
              key={period}
              className="signal-stat rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-xs font-medium text-slate-500">
                {period} FOLLOW-THROUGH
              </div>

              <div className="mt-3 text-3xl font-semibold text-emerald-400">
                {rate}
              </div>

              <div className="mt-2 text-[10px] text-slate-600">
                {count} usable historical instances
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Historical backtest statistics — not a guarantee of future results.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WATCHLIST + ALERTS
========================================================= */

function WatchlistAlertsPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1119] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/15">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-[70px] transition-transform duration-700 group-hover:scale-150" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>

            <span className="text-[10px] uppercase tracking-wider text-slate-600">
              WATCHLIST
            </span>
          </div>

          <div className="mt-7 space-y-3">
            {[
              ["RELIANCE", "₹1,420.80", "-1.30%"],
              ["TCS", "₹3,182.50", "+0.82%"],
              ["HDFCBANK", "₹1,011.30", "+0.47%"],
            ].map(([name, price, change]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <span className="text-sm font-semibold text-white">
                  {name}
                </span>

                <div className="text-right">
                  <div className="text-xs font-medium text-slate-300">
                    {price}
                  </div>

                  <div
                    className={`text-[10px] ${
                      change.startsWith("+")
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1119] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/15">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-red-500/10 blur-[70px] transition-transform duration-700 group-hover:scale-150" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <Bell className="h-5 w-5 text-red-400" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-ping rounded-full bg-red-400" />
            </div>

            <span className="text-[10px] uppercase tracking-wider text-slate-600">
              ALERTS
            </span>
          </div>

          <div className="mt-7 rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 animate-pulse rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />

              <div>
                <div className="text-sm font-semibold text-white">
                  Technical condition changed
                </div>

                <div className="mt-1 text-xs leading-5 text-slate-500">
                  Your monitored stock crossed a configured threshold.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Monitor what matters without watching charts all day.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PORTFOLIO
========================================================= */

function PortfolioPreview() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0D1119] p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.10),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(59,130,246,0.08),transparent_30%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
            <WalletCards className="h-3.5 w-3.5" />
            Coming Soon
          </div>

          <h3 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your investments.
            <br />
            <span className="text-slate-500">One intelligent view.</span>
          </h3>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Connect your authorized investment provider and bring holdings,
            invested amount, current value, P&amp;L, allocation and portfolio
            intelligence into one workspace.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              "Holdings & positions",
              "Portfolio P&L",
              "Sector allocation",
              "AI portfolio insights",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                  <span className="text-[10px] text-emerald-400">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="portfolio-float rounded-[24px] border border-white/[0.08] bg-black/30 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Portfolio overview
              </span>

              <CircleDollarSign className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="mt-6 text-3xl font-semibold text-white">
              ₹••••••
            </div>

            <div className="mt-1 text-xs text-slate-600">
              Connect your provider to view live values
            </div>

            <div className="mt-7 space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-blue-500 to-violet-400" />
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full w-[14%] rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function FeaturesPage() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-[#07090E] text-white">
        {/* BACKGROUND GLOWS */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <Glow className="left-[5%] top-[5%] h-[420px] w-[420px] bg-rose-500/10 animate-[floatGlow_12s_ease-in-out_infinite]" />

          <Glow className="right-[5%] top-[18%] h-[380px] w-[380px] bg-blue-500/10 animate-[floatGlow_15s_ease-in-out_infinite_reverse]" />

          <Glow className="bottom-[10%] left-[35%] h-[350px] w-[350px] bg-violet-500/[0.07] animate-[floatGlow_18s_ease-in-out_infinite]" />
        </div>

        {/* GRID */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative flex min-h-[100vh] items-center py-32 lg:py-36">
            <Glow className="left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 bg-rose-500/[0.06]" />

            <div className="relative grid w-full gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="hero-content">
                <div className="hero-item inline-flex items-center gap-2 rounded-full border border-rose-500/15 bg-rose-500/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Market Intelligence
                </div>

                <h1 className="hero-item mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[86px]">
                  Everything you need to{" "}
                  <span className="bg-gradient-to-r from-white via-slate-300 to-slate-600 bg-clip-text text-transparent">
                    understand the market.
                  </span>
                </h1>

                <p className="hero-item mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  One intelligent workspace for stock analysis, technical
                  intelligence, AI reasoning, discovery, signals, watchlists
                  and alerts.
                </p>

                <div className="hero-item mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/markets"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_12px_40px_rgba(255,255,255,0.12)]"
                  >
                    Explore the platform
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/scanner"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    Explore AI Scanner
                    <Radar className="h-4 w-4" />
                  </Link>
                </div>

                <div className="hero-item mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                    Real market data
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Quantitative analysis
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    AI reasoning
                  </span>
                </div>
              </div>

              <div className="hero-visual relative">
                <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-rose-500/[0.08] via-transparent to-blue-500/[0.08] blur-2xl" />

                <div className="relative">
                  <StockPreview />

                  <div className="absolute -bottom-7 -left-4 hidden w-52 rounded-2xl border border-white/10 bg-[#0D1119]/95 p-4 shadow-2xl backdrop-blur-xl sm:block animate-[floatCard_6s_ease-in-out_infinite]">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                      AI confidence
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-semibold text-white">
                        78%
                      </span>

                      <span className="text-[10px] text-emerald-400">
                        High context
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-violet-500 to-blue-400" />
                    </div>
                  </div>

                  <div className="absolute -right-4 -top-5 hidden rounded-2xl border border-white/10 bg-[#0D1119]/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block animate-[floatCard_7s_ease-in-out_infinite_reverse]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                      <span className="text-[10px] font-medium text-slate-400">
                        Intelligence active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              STOCK
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <SectionHeading
              eyebrow="01 — STOCK INTELLIGENCE"
              title="Go beyond the price."
              description="A stock is more than a number on a chart. Bring price action, fundamentals, financial statements, shareholding and technical context together in one view."
            />

            <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="space-y-4">
                  {[
                    [
                      "Fundamentals",
                      "P/E, P/B, EPS, debt, dividend yield and more.",
                    ],
                    [
                      "Financial statements",
                      "Revenue, operating income, net income, assets and debt.",
                    ],
                    [
                      "Shareholding",
                      "Understand institutional, insider and other ownership.",
                    ],
                    [
                      "Market context",
                      "52-week range, market cap, volume and price movement.",
                    ],
                  ].map(([title, text], index) => (
                    <div
                      key={title}
                      className="group flex gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs text-slate-500 transition-colors group-hover:bg-rose-500/10 group-hover:text-rose-400">
                        0{index + 1}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <StockPreview />
              </div>
            </div>
          </Reveal>

          {/* =================================================
              TECHNICAL
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <div className="grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <TechnicalPreview />

              <div>
                <SectionHeading
                  eyebrow="02 — TECHNICAL INTELLIGENCE"
                  title="Turn price action into signals."
                  description="Technical indicators become useful when they are interpreted together. Track momentum, moving averages and trend conditions instead of reading isolated numbers."
                />

                <div className="mt-8 flex flex-wrap gap-2">
                  {[
                    "RSI",
                    "MACD",
                    "EMA20",
                    "EMA50",
                    "Momentum",
                    "Trend",
                    "Volatility",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium text-slate-500 transition-colors hover:border-white/15 hover:text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* =================================================
              AI
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <SectionHeading
                  eyebrow="03 — AI INTELLIGENCE"
                  title="Numbers tell you what happened. AI helps you understand why."
                  description="AI connects technical conditions, market context and available stock information into a concise explanation—so you can understand the reasoning behind the analysis."
                />

                <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                  <BrainCircuit className="h-4 w-4 text-violet-400" />
                  Context-aware market reasoning
                </div>
              </div>

              <AIAnalysisPreview />
            </div>
          </Reveal>

          {/* =================================================
              SCANNER
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <SectionHeading
              eyebrow="04 — AI SCANNER"
              title="Stop searching. Start discovering."
              description="The scanner doesn't throw every stock at an AI model. It narrows the market quantitatively first, then applies AI reasoning to the strongest candidates."
            />

            <div className="mt-14">
              <ScannerPreview />
            </div>
          </Reveal>

          {/* =================================================
              SIGNALS
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <SectionHeading
                  eyebrow="05 — SIGNALS"
                  title="Don't trust the signal. Check its record."
                  description="Signals become more useful when they are accountable. Track historical backtests and live outcomes instead of presenting a signal without context."
                />

                <Link
                  href="/signals"
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-emerald-400"
                >
                  View signal track record
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <SignalPreview />
            </div>
          </Reveal>

          {/* =================================================
              WATCHLIST / ALERTS
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <SectionHeading
              eyebrow="06 — MONITORING"
              title="Your market. Your shortlist."
              description="Keep the stocks that matter close. Then let alerts tell you when something changes."
            />

            <div className="mt-14">
              <WatchlistAlertsPreview />
            </div>
          </Reveal>

          {/* =================================================
              PORTFOLIO
          ================================================= */}

          <Reveal className="py-24 lg:py-36">
            <SectionHeading
              eyebrow="07 — PORTFOLIO INTELLIGENCE"
              title="Your investments. One intelligent view."
              description="Portfolio intelligence is coming next—connecting authorized investment data with deterministic portfolio calculations and AI-powered insights."
            />

            <div className="mt-14">
              <PortfolioPreview />
            </div>
          </Reveal>

          {/* =================================================
              FINAL CTA
          ================================================= */}

          <Reveal className="py-28 lg:py-40">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0D1119] px-6 py-20 text-center sm:px-10 lg:py-28">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.13),transparent_38%),radial-gradient(circle_at_20%_100%,rgba(59,130,246,0.09),transparent_30%)]" />

              <div className="relative mx-auto max-w-3xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Sparkles className="h-5 w-5 text-rose-400" />
                </div>

                <h2 className="mt-7 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  The market is complex.
                  <br />
                  <span className="text-slate-500">
                    Your workspace doesn&apos;t have to be.
                  </span>
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                  Analyze deeper. Discover faster. Understand the reasoning
                  behind the market.
                </p>

                <div className="mt-9">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,255,255,0.12)]"
                  >
                    Explore the platform
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="h-10" />
        </div>
      </main>

      <style jsx global>{`
        /* ============================================
           NAVBAR
        ============================================ */

        @keyframes navbarIn {
          from {
            opacity: 0;
            transform: translate3d(0, -20px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .navbar-enter {
          opacity: 0;
          animation: navbarIn 0.75s 0.05s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ============================================
           HERO
        ============================================ */

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes heroVisual {
          from {
            opacity: 0;
            transform: translate3d(30px, 0, 0) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .hero-item {
          opacity: 0;
          animation: heroIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .hero-item:nth-child(1) {
          animation-delay: 0.3s;
        }

        .hero-item:nth-child(2) {
          animation-delay: 0.42s;
        }

        .hero-item:nth-child(3) {
          animation-delay: 0.56s;
        }

        .hero-item:nth-child(4) {
          animation-delay: 0.68s;
        }

        .hero-item:nth-child(5) {
          animation-delay: 0.8s;
        }

        .hero-visual {
          opacity: 0;
          animation: heroVisual 1s 0.5s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ============================================
           AMBIENT
        ============================================ */

        @keyframes floatGlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(25px, -20px, 0) scale(1.08);
          }
        }

        @keyframes floatCard {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        /* ============================================
           CHART
        ============================================ */

        @keyframes drawChart {
          from {
            stroke-dashoffset: 1600;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        .draw-chart {
          stroke-dasharray: 1600;
          stroke-dashoffset: 1600;
          animation: drawChart 2.2s 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ============================================
           SCROLL REVEAL
        ============================================ */

        .feature-reveal {
          opacity: 0;
          transform: translate3d(0, 45px, 0);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .feature-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        /* ============================================
           MICRO ANIMATIONS
        ============================================ */

        @keyframes scannerPulse {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .technical-row,
        .ai-point,
        .scanner-node,
        .signal-stat {
          opacity: 0;
          animation: scannerPulse 0.65s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .portfolio-float {
          animation: floatCard 7s ease-in-out infinite;
        }

        /* ============================================
           REDUCED MOTION
        ============================================ */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .feature-reveal {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}

