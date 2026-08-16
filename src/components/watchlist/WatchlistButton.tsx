
"use client";

import { useEffect, useState } from "react";

interface WatchlistButtonProps {
  ticker: string;
}

export default function WatchlistButton({
  ticker,
}: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Check current watchlist status
   */
  useEffect(() => {
    async function checkStatus() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/watchlist/status?ticker=${encodeURIComponent(
            ticker
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to check watchlist"
          );
        }

        setInWatchlist(
          data.inWatchlist
        );
      } catch (error) {
        console.error(
          "Watchlist status error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to check watchlist"
        );
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [ticker]);

  /*
   * Add / Remove stock
   */
  async function toggleWatchlist() {
    try {
      setUpdating(true);
      setError("");

      /*
       * REMOVE
       */
      if (inWatchlist) {
        const response = await fetch(
          `/api/watchlist?ticker=${encodeURIComponent(
            ticker
          )}`,
          {
            method: "DELETE",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to remove stock"
          );
        }

        setInWatchlist(false);

        return;
      }

      /*
       * ADD
       */
      const response = await fetch(
        "/api/watchlist",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ticker,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add stock"
        );
      }

      setInWatchlist(true);
    } catch (error) {
      console.error(
        "Watchlist toggle error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update watchlist"
      );
    } finally {
      setUpdating(false);
    }
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-400"
      >
        Checking...
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggleWatchlist}
        disabled={updating}
        className={`rounded-lg border px-5 py-3 text-sm font-medium transition ${
          inWatchlist
            ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
            : "border-slate-700 bg-slate-900 text-white hover:border-blue-500 hover:bg-blue-500/10"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {updating
          ? "Updating..."
          : inWatchlist
          ? "✓ In Watchlist"
          : "⭐ Add to Watchlist"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
