"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const [data, setData] =
    useState<MarketOverview | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  /*
   * =========================================================
   * REFS
   * =========================================================
   */

  /*
   * Element used by IntersectionObserver.
   *
   * When this element gets close to the viewport,
   * market data loading begins.
   */
  const loadTriggerRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Prevent duplicate API requests.
   */
  const requestStartedRef =
    useRef(false);

  /*
   * Abort controller for the market request.
   */
  const controllerRef =
    useRef<AbortController | null>(null);

  /*
   * =========================================================
   * RESET SCROLL POSITION
   * =========================================================
   *
   * Prevents the browser from restoring the previous
   * scroll position when entering /markets.
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
   * LAZY LOAD MARKET DATA
   * =========================================================
   */

  useEffect(() => {
    const trigger =
      loadTriggerRef.current;

    if (!trigger) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (
            !entry?.isIntersecting ||
            requestStartedRef.current
          ) {
            return;
          }

          requestStartedRef.current = true;

          observer.disconnect();

          loadMarketOverview();
        },
        {
          /*
           * Start loading before the user reaches
           * the market data section.
           */
          rootMargin: "300px 0px",
          threshold: 0,
        }
      );

    observer.observe(trigger);

    return () => {
      observer.disconnect();

      controllerRef.current?.abort();
    };
  }, []);

  /*
   * =========================================================
   * LOAD MARKET OVERVIEW
   * =========================================================
   */

  async function loadMarketOverview() {
    const controller =
      new AbortController();

    controllerRef.current =
      controller;

    try {
      setLoading(true);
      setError(null);

      console.log(
        "[Markets] Loading market overview..."
      );

      const response =
        await fetch(
          "/api/market/overview",
          {
            cache: "no-store",
            signal:
              controller.signal,
          }
        );

      if (!response.ok) {
        throw new Error(
          `Market overview failed: ${response.status}`
        );
      }

      const result: MarketOverview =
        await response.json();

      if (
        controller.signal.aborted
      ) {
        return;
      }

      setData(result);

      console.log(
        "[Markets] Market overview loaded"
      );
    } catch (error) {
      /*
       * AbortError is expected when the user
       * leaves the page.
       */
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "[Markets] Failed to load overview:",
        error
      );

      if (
        !controller.signal.aborted
      ) {
        setError(
          "Unable to load market data."
        );
      }
    } finally {
      if (
        !controller.signal.aborted
      ) {
        setLoading(false);
      }
    }
  }

  /*
   * =========================================================
   * SEARCH FILTER
   * =========================================================
   *
   * Search company name and ticker.
   *
   * Example:
   *
   * "reliance"
   * "RELIANCE.NS"
   * "tcs"
   */

  const filteredStocks =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return data.stocks;
      }

      return data.stocks.filter(
        (stock) =>
          stock.companyName
            .toLowerCase()
            .includes(query) ||
          stock.ticker
            .toLowerCase()
            .includes(query)
      );
    }, [data, searchQuery]);

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#080b0f] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="flex min-h-[55vh] flex-col justify-between gap-8 pb-12">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6577]">
              Indian Market
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Markets
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Live market overview across the
              Indian stock universe.
            </p>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="mt-8 max-w-2xl">
              <label
                htmlFor="market-stock-search"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-600"
              >
                Search Stocks
              </label>

              <div className="relative">
                {/* SEARCH ICON */}

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
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  id="market-stock-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search by company name or ticker..."
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0c0f13] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-white/[0.16] focus:bg-[#0e1217]"
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* CLEAR BUTTON */}

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery("")
                    }
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

              {/* SEARCH STATUS */}

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
              <div className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-xs text-slate-600">
                Market data loads as you scroll
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

        {/* ===================================================
            LAZY LOAD TRIGGER
        =================================================== */}

        <div
          ref={loadTriggerRef}
          className="h-px w-full"
          aria-hidden="true"
        />

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && !data && (
          <MarketLoadingSkeleton />
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && !data && (
          <section className="mt-8">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="text-sm font-medium text-red-400">
                {error}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Please refresh the page and try
                again.
              </p>
            </div>
          </section>
        )}

        {/* ===================================================
            MARKET DATA
        =================================================== */}

        {data && (
          <>
            {/* =================================================
                MARKET SUMMARY
            ================================================= */}

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MarketCard
                title="Stocks Tracked"
                value={
                  data.stocks.length
                }
              />

              <MarketCard
                title="Top Gainers"
                value={
                  data.topGainers.length
                }
              />

              <MarketCard
                title="Top Losers"
                value={
                  data.topLosers.length
                }
              />

              <MarketCard
                title="Near 52W High"
                value={
                  data.weekHigh.length
                }
              />
            </section>

            {/* =================================================
                MOVERS
            ================================================= */}

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <StockList
                title="Top Gainers"
                stocks={
                  data.topGainers
                }
                positive
              />

              <StockList
                title="Top Losers"
                stocks={
                  data.topLosers
                }
                positive={false}
              />
            </section>

            {/* =================================================
                FULL MARKET
            ================================================= */}

            <section className="mt-8">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f13]">

                {/* HEADER */}

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

                {/* STOCKS */}

                <div className="divide-y divide-white/[0.04]">

                  {filteredStocks.map(
                    (stock) => (
                      <StockRow
                        key={
                          stock.ticker
                        }
                        stock={stock}
                      />
                    )
                  )}

                  {/* NO RESULTS */}

                  {filteredStocks.length ===
                    0 && (
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
                          <circle
                            cx="11"
                            cy="11"
                            r="7"
                          />

                          <path d="m20 20-3.5-3.5" />
                        </svg>
                      </div>

                      <p className="mt-4 text-sm font-medium text-slate-400">
                        No stocks found
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Try searching for a
                        different company or
                        ticker.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ===================================================
            NOT LOADED YET
        =================================================== */}

        {!loading &&
          !data &&
          !error && (
            <section className="rounded-2xl border border-white/[0.06] bg-[#0c0f13] p-8 text-center">
              <p className="text-sm font-semibold text-slate-400">
                Market data will load
                shortly.
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Scroll down to load the
                market universe.
              </p>
            </section>
          )}
      </div>
    </main>
  );
}

/* =========================================================
   MARKET LOADING SKELETON
========================================================= */

function MarketLoadingSkeleton() {
  return (
    <section className="mt-8">
      <div className="animate-pulse">

        {/* SUMMARY */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>

        {/* MOVERS */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />

          <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
        </div>

        {/* MARKET */}

        <div className="mt-8 h-[500px] rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
      </div>
    </section>
  );
}

/* =========================================================
   MARKET CARD
========================================================= */

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

/* =========================================================
   STOCK LIST
========================================================= */

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
            positiveOverride={
              positive
            }
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

/* =========================================================
   STOCK ROW
========================================================= */

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

      {/* COMPANY */}

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {stock.companyName}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {stock.ticker}
        </p>
      </div>

      {/* PRICE */}

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-white">
          {formatPrice(
            stock.price
          )}
        </p>

        <p
          className={`mt-1 text-xs font-medium ${
            isPositive
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {formatPercent(
            stock.changePercent
          )}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(
  price: number | null
): string {
  if (price === null) {
    return "—";
  }

  return `₹${price.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

/* =========================================================
   FORMAT PERCENT
========================================================= */

function formatPercent(
  value: number | null
): string {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(
    2
  )}%`;
}