"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import type { Alert } from "../../types/alert";

// =========================================================
// TYPES
// =========================================================

interface StockQuote {
  ticker?: string;
  companyName?: string;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  currency?: string | null;
}

interface WatchlistItem {
  id: number;
  user_id?: string;
  ticker: string;
  created_at?: string;
  stock: StockQuote | null;
}

interface WatchlistProps {
  alerts?: Alert[];
}

// =========================================================
// API RESPONSE PARSER
// =========================================================

async function parseApiResponse(
  response: Response
) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      response.ok
        ? "The server returned an empty response."
        : `Request failed with status ${response.status}.`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`
    );
  }
}

// =========================================================
// WATCHLIST
// =========================================================

export default function Watchlist({
  alerts = [],
}: WatchlistProps) {
  const [watchlist, setWatchlist] =
    useState<WatchlistItem[]>([]);

  const [ticker, setTicker] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [quotesLoading, setQuotesLoading] =
    useState(false);

  const [adding, setAdding] =
    useState(false);

  const [removingTicker, setRemovingTicker] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =======================================================
  // LOAD QUOTES
  // =======================================================

  const loadQuotes = useCallback(
    async (items: WatchlistItem[]) => {
      if (!items.length) {
        return;
      }

      try {
        setQuotesLoading(true);

        /*
         * IMPORTANT:
         *
         * Existing stock quote route:
         *
         * /api/stock/[ticker]
         *
         * Example:
         *
         * /api/stock/RELIANCE.NS
         */

        const quoteResults =
          await Promise.all(
            items.map(async (item) => {
              try {
                const response =
                  await fetch(
                    `/api/stock/${encodeURIComponent(
                      item.ticker
                    )}`,
                    {
                      method: "GET",
                      headers: {
                        Accept:
                          "application/json",
                      },

                      /*
                       * Do not let an old quote
                       * block the current request.
                       */
                      cache: "no-store",
                    }
                  );

                if (!response.ok) {
                  console.warn(
                    `Quote request failed for ${item.ticker}: ${response.status}`
                  );

                  return {
                    ...item,
                    stock: null,
                  };
                }

                const data =
                  await parseApiResponse(
                    response
                  );

                /*
                 * Existing stock route returns:
                 *
                 * {
                 *   stock: {...}
                 * }
                 */

                const stock =
                  data?.stock ??
                  data?.quote ??
                  null;

                return {
                  ...item,
                  stock,
                };
              } catch (error) {
                console.warn(
                  `Quote failed for ${item.ticker}:`,
                  error
                );

                return {
                  ...item,
                  stock: null,
                };
              }
            })
          );

        setWatchlist(
          quoteResults
        );
      } finally {
        setQuotesLoading(false);
      }
    },
    []
  );

  // =======================================================
  // LOAD WATCHLIST
  // =======================================================

  const fetchWatchlist =
    useCallback(
      async () => {
        try {
          setError("");

          /*
           * First request only loads the user's
           * watchlist from Supabase.
           *
           * This should be extremely fast.
           */

          const response =
            await fetch(
              "/api/watchlist",
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                },

                /*
                 * Avoid browser cache because
                 * the user may have just added/removed
                 * a stock.
                 */
                cache: "no-store",
              }
            );

          const data =
            await parseApiResponse(
              response
            );

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "Failed to fetch watchlist."
            );
          }

          const rawItems =
            Array.isArray(
              data?.watchlist
            )
              ? data.watchlist
              : [];

          /*
           * Render the watchlist IMMEDIATELY.
           *
           * No waiting for market APIs.
           */

          const items: WatchlistItem[] =
            rawItems.map(
              (item: WatchlistItem) => ({
                ...item,
                stock:
                  item.stock ?? null,
              })
            );

          setWatchlist(items);

          setLoading(false);

          /*
           * Quotes happen AFTER the list
           * has already rendered.
           *
           * All quote requests run in parallel.
           */
          if (items.length) {
            void loadQuotes(items);
          }
        } catch (error) {
          console.error(
            "Watchlist fetch error:",
            error
          );

          setWatchlist([]);

          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch watchlist."
          );

          setLoading(false);
        }
      },
      [loadQuotes]
    );

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    void fetchWatchlist();
  }, [fetchWatchlist]);

  // =======================================================
  // ADD STOCK
  // =======================================================

  async function handleAdd(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      setError(
        "Enter a stock ticker."
      );

      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          "/api/watchlist",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              ticker:
                normalizedTicker,
            }),
          }
        );

      const data =
        await parseApiResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to add stock."
        );
      }

      /*
       * Optimistic UI:
       *
       * Add the stock immediately instead
       * of waiting for another watchlist GET.
       */

      const newItem: WatchlistItem = {
        id: data.id,
        ticker:
          data.ticker ??
          normalizedTicker,
        user_id: data.user_id,
        created_at:
          data.created_at,
        stock: null,
      };

      setWatchlist(
        (current) => [
          newItem,
          ...current,
        ]
      );

      setTicker("");

      setSuccess(
        `${normalizedTicker} added to your watchlist.`
      );

      /*
       * Fetch ONLY the new stock's quote.
       *
       * We do NOT reload the entire watchlist.
       */

      void loadQuotes([
        newItem,
      ]);
    } catch (error) {
      console.error(
        "Add watchlist error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add stock."
      );
    } finally {
      setAdding(false);
    }
  }

  // =======================================================
  // REMOVE STOCK
  // =======================================================

  async function handleRemove(
    stockTicker: string
  ) {
    try {
      setRemovingTicker(
        stockTicker
      );

      setError("");
      setSuccess("");

      /*
       * Optimistic removal:
       *
       * Remove immediately from UI.
       */

      const previous =
        watchlist;

      setWatchlist(
        (current) =>
          current.filter(
            (item) =>
              item.ticker !==
              stockTicker
          )
      );

      const response =
        await fetch(
          `/api/watchlist?ticker=${encodeURIComponent(
            stockTicker
          )}`,
          {
            method: "DELETE",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const data =
        await parseApiResponse(
          response
        );

      if (!response.ok) {
        /*
         * Restore if server failed.
         */
        setWatchlist(previous);

        throw new Error(
          data?.error ||
            "Failed to remove stock."
        );
      }

      setSuccess(
        `${stockTicker} removed from your watchlist.`
      );
    } catch (error) {
      console.error(
        "Remove watchlist error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove stock."
      );
    } finally {
      setRemovingTicker("");
    }
  }

  // =======================================================
  // RETRY
  // =======================================================

  function handleRetry() {
    setError("");
    setLoading(true);

    void fetchWatchlist();
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <section className="mb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Portfolio
          </p>

          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <span>⭐</span>
            My Watchlist

            {!loading &&
              watchlist.length > 0 && (
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {watchlist.length}
                </span>
              )}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track the stocks you care about
          </p>
        </div>

        {/* ===================================================
            ADD STOCK
        =================================================== */}

        <form
          onSubmit={handleAdd}
          className="flex w-full gap-2 sm:w-auto"
        >
          <input
            type="text"
            value={ticker}
            onChange={(event) =>
              setTicker(
                event.target.value
              )
            }
            placeholder="RELIANCE.NS"
            disabled={adding}
            autoComplete="off"
            spellCheck={false}
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#0c0f13] px-4 text-sm font-semibold uppercase tracking-wide text-white outline-none transition placeholder:text-slate-700 focus:border-white/20 focus:ring-2 focus:ring-white/[0.04] sm:w-48"
          />

          <button
            type="submit"
            disabled={
              adding ||
              !ticker.trim()
            }
            className="h-11 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {adding
              ? "Adding..."
              : "+ Add"}
          </button>
        </form>
      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-400">
          <span>{success}</span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="text-xs text-emerald-500 transition hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 text-xs font-bold text-red-300 transition hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="space-y-3">
          <WatchlistSkeleton />
          <WatchlistSkeleton />
        </div>
      ) : watchlist.length === 0 ? (
        <WatchlistEmptyState />
      ) : (
        <div className="space-y-3">

          {/* Quote loading indicator */}

          {quotesLoading && (
            <div className="flex items-center gap-2 px-1 pb-1 text-[10px] font-medium uppercase tracking-wider text-slate-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Updating market data
            </div>
          )}

          {watchlist.map(
            (item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                alerts={getTickerAlerts(
                  alerts,
                  item.ticker
                )}
                removing={
                  removingTicker ===
                  item.ticker
                }
                onRemove={
                  handleRemove
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

// =========================================================
// WATCHLIST CARD
// =========================================================

function WatchlistCard({
  item,
  alerts,
  removing,
  onRemove,
}: {
  item: WatchlistItem;
  alerts: Alert[];
  removing: boolean;
  onRemove: (
    ticker: string
  ) => void;
}) {
  const stock =
    item.stock;

  const price =
    stock?.price ?? null;

  const change =
    stock?.changePercent ?? null;

  const isPositive =
    change !== null &&
    Number(change) > 0;

  const isNegative =
    change !== null &&
    Number(change) < 0;

  const hasQuote =
    price !== null &&
    Number.isFinite(
      Number(price)
    );

  const activeAlerts =
    alerts.filter(
      (alert) =>
        alert.is_active &&
        !alert.is_triggered
    );

  const triggeredAlerts =
    alerts.filter(
      (alert) =>
        alert.is_triggered
    );

  const hasAlerts =
    alerts.length > 0;

  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-[#0c0f13]/80 p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#101419]">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* ===================================================
            IDENTITY
        =================================================== */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2.5">

            <Link
              href={`/stock/${encodeURIComponent(
                item.ticker
              )}`}
              className="text-base font-bold tracking-wide text-white transition hover:text-slate-300"
            >
              {item.ticker}
            </Link>

            <span className="rounded-md border border-white/[0.06] bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
              {getExchange(
                item.ticker
              )}
            </span>

            {hasAlerts && (
              <Link
                href={`/alerts?ticker=${encodeURIComponent(
                  item.ticker
                )}`}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                  triggeredAlerts.length >
                  0
                    ? "border-[#ff4d61]/20 bg-[#ff4d61]/10 text-[#ff6577]"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span>🔔</span>

                <span>
                  {triggeredAlerts.length >
                  0
                    ? `${triggeredAlerts.length} triggered`
                    : `${activeAlerts.length} active`}
                </span>
              </Link>
            )}
          </div>

          <p className="mt-1 truncate text-sm text-slate-500">
            {stock?.companyName ||
              "Market security"}
          </p>

          {!hasQuote && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-500/10 bg-amber-500/[0.04] px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />

              <span className="text-[10px] font-medium text-amber-400">
                Loading live quote
              </span>
            </div>
          )}
        </div>

        {/* ===================================================
            PRICE
        =================================================== */}

        <div className="lg:min-w-[150px] lg:text-right">

          <p className="text-2xl font-bold tracking-tight text-white">

            {hasQuote
              ? `${
                  stock?.currency ===
                  "INR"
                    ? "₹"
                    : ""
                }${Number(
                  price
                ).toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}`
              : "—"}
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-700">
            {hasQuote
              ? "Current price"
              : "Updating"}
          </p>
        </div>

        {/* ===================================================
            CHANGE
        =================================================== */}

        <div className="lg:min-w-[120px] lg:text-right">

          <div
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : isNegative
                ? "bg-red-500/10 text-red-400"
                : "bg-white/[0.04] text-slate-500"
            }`}
          >
            <span>
              {isPositive
                ? "▲"
                : isNegative
                ? "▼"
                : "—"}
            </span>

            <span>
              {change !== null &&
              Number.isFinite(
                Number(change)
              )
                ? `${
                    isPositive
                      ? "+"
                      : ""
                  }${Number(
                    change
                  ).toFixed(2)}%`
                : "—"}
            </span>
          </div>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-700">
            Today's change
          </p>
        </div>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex items-center gap-2 border-t border-white/[0.05] pt-4 lg:border-t-0 lg:pt-0">

          <Link
            href={`/stock/${encodeURIComponent(
              item.ticker
            )}`}
            className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
          >
            Analysis →
          </Link>

          <Link
            href={`/alerts?ticker=${encodeURIComponent(
              item.ticker
            )}`}
            className="rounded-xl border border-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-white/10 hover:bg-white/[0.03] hover:text-white"
          >
            Alerts
          </Link>

          <button
            type="button"
            onClick={() =>
              onRemove(
                item.ticker
              )
            }
            disabled={removing}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing
              ? "Removing..."
              : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// ALERT FILTER
// =========================================================

function getTickerAlerts(
  alerts: Alert[],
  ticker: string
) {
  const normalizedTicker =
    ticker.trim().toUpperCase();

  return alerts.filter(
    (alert) =>
      alert.ticker
        .trim()
        .toUpperCase() ===
      normalizedTicker
  );
}

// =========================================================
// EXCHANGE
// =========================================================

function getExchange(
  ticker: string
) {
  if (ticker.endsWith(".NS")) {
    return "NSE";
  }

  if (ticker.endsWith(".BO")) {
    return "BSE";
  }

  if (ticker.startsWith("^")) {
    return "INDEX";
  }

  return "MARKET";
}

// =========================================================
// SKELETON
// =========================================================

function WatchlistSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-white/[0.06] bg-[#0c0f13] p-5"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-white/[0.06]" />

          <div className="mt-3 h-3 w-44 rounded bg-white/[0.04]" />

          <div className="mt-3 h-5 w-28 rounded bg-white/[0.03]" />
        </div>

        <div className="h-9 w-32 rounded bg-white/[0.05]" />

        <div className="h-8 w-24 rounded bg-white/[0.05]" />

        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-xl bg-white/[0.05]" />
          <div className="h-10 w-20 rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function WatchlistEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#0c0f13]/60 px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 text-2xl">
        ⭐
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        Your watchlist is empty
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Add a stock ticker above to start
        tracking its price and market
        performance.
      </p>
    </div>
  );
}