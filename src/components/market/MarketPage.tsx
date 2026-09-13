"use client";

import { useEffect, useMemo, useState } from "react";

interface MarketStock {
  ticker: string;
  companyName: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

interface MarketOverview {
  stocks: MarketStock[];
  topGainers: MarketStock[];
  topLosers: MarketStock[];
  weekHigh: MarketStock[];
  weekLow: MarketStock[];
  updatedAt: string;
}

export default function MarketsPageClient() {
  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * =========================================================
   * RESET SCROLL POSITION
   * =========================================================
   */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /*
   * =========================================================
   * LOAD MARKET OVERVIEW
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadMarketOverview() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "[Markets] Starting /api/market/overview request..."
        );

        const response = await fetch("/api/market/overview", {
          method: "GET",
          cache: "no-store",
        });

        console.log(
          "[Markets] /api/market/overview response:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          let message = `Market overview failed: ${response.status}`;

          try {
            const errorBody = await response.json();

            console.error(
              "[Markets] API error body:",
              errorBody
            );

            if (
              errorBody &&
              typeof errorBody.message === "string"
            ) {
              message = errorBody.message;
            } else if (
              errorBody &&
              typeof errorBody.error === "string"
            ) {
              message = errorBody.error;
            }
          } catch {
            console.error(
              "[Markets] API returned a non-JSON error response."
            );
          }

          throw new Error(message);
        }

        console.log(
          "[Markets] Reading market API response..."
        );

        const result = (await response.json()) as MarketOverview;

        console.log(
          "[Markets] Market API JSON received:",
          result
        );

        if (!mounted) {
          return;
        }

        if (!result || typeof result !== "object") {
          throw new Error(
            "Invalid market data received."
          );
        }

        if (!Array.isArray(result.stocks)) {
          throw new Error(
            "Market API returned an invalid stocks array."
          );
        }

        if (!Array.isArray(result.topGainers)) {
          throw new Error(
            "Market API returned an invalid topGainers array."
          );
        }

        if (!Array.isArray(result.topLosers)) {
          throw new Error(
            "Market API returned an invalid topLosers array."
          );
        }

        if (!Array.isArray(result.weekHigh)) {
          throw new Error(
            "Market API returned an invalid weekHigh array."
          );
        }

        if (!Array.isArray(result.weekLow)) {
          throw new Error(
            "Market API returned an invalid weekLow array."
          );
        }

        setData(result);

        console.log(
          "[Markets] Market overview successfully loaded:",
          {
            stocks: result.stocks.length,
            topGainers: result.topGainers.length,
            topLosers: result.topLosers.length,
            weekHigh: result.weekHigh.length,
            weekLow: result.weekLow.length,
          }
        );
      } catch (error) {
        console.error(
          "[Markets] Failed to load market overview:",
          error
        );

        if (!mounted) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load market data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadMarketOverview();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * SEARCH FILTER
   * =========================================================
   */

  const filteredStocks = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return data.stocks;
    }

    return data.stocks.filter((stock) => {
      return (
        stock.companyName
          .toLowerCase()
          .includes(query) ||
        stock.ticker
          .toLowerCase()
          .includes(query)
      );
    });
  }, [data, searchQuery]);

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#080b0f] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <section className="flex min-h-[55vh] flex-col justify-between gap-8 pb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6577]">
              Indian Market
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Markets
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Live market overview across the Indian stock universe.
            </p>

            {/* SEARCH */}

            <div className="mt-8 max-w-2xl">
              <label
                htmlFor="market-stock-search"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-600"
              >
                Search Stocks
              </label>

              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  id="market-stock-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search by company name or ticker..."
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0c0f13] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-white/[0.16] focus:bg-[#0e1217]"
                  autoComplete="off"
                  spellCheck={false}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
                    aria-label="Clear stock search"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12" />
                      <path d="M18 6 6 18" />
                    </svg>
                  </button>
                )}
              </div>

              {data && searchQuery && (
                <p className="mt-2 text-xs text-slate-600">
                  {filteredStocks.length}{" "}
                  {filteredStocks.length === 1
                    ? "stock"
                    : "stocks"}{" "}
                  found
                </p>
              )}
            </div>

            {/* STATUS */}

            <div className="mt-6 flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  loading
                    ? "animate-pulse bg-yellow-400"
                    : error
                      ? "bg-red-400"
                      : "bg-emerald-400"
                }`}
              />

              <span className="text-xs text-slate-600">
                {loading
                  ? "Loading market data..."
                  : error
                    ? "Market data unavailable"
                    : "Market data loaded"}
              </span>
            </div>
          </div>

          {data?.updatedAt && (
            <p className="text-xs text-slate-600">
              Updated{" "}
              {new Date(
                data.updatedAt
              ).toLocaleTimeString()}
            </p>
          )}
        </section>

        {/* LOADING */}

        {loading && !data && <MarketLoadingSkeleton />}

        {/* ERROR */}

        {error && !data && (
          <section className="mt-8">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="text-sm font-medium text-red-400">
                {error}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Check the browser console and terminal for
                the underlying API error.
              </p>
            </div>
          </section>
        )}

        {/* MARKET DATA */}

        {data && (
          <>
            {/* MARKET SUMMARY */}

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MarketCard
                title="Stocks Tracked"
                value={data.stocks.length}
              />

              <MarketCard
                title="Top Gainers"
                value={data.topGainers.length}
              />

              <MarketCard
                title="Top Losers"
                value={data.topLosers.length}
              />

              <MarketCard
                title="Near 52W High"
                value={data.weekHigh.length}
              />
            </section>

            {/* MOVERS */}

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <StockList
                title="Top Gainers"
                stocks={data.topGainers}
                positive
              />

              <StockList
                title="Top Losers"
                stocks={data.topLosers}
                positive={false}
              />
            </section>

            {/* FULL MARKET */}

            <section className="mt-8">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f13]">
                <div className="border-b border-white/[0.06] px-5 py-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Indian Market Universe
                      </h2>

                      <p className="mt-1 text-xs text-slate-600">
                        {searchQuery
                          ? `${filteredStocks.length} matching stocks`
                          : `${data.stocks.length} stocks currently available`}
                      </p>
                    </div>

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchQuery("")
                        }
                        className="text-xs font-medium text-slate-500 transition hover:text-white"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {filteredStocks.map((stock) => (
                    <StockRow
                      key={stock.ticker}
                      stock={stock}
                    />
                  ))}

                  {filteredStocks.length === 0 && (
                    <div className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03]">
                        <svg
                          className="h-5 w-5 text-slate-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.5-3.5" />
                        </svg>
                      </div>

                      <p className="mt-4 text-sm font-medium text-slate-400">
                        No stocks found
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Try searching for a different
                        company or ticker.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/*
 * =========================================================
 * MARKET LOADING SKELETON
 * =========================================================
 */

function MarketLoadingSkeleton() {
  return (
    <section className="mt-8">
      <div className="animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              />
            )
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />

          <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
        </div>

        <div className="mt-8 h-[500px] rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
      </div>
    </section>
  );
}

/*
 * =========================================================
 * MARKET CARD
 * =========================================================
 */

function MarketCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f13] p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
        {title}
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * STOCK LIST
 * =========================================================
 */

function StockList({
  title,
  stocks,
  positive,
}: {
  title: string;
  stocks: MarketStock[];
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f13]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-bold text-white">
          {title}
        </h2>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {stocks.map((stock) => (
          <StockRow
            key={stock.ticker}
            stock={stock}
            positiveOverride={positive}
          />
        ))}

        {stocks.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-600">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * STOCK ROW
 * =========================================================
 */

function StockRow({
  stock,
  positiveOverride,
}: {
  stock: MarketStock;
  positiveOverride?: boolean;
}) {
  const isPositive =
    positiveOverride ??
    (stock.changePercent ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.02]">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {stock.companyName}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {stock.ticker}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-white">
          {formatPrice(stock.price)}
        </p>

        <p
          className={`mt-1 text-xs font-medium ${
            isPositive
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {formatPercent(stock.changePercent)}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * FORMAT PRICE
 * =========================================================
 */

function formatPrice(price: number | null): string {
  if (price === null) {
    return "—";
  }

  return `₹${price.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

/*
 * =========================================================
 * FORMAT PERCENT
 * =========================================================
 */

function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}