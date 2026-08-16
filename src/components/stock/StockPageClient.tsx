"use client";

import { useEffect, useState } from "react";

interface StockData {
  ticker?: string;
  symbol?: string;
  name?: string;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
  volume?: number | null;
  marketCap?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
}

interface StockPageClientProps {
  ticker: string;
}

export default function StockPageClient({
  ticker,
}: StockPageClientProps) {
  const [stock, setStock] =
    useState<StockData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchStock() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/stock/${encodeURIComponent(
              ticker
            )}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch stock data"
          );
        }

        const data =
          await response.json();

        setStock(data.stock ?? null);
      } catch (error) {
        console.error(
          "Stock page error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load stock"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStock();
  }, [ticker]);

  if (loading) {
    return <StockPageSkeleton />;
  }

  if (error || !stock) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">

        <p className="text-sm font-semibold text-red-400">
          Unable to load stock
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {error || "Stock data unavailable."}
        </p>

      </div>
    );
  }

  const change =
    stock.changePercent;

  const isPositive =
    change !== null &&
    change > 0;

  const isNegative =
    change !== null &&
    change < 0;

  return (
    <div className="space-y-6">

      {/* =========================================
          STOCK HEADER
      ========================================= */}

      <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff4d61]/10 text-sm font-black text-[#ff6577]">
                {getStockInitials(
                  stock.name,
                  ticker
                )}
              </div>

              <div>

                <h1 className="text-2xl font-black tracking-tight text-white">
                  {stock.name ||
                    ticker}
                </h1>

                <p className="mt-1 text-xs text-slate-600">
                  {ticker}
                </p>

              </div>

            </div>

            <div className="mt-6 flex items-end gap-4">

              <p className="text-4xl font-black tracking-tight text-white">

                {stock.price !== null
                  ? stock.price.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )
                  : "N/A"}

              </p>

              {stock.currency && (
                <span className="mb-1 text-xs text-slate-600">
                  {stock.currency}
                </span>
              )}

              <span
                className={`mb-1 rounded-lg px-3 py-1.5 text-sm font-bold ${
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
              </span>

            </div>

          </div>


          {/* Watchlist */}

          <button className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-[#ff4d61]/20 hover:bg-[#ff4d61]/5 hover:text-[#ff6577]">
            ☆
            Add to watchlist
          </button>

        </div>

      </section>


      {/* =========================================
          CHART
      ========================================= */}

      <StockChartSection ticker={ticker} />


      {/* =========================================
          QUICK STATS
      ========================================= */}

      <section>

        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Overview
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Key Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <StatCard
            label="Volume"
            value={formatNumber(
              stock.volume
            )}
          />

          <StatCard
            label="Market Cap"
            value={formatLargeNumber(
              stock.marketCap
            )}
          />

          <StatCard
            label="52W High"
            value={formatPrice(
              stock.fiftyTwoWeekHigh
            )}
          />

          <StatCard
            label="52W Low"
            value={formatPrice(
              stock.fiftyTwoWeekLow
            )}
          />

        </div>

      </section>


      {/* =========================================
          TECHNICAL ANALYSIS
      ========================================= */}

      <section>

        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Analysis
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Technical Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <TechnicalCard
            label="RSI"
            value="—"
            status="Awaiting analysis"
          />

          <TechnicalCard
            label="EMA 20"
            value="—"
            status="Awaiting analysis"
          />

          <TechnicalCard
            label="SMA 50"
            value="—"
            status="Awaiting analysis"
          />

          <TechnicalCard
            label="Momentum"
            value="—"
            status="Awaiting analysis"
          />

        </div>

      </section>


      {/* =========================================
          AI PLACEHOLDER
      ========================================= */}

      <section>

        <div className="relative overflow-hidden rounded-2xl border border-[#ff4d61]/15 bg-[#101318] p-6">

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#ff4d61]/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4d61]/10 text-[#ff6577]">
                ✦
              </div>

              <div>
                <h2 className="text-sm font-bold text-white">
                  AI Stock Analysis
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Multi-factor analysis engine
                </p>
              </div>

            </div>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500">
              AI analysis will combine technical indicators,
              fundamentals, market sentiment, and news to
              generate a structured stock signal.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-600">
                Technical
              </span>

              <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-600">
                Fundamentals
              </span>

              <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-600">
                Sentiment
              </span>

              <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-600">
                AI Signal
              </span>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================
   CHART SECTION
========================================= */

function StockChartSection({
  ticker,
}: {
  ticker: string;
}) {
  const periods = [
    "1D",
    "1W",
    "1M",
    "6M",
    "1Y",
    "5Y",
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">

      <div className="flex flex-col gap-4 border-b border-white/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-bold text-white">
            Price Chart
          </p>

          <p className="mt-1 text-[11px] text-slate-600">
            Historical price movement
          </p>
        </div>

        <div className="flex gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] p-1">

          {periods.map(
            (period, index) => (
              <button
                key={period}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold transition ${
                  index === 0
                    ? "bg-white/[0.07] text-white"
                    : "text-slate-600 hover:text-white"
                }`}
              >
                {period}
              </button>
            )
          )}

        </div>

      </div>

      <div className="flex h-[420px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] text-xl text-slate-600">
            ↗
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Chart ready
          </p>

          <p className="mt-1 text-xs text-slate-700">
            Connect your existing Lightweight Charts
            component here.
          </p>

          <p className="mt-3 text-[10px] text-slate-700">
            {ticker}
          </p>

        </div>

      </div>

    </section>
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
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   TECHNICAL CARD
========================================= */

function TechnicalCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 text-lg font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-700">
        {status}
      </p>

    </div>
  );
}


/* =========================================
   HELPERS
========================================= */

function getStockInitials(
  name?: string,
  ticker?: string
) {
  if (!name) {
    return ticker?.slice(0, 2) ?? "ST";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatPrice(
  value?: number | null
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

function formatNumber(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

  return value.toLocaleString(
    "en-IN"
  );
}

function formatLargeNumber(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

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


/* =========================================
   SKELETON
========================================= */

function StockPageSkeleton() {
  return (
    <div className="space-y-6">

      <div className="h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318]" />

      <div className="h-[420px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318]" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <div className="h-28 animate-pulse rounded-2xl bg-[#101318]" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#101318]" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#101318]" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#101318]" />

      </div>

    </div>
  );
}