
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MarketIndex {
  ticker: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
}

const MARKET_INDICES = [
  {
    ticker: "^NSEI",
    name: "NIFTY 50",
  },
  {
    ticker: "^BSESN",
    name: "SENSEX",
  },
];

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchMarketData() {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.all(
        MARKET_INDICES.map(async (index): Promise<MarketIndex> => {
          try {
            const response = await fetch(
              `/api/stock/${encodeURIComponent(index.ticker)}`,
              {
                cache: "no-store",
              }
            );

            /*
             * Do not call response.json() directly.
             *
             * If the API returns an empty response, JSON parsing
             * throws "Unexpected end of JSON input".
             */
            const responseText = await response.text();

            if (!response.ok) {
              console.error(
                `Failed to fetch ${index.name}:`,
                response.status,
                responseText
              );

              return {
                ticker: index.ticker,
                name: index.name,
                price: null,
                changePercent: null,
                currency: null,
              };
            }

            if (!responseText.trim()) {
              console.error(
                `Empty API response for ${index.name}`
              );

              return {
                ticker: index.ticker,
                name: index.name,
                price: null,
                changePercent: null,
                currency: null,
              };
            }

            let data: any;

            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error(
                `Invalid JSON response for ${index.name}:`,
                responseText,
                parseError
              );

              return {
                ticker: index.ticker,
                name: index.name,
                price: null,
                changePercent: null,
                currency: null,
              };
            }

            return {
              ticker: index.ticker,
              name: index.name,

              price:
                typeof data?.stock?.price === "number"
                  ? data.stock.price
                  : null,

              changePercent:
                typeof data?.stock?.changePercent === "number"
                  ? data.stock.changePercent
                  : null,

              currency:
                typeof data?.stock?.currency === "string"
                  ? data.stock.currency
                  : null,
            };
          } catch (error) {
            console.error(
              `Market API error for ${index.name}:`,
              error
            );

            return {
              ticker: index.ticker,
              name: index.name,
              price: null,
              changePercent: null,
              currency: null,
            };
          }
        })
      );

      setIndices(results);

      /*
       * Only show an error if every market request failed.
       */
      const allUnavailable = results.every(
        (item) => item.price === null
      );

      if (allUnavailable) {
        setError(
          "Market data is currently unavailable. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "Market overview error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch market data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <section>
      {/* Header */}

      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Indian Markets
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Market Overview
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchMarketData}
          disabled={loading}
          className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-xs text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchMarketData}
            className="text-xs font-semibold text-red-300 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MarketSkeleton />
          <MarketSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {indices.map((index) => (
            <MarketCard
              key={index.ticker}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}


/* =========================================
   MARKET CARD
========================================= */

function MarketCard({
  index,
}: {
  index: MarketIndex;
}) {
  const change = index.changePercent;

  const isPositive =
    change !== null && change > 0;

  const isNegative =
    change !== null && change < 0;

  const changeClass =
    isPositive
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
      : isNegative
      ? "bg-red-500/10 text-red-400 border-red-500/10"
      : "bg-white/[0.03] text-slate-500 border-white/[0.06]";

  return (
    <Link
      href={`/stock/${encodeURIComponent(
        index.ticker
      )}`}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#12161b]"
    >
      {/* Glow */}

      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${
          isPositive
            ? "bg-emerald-500/5"
            : isNegative
            ? "bg-red-500/5"
            : "bg-white/[0.02]"
        }`}
      />

      <div className="relative">
        {/* Top row */}

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Indian Index
            </p>

            <h3 className="mt-1 text-sm font-bold text-white">
              {index.name}
            </h3>
          </div>

          <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-600">
            LIVE
          </span>
        </div>

        {/* Price */}

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-3xl font-black tracking-tight text-white">
              {index.price !== null
                ? index.price.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )
                : "N/A"}
            </p>

            {index.currency && (
              <p className="mt-1 text-[10px] text-slate-600">
                {index.currency}
              </p>
            )}
          </div>

          {/* Change */}

          <div
            className={`rounded-xl border px-3 py-2 text-sm font-bold ${changeClass}`}
          >
            {change !== null
              ? `${
                  isPositive ? "+" : ""
                }${change.toFixed(2)}%`
              : "N/A"}
          </div>
        </div>

        {/* Footer */}

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4">
          <span className="text-[11px] text-slate-600">
            Market index
          </span>

          <span className="text-[11px] font-semibold text-slate-500 transition group-hover:text-[#ff6577]">
            View analysis →
          </span>
        </div>
      </div>
    </Link>
  );
}


/* =========================================
   SKELETON
========================================= */

function MarketSkeleton() {
  return (
    <div className="h-[190px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318] p-6">
      <div className="flex justify-between">
        <div>
          <div className="h-3 w-20 rounded bg-white/[0.05]" />

          <div className="mt-3 h-4 w-24 rounded bg-white/[0.05]" />
        </div>

        <div className="h-6 w-12 rounded bg-white/[0.05]" />
      </div>

      <div className="mt-8 h-9 w-32 rounded bg-white/[0.05]" />

      <div className="mt-6 h-3 w-full rounded bg-white/[0.03]" />
    </div>
  );
}
