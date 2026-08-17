"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

interface StockQuote {
  ticker?: string;
  companyName?: string;
  price?: number | null;
  changePercent?: number | null;
  currency?: string | null;
}

interface WatchlistItem {
  id: number;
  ticker: string;
  stock: StockQuote | null;
}

async function parseApiResponse(response: Response) {
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

export default function Watchlist() {
  const [watchlist, setWatchlist] =
    useState<WatchlistItem[]>([]);

  const [ticker, setTicker] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingTicker, setRemovingTicker] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // FETCH WATCHLIST
  // ========================================

  async function fetchWatchlist() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/watchlist",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to fetch watchlist."
        );
      }

      const items =
        Array.isArray(data?.watchlist)
          ? data.watchlist
          : Array.isArray(data)
          ? data
          : [];

      setWatchlist(items);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // ========================================
  // ADD STOCK
  // ========================================

  async function handleAdd(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      setError("Enter a stock ticker.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/watchlist",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ticker: normalizedTicker,
          }),
        }
      );

      const data =
        await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to add stock."
        );
      }

      setTicker("");

      setSuccess(
        `${normalizedTicker} added to your watchlist.`
      );

      await fetchWatchlist();
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

  // ========================================
  // REMOVE STOCK
  // ========================================

  async function handleRemove(
    stockTicker: string
  ) {
    try {
      setRemovingTicker(stockTicker);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/watchlist?ticker=${encodeURIComponent(
          stockTicker
        )}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to remove stock."
        );
      }

      setWatchlist((current) =>
        current.filter(
          (item) =>
            item.ticker !== stockTicker
        )
      );

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

  // ========================================
  // RENDER
  // ========================================

  return (
    <section className="mb-10">

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Portfolio
          </p>

          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <span>⭐</span>
            My Watchlist
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track the stocks you care about
          </p>
        </div>

        {/* ADD STOCK */}

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
            className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 text-sm font-medium uppercase tracking-wide text-white outline-none placeholder:text-slate-600 transition focus:border-slate-600 focus:ring-2 focus:ring-white/5 sm:w-44"
          />

          <button
            type="submit"
            disabled={
              adding ||
              !ticker.trim()
            }
            className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding
              ? "Adding..."
              : "+ Add"}
          </button>
        </form>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <span>{success}</span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="text-xs text-emerald-500 hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              fetchWatchlist();
            }}
            className="text-xs font-semibold text-red-300 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="space-y-3">

          <WatchlistSkeleton />

          <WatchlistSkeleton />

        </div>
      ) : watchlist.length === 0 ? (

        /* EMPTY STATE */

        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xl">
            ⭐
          </div>

          <h3 className="mt-4 text-lg font-semibold text-white">
            Your watchlist is empty
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add a stock ticker above to
            start tracking its price and
            market performance.
          </p>

        </div>

      ) : (

        /* WATCHLIST */

        <div className="space-y-3">

          {watchlist.map((item) => {

            const stock = item.stock;

            const price =
              stock?.price ?? null;

            const change =
              stock?.changePercent ?? null;

            const isPositive =
              change !== null &&
              change > 0;

            const isNegative =
              change !== null &&
              change < 0;

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* STOCK IDENTITY */}

                  <div className="min-w-0">

                    <div className="flex items-center gap-3">

                      <Link
                        href={`/stock/${encodeURIComponent(
                          item.ticker
                        )}`}
                        className="text-base font-bold tracking-wide text-white transition-colors hover:text-slate-300"
                      >
                        {item.ticker}
                      </Link>

                      <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {item.ticker.endsWith(
                          ".NS"
                        )
                          ? "NSE"
                          : item.ticker.endsWith(
                              ".BO"
                            )
                          ? "BSE"
                          : "MARKET"}
                      </span>

                    </div>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {stock?.companyName ||
                        "Market security"}
                    </p>

                  </div>

                  {/* PRICE */}

                  <div className="lg:min-w-[150px] lg:text-right">

                    <p className="text-2xl font-bold tracking-tight text-white">

                      {price !== null
                        ? `${
                            stock?.currency ===
                            "INR"
                              ? "₹"
                              : ""
                          }${price.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}`
                        : "N/A"}

                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Current price
                    </p>

                  </div>

                  {/* CHANGE */}

                  <div className="lg:min-w-[120px] lg:text-right">

                    <div
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        isPositive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isNegative
                          ? "bg-red-500/10 text-red-400"
                          : "bg-slate-800 text-slate-400"
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

                    <p className="mt-1 text-xs text-slate-600">
                      Today's change
                    </p>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-2 border-t border-slate-800 pt-4 lg:border-t-0 lg:pt-0">

                    <Link
                      href={`/stock/${encodeURIComponent(
                        item.ticker
                      )}`}
                      className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                    >
                      Analysis →
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          item.ticker
                        )
                      }
                      disabled={
                        removingTicker ===
                        item.ticker
                      }
                      className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingTicker ===
                      item.ticker
                        ? "Removing..."
                        : "Remove"}
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}

// ========================================
// SKELETON
// ========================================

function WatchlistSkeleton() {
  return (
    <div className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

      <div className="flex justify-between">

        <div>
          <div className="h-4 w-32 rounded bg-slate-800" />

          <div className="mt-3 h-3 w-44 rounded bg-slate-800/70" />
        </div>

        <div className="h-8 w-24 rounded bg-slate-800" />

      </div>

      <div className="mt-8 h-3 w-full rounded bg-slate-800/60" />

    </div>
  );
}