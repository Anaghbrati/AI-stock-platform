"use client";

import { useEffect, useState } from "react";

import type { Alert } from "../../types/alert";

import DashboardShell from "../../components/dashboard/DashboardShell";
import CreateAlertForm from "../../components/alerts/CreateAlertForm";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAlerts(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await fetch("/api/alerts", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load alerts"
        );
      }

      setAlerts(data.alerts ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load alerts"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);
  useEffect(() => {
  async function processAlerts() {
    try {
      await fetch("/api/alerts/process", {
        method: "POST",
      });
    } catch (error) {
      console.error(
        "Failed to process alerts:",
        error
      );
    }
  }

  processAlerts();
}, []);

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
              onClick={() => loadAlerts(true)}
              disabled={refreshing || loading}
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
          onCreated={() => loadAlerts(true)}
        />


        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">
            <p className="text-xs font-medium text-slate-500">
              Total alerts
            </p>

            <p className="mt-2 text-2xl font-black text-white">
              {loading ? "—" : alerts.length}
            </p>
          </div>


          <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">
            <p className="text-xs font-medium text-slate-500">
              Active
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-400">
              {loading
                ? "—"
                : alerts.filter(
                    (alert) =>
                      alert.is_active
                  ).length}
            </p>
          </div>


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

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318] p-5"
                >
                  <div className="h-4 w-32 rounded bg-white/[0.06]" />

                  <div className="mt-3 h-3 w-24 rounded bg-white/[0.04]" />

                  <div className="mt-6 h-3 w-40 rounded bg-white/[0.04]" />
                </div>
              ))}

            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-6">

              <p className="text-sm font-semibold text-red-400">
                Unable to load alerts
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadAlerts()}
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

                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onUpdated={() =>
                      loadAlerts(true)
                    }
                  />
                ))}

              </div>
            )}

        </section>

      </div>
    </DashboardShell>
  );
}


/* =============================================================
   ALERT CARD
============================================================= */

interface AlertCardProps {
  alert: Alert;
  onUpdated: () => void;
}

function AlertCard({
  alert,
  onUpdated,
}: AlertCardProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const status = alert.is_triggered
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


  /* =========================================================
     TOGGLE ACTIVE STATE
  ========================================================= */

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
            is_active:
              !alert.is_active,
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


  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete() {
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


  return (
    <article className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5 transition hover:border-white/[0.1]">

      <div className="flex flex-col gap-5">

        {/* TOP */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          {/* LEFT */}

          <div className="min-w-0">

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

          <div className="flex flex-wrap items-center gap-6">

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
          <p className="text-xs text-red-400">
            {error}
          </p>
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
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border border-red-500/10 bg-red-500/[0.03] px-3 py-2 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>

        </div>


        {/* TRIGGER TIME */}

        {alert.is_triggered &&
          alert.triggered_at && (
            <div className="border-t border-white/[0.05] pt-4">

              <p className="text-[10px] text-slate-600">
                Triggered{" "}
                {new Date(
                  alert.triggered_at
                ).toLocaleString()}
              </p>

            </div>
          )}

      </div>

    </article>
  );
}