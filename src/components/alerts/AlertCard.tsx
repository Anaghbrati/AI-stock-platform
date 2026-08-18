"use client";

import { useState } from "react";

import type { Alert } from "../../types/alert";

interface AlertCardProps {
  alert: Alert;
  onUpdated: () => void;
}

export default function AlertCard({
  alert,
  onUpdated,
}: AlertCardProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function toggleActive() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/alerts/${alert.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            is_active: !alert.is_active,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update alert"
        );
      }

      onUpdated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update alert"
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteAlert() {
    const confirmed =
      window.confirm(
        `Delete alert for ${alert.ticker}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/alerts/${alert.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete alert"
        );
      }

      onUpdated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete alert"
      );
    } finally {
      setLoading(false);
    }
  }

  const status =
    alert.is_triggered
      ? "Triggered"
      : alert.is_active
        ? "Active"
        : "Inactive";

  const statusClass =
    alert.is_triggered
      ? "border-[#ff4d61]/20 bg-[#ff4d61]/10 text-[#ff6577]"
      : alert.is_active
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        : "border-white/[0.06] bg-white/[0.025] text-slate-500";

  const alertDescription =
    alert.alert_type === "PRICE_ABOVE"
      ? "Price above"
      : alert.alert_type === "PRICE_BELOW"
        ? "Price below"
        : "Percentage change";

  return (
    <article className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5 transition hover:border-white/[0.1]">

      <div className="flex flex-col gap-5">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <div className="flex flex-wrap items-center gap-3">

              <h3 className="text-base font-bold text-white">
                {alert.ticker}
              </h3>

              <span
                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusClass}`}
              >
                {status}
              </span>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              {alertDescription}
            </p>
          </div>


          {/* VALUES */}

          <div className="flex gap-8">

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                Target
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {alert.target_value}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                Current
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-300">
                {alert.current_value ?? "—"}
              </p>
            </div>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3">
            <p className="text-xs text-red-400">
              {error}
            </p>
          </div>
        )}


        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2 border-t border-white/[0.05] pt-4">

          <button
            type="button"
            onClick={toggleActive}
            disabled={
              loading ||
              alert.is_triggered
            }
            className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "Updating..."
              : alert.is_active
                ? "Deactivate"
                : "Activate"}
          </button>


          <button
            type="button"
            onClick={deleteAlert}
            disabled={loading}
            className="rounded-lg border border-red-500/10 bg-red-500/[0.03] px-3 py-2 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>

        </div>


        {/* TRIGGERED TIME */}

        {alert.is_triggered &&
          alert.triggered_at && (
            <p className="text-[10px] text-slate-600">
              Triggered{" "}
              {new Date(
                alert.triggered_at
              ).toLocaleString()}
            </p>
          )}

      </div>

    </article>
  );
}