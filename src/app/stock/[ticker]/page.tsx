import Link from "next/link";

import AIAnalysis from "../../../components/analysis/AIAnalysis";
import TechnicalSignal from "../../../components/analysis/TechnicalSignal";
import StockChartContainer from "../../../components/charts/StockChartContainer";

import {
  getStockQuote,
  getStockFundamentals,
} from "../../../lib/services/stock.service";

interface StockPageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function StockPage({
  params,
}: StockPageProps) {
  const { ticker } = await params;

  const normalizedTicker = ticker.toUpperCase();

  // ========================================
  // STOCK QUOTE
  // ========================================

  const stock = await getStockQuote(
    normalizedTicker
  );

  // ========================================
  // STOCK FUNDAMENTALS
  // ========================================

  const fundamentals =
    await getStockFundamentals(
      normalizedTicker
    );

  // ========================================
  // TECHNICAL + AI ANALYSIS
  // ========================================

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const analysisResponse = await fetch(
    `${baseUrl}/api/analysis/${encodeURIComponent(
      normalizedTicker
    )}`,
    {
      cache: "no-store",
    }
  );

  if (!analysisResponse.ok) {
    const errorText =
      await analysisResponse.text();

    console.error(
      "Analysis API failed:",
      errorText
    );

    throw new Error(
      "Failed to fetch technical analysis"
    );
  }

  const analysis =
    await analysisResponse.json();

  // ========================================
  // SAFETY FALLBACK
  // ========================================

  const technical =
    analysis?.technical ?? {
      signal: "NEUTRAL",
      score: 0,
      reasons: [
        "Technical analysis unavailable",
      ],
      rsi: null,
      macd: null,
      macdSignal: null,
    };

  const ai =
    analysis?.ai ?? {
      summary:
        "AI analysis is currently unavailable.",
      outlook: "NEUTRAL",
      risk: "UNKNOWN",
      keyPoints: [],
    };

  // ========================================
  // PRICE CHANGE
  // ========================================

  const change =
    stock.changePercent ?? null;

  const isPositive =
    change !== null && change > 0;

  const isNegative =
    change !== null && change < 0;

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {/* =====================================
            TOP NAVIGATION
        ====================================== */}

        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to dashboard
          </Link>

          <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-600">
            Market Analysis
          </span>

        </div>


        {/* =====================================
            STOCK HERO
        ====================================== */}

        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">

          {/* Background glow */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#ff4d61]/[0.06] blur-3xl" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              {/* Stock identity */}

              <div>

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff4d61]/10 bg-[#ff4d61]/10 text-lg font-black text-[#ff6678]">

                    {getInitials(
                      stock.companyName,
                      normalizedTicker
                    )}

                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                      {normalizedTicker}
                    </p>

                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                      {stock.companyName}
                    </h1>

                  </div>

                </div>


                {/* Price */}

                <div className="mt-7 flex flex-wrap items-end gap-4">

                  <div>

                    <p className="text-xs text-slate-600">
                      Current Price
                    </p>

                    <p className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">

                      {stock.currency ===
                      "INR"
                        ? "₹"
                        : "$"}

                      {formatPrice(
                        stock.price
                      )}

                    </p>

                  </div>


                  <div
                    className={`mb-1 rounded-xl px-3 py-2 text-sm font-bold ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isNegative
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/[0.04] text-slate-500"
                    }`}
                  >

                    {change !== null
                      ? `${
                          isPositive
                            ? "+"
                            : ""
                        }${change.toFixed(
                          2
                        )}%`
                      : "N/A"}

                  </div>

                </div>

              </div>


              {/* Watchlist */}

              <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-[#ff4d61]/20 hover:bg-[#ff4d61]/5 hover:text-[#ff6678]">

                <span className="text-lg">
                  ☆
                </span>

                Add to watchlist

              </button>

            </div>

          </div>

        </section>


        {/* =====================================
            QUICK STATS
        ====================================== */}

        <section className="mt-6">

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {/* Volume */}

            <StatCard
              label="Volume"
              value={
                stock.volume !== null &&
                stock.volume !== undefined
                  ? stock.volume.toLocaleString(
                      "en-IN"
                    )
                  : "N/A"
              }
            />


            {/* Market Cap */}

            <StatCard
              label="Market Cap"
              value={
                stock.marketCap !== null &&
                stock.marketCap !== undefined
                  ? formatLargeNumber(
                      stock.marketCap
                    )
                  : "N/A"
              }
            />


            {/* 52 Week High */}

            <StatCard
              label="52W High"
              value={
                stock.fiftyTwoWeekHigh != null
                  ? `${
                      stock.currency ===
                      "INR"
                        ? "₹"
                        : "$"
                    }${formatPrice(
                      stock.fiftyTwoWeekHigh
                    )}`
                  : "N/A"
              }
            />


            {/* 52 Week Low */}

            <StatCard
              label="52W Low"
              value={
                stock.fiftyTwoWeekLow != null
                  ? `${
                      stock.currency ===
                      "INR"
                        ? "₹"
                        : "$"
                    }${formatPrice(
                      stock.fiftyTwoWeekLow
                    )}`
                  : "N/A"
              }
            />

          </div>

        </section>


        {/* =====================================
            CHART
        ====================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">

          <div className="border-b border-white/[0.05] px-6 py-5">

            <div>

              <p className="text-sm font-bold text-white">
                Price Chart
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Historical price movement
              </p>

            </div>

          </div>

          <div className="p-3 sm:p-5">

            <StockChartContainer
              ticker={normalizedTicker}
            />

          </div>

        </section>


        {/* =====================================
            FUNDAMENTALS
        ====================================== */}

        <section className="mt-6">

          <div className="mb-5">

            <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
              Financial Data
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Fundamentals
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Key financial metrics and valuation data.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {/* P/E */}

            <FundamentalCard
              label="P/E Ratio"
              value={
                fundamentals.peRatio != null
                  ? fundamentals.peRatio.toFixed(
                      2
                    )
                  : "N/A"
              }
              description="Price / Earnings"
            />


            {/* P/B */}

            <FundamentalCard
              label="P/B Ratio"
              value={
                fundamentals.pbRatio != null
                  ? fundamentals.pbRatio.toFixed(
                      2
                    )
                  : "N/A"
              }
              description="Price / Book"
            />


            {/* ROE */}

            <FundamentalCard
              label="ROE"
              value={
                fundamentals.roe != null
                  ? `${fundamentals.roe.toFixed(
                      2
                    )}%`
                  : "N/A"
              }
              description="Return on Equity"
            />


            {/* Debt / Equity */}

            <FundamentalCard
              label="Debt / Equity"
              value={
                fundamentals.debtToEquity != null
                  ? fundamentals.debtToEquity.toFixed(
                      2
                    )
                  : "N/A"
              }
              description="Financial leverage"
            />


            {/* EPS */}

            <FundamentalCard
              label="EPS"
              value={
                fundamentals.eps != null
                  ? `${
                      stock.currency ===
                      "INR"
                        ? "₹"
                        : "$"
                    }${fundamentals.eps.toFixed(
                      2
                    )}`
                  : "N/A"
              }
              description="Earnings per share"
            />


            {/* Dividend Yield */}

            <FundamentalCard
              label="Dividend Yield"
              value={
                fundamentals.dividendYield != null
                  ? `${fundamentals.dividendYield.toFixed(
                      2
                    )}%`
                  : "N/A"
              }
              description="Annual dividend"
            />


            {/* Free Cash Flow */}

            <FundamentalCard
              label="Free Cash Flow"
              value={
                fundamentals.freeCashFlow != null
                  ? formatLargeNumber(
                      fundamentals.freeCashFlow
                    )
                  : "N/A"
              }
              description="Cash after expenses"
            />


            {/* Market Cap */}

            <FundamentalCard
              label="Market Cap"
              value={
                fundamentals.marketCap != null
                  ? formatLargeNumber(
                      fundamentals.marketCap
                    )
                  : "N/A"
              }
              description="Company valuation"
            />

          </div>

        </section>


        {/* =====================================
            ANALYSIS GRID
        ====================================== */}

        <section className="mt-6">

          <div className="mb-5">

            <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
              Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Stock Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Technical indicators and AI-powered
              market interpretation.
            </p>

          </div>


          <div className="space-y-6">

            {/* Technical */}

            <TechnicalSignal
              signal={technical.signal}
              score={technical.score}
              reasons={technical.reasons}
              rsi={technical.rsi}
              macd={technical.macd}
              macdSignal={
                technical.macdSignal
              }
            />


            {/* AI */}

            <AIAnalysis
              summary={ai.summary}
              outlook={ai.outlook}
              risk={ai.risk}
              keyPoints={ai.keyPoints}
            />

          </div>

        </section>


        {/* =====================================
            MARKET INFORMATION
        ====================================== */}

        <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

          <div className="mb-6">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Reference
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Market Information
            </h2>

          </div>


          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

            <InfoItem
              label="Ticker"
              value={stock.ticker}
            />

            <InfoItem
              label="Currency"
              value={
                stock.currency ??
                "N/A"
              }
            />

            <InfoItem
              label="Change"
              value={
                change !== null
                  ? `${
                      isPositive
                        ? "+"
                        : ""
                    }${change.toFixed(
                      2
                    )}%`
                  : "N/A"
              }
            />

            <InfoItem
              label="Data Provider"
              value="Yahoo Finance"
            />

          </div>

        </section>


        {/* Footer spacing */}

        <div className="h-10" />

      </div>

    </main>
  );
}


/* =========================================
   FUNDAMENTAL CARD
========================================= */

function FundamentalCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5 transition hover:border-white/[0.1]">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 truncate text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-600">
        {description}
      </p>

    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5 transition hover:border-white/[0.1]">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 truncate text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   INFO ITEM
========================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-300">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   HELPERS
========================================= */

function formatPrice(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

  return value.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}


function formatLargeNumber(
  value: number
) {
  if (value >= 1_00_00_000) {
    return `${(
      value / 1_00_00_000
    ).toFixed(2)} Cr`;
  }

  if (value >= 1_00_000) {
    return `${(
      value / 1_00_000
    ).toFixed(2)} L`;
  }

  return value.toLocaleString(
    "en-IN"
  );
}


function getInitials(
  companyName?: string,
  ticker?: string
) {
  if (!companyName) {
    return (
      ticker?.slice(0, 2) ??
      "ST"
    );
  }

  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) => word[0]
    )
    .join("")
    .toUpperCase();
}