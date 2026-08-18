"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import type { Alert } from "../../types/alert";

import DashboardShell from "../../components/dashboard/DashboardShell";
import CreateAlertForm from "../../components/alerts/CreateAlertForm";
import AlertCard from "../../components/alerts/AlertCard";

export default function AlertsPage() {
  const searchParams = useSearchParams();

  /*
   * Read ticker directly from:
   *
   * /alerts?ticker=RELIANCE.NS
   *
   * This does NOT require an API request.
   */
  const tickerFromUrl =
    searchParams.get("ticker")?.trim().toUpperCase() ?? "";

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // LOAD ALERTS
  // ==========================================================

  async function loadAlerts(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await fetch(
        "/api/alerts",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load alerts."
        );
      }

      setAlerts(
        Array.isArray(data?.alerts)
          ? data.alerts
          : []
      );
    } catch (error) {
      console.error(
        "Load alerts error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load alerts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAlerts();
  }, []);

  // ==========================================================
  // PROCESS ALERTS
  // ==========================================================

  useEffect(() => {
    async function processAlerts() {
      try {
        await fetch(
          "/api/alerts/process",
          {
            method: "POST",
            headers: {
              Accept:
                "application/json",
            },
          }
        );
      } catch (error) {
        console.error(
          "Failed to process alerts:",
          error
        );
      }
    }

    processAlerts();
  }, []);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardShell>
      <div className="space-y-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section>
          <p className="text-sm text-slate-500">
            Automated market monitoring
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Alerts
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor stocks and get notified when your
                predefined market conditions are reached.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadAlerts(true)
              }
              disabled={
                refreshing ||
                loading
              }
              className="w-fit rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>
        </section>

        {/* =====================================================
            CREATE ALERT
        ====================================================== */}

        <CreateAlertForm
          ticker={tickerFromUrl}
          onCreated={() =>
            loadAlerts(true)
          }
        />

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">
            <p className="text-xs font-medium text-slate-500">
              Total alerts
            </p>

            <p className="mt-2 text-2xl font-black text-white">
              {loading
                ? "—"
                : alerts.length}
            </p>
          </div>

          {/* ACTIVE */}

          <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">
            <p className="text-xs font-medium text-slate-500">
              Active
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-400">
              {loading
                ? "—"
                : alerts.filter(
                    (alert) =>
                      alert.is_active &&
                      !alert.is_triggered
                  ).length}
            </p>
          </div>

          {/* TRIGGERED */}

          <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">
            <p className="text-xs font-medium text-slate-500">
              Triggered
            </p>

            <p className="mt-2 text-2xl font-black text-[#ff6577]">
              {loading
                ? "—"
                : alerts.filter(
                    (alert) =>
                      alert.is_triggered
                  ).length}
            </p>
          </div>

        </section>

        {/* =====================================================
            ALERT LIST
        ====================================================== */}

        <section>

          <div className="mb-4">
            <p className="text-sm text-slate-500">
              Your monitoring rules
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Alert activity
            </h2>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="space-y-3">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318] p-5"
                  >
                    <div className="h-4 w-32 rounded bg-white/[0.06]" />

                    <div className="mt-3 h-3 w-24 rounded bg-white/[0.04]" />

                    <div className="mt-6 h-3 w-40 rounded bg-white/[0.04]" />
                  </div>
                )
              )}

            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-6">

                <p className="text-sm font-semibold text-red-400">
                  Unable to load alerts
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadAlerts()
                  }
                  className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Retry
                </button>

              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            alerts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#101318] p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#ff4d61]/15 bg-[#ff4d61]/10 text-xl text-[#ff6577]">
                  ◉
                </div>

                <h3 className="mt-4 text-sm font-bold text-white">
                  No alerts yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Create your first price or percentage-change
                  alert to start monitoring the market.
                </p>

              </div>
            )}

          {/* ALERTS */}

          {!loading &&
            !error &&
            alerts.length > 0 && (
              <div className="space-y-3">

                {alerts.map(
                  (alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onUpdated={() =>
                        loadAlerts(true)
                      }
                    />
                  )
                )}

              </div>
            )}

        </section>

      </div>
    </DashboardShell>
  );
}