"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  X,
  Trash2,
  Plus,
} from "lucide-react";

import type {
  Alert,
  AlertType,
} from "../../types/alert";

interface StockAlertButtonProps {
  ticker: string;
}

export default function StockAlertButton({
  ticker,
}: StockAlertButtonProps) {
  const normalizedTicker =
    ticker.trim().toUpperCase();

  /* =========================================================
     STATE
  ========================================================= */

  const [open, setOpen] =
    useState(false);

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [loadingAlerts, setLoadingAlerts] =
    useState(true);

  const [alertType, setAlertType] =
    useState<AlertType>("PRICE_ABOVE");

  const [targetValue, setTargetValue] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  /* =========================================================
     FETCH ALERTS FOR THIS STOCK
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      try {
        setLoadingAlerts(true);
        setError(null);

        const response = await fetch(
          "/api/alerts",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to fetch alerts."
          );
        }

        const allAlerts: Alert[] =
          Array.isArray(data?.alerts)
            ? data.alerts
            : [];

        /*
         * Only show alerts belonging to
         * the current stock.
         */

        const stockAlerts =
          allAlerts.filter(
            (alert) =>
              alert.ticker
                ?.trim()
                .toUpperCase() ===
              normalizedTicker
          );

        if (!cancelled) {
          setAlerts(stockAlerts);
        }
      } catch (error) {
        console.error(
          "Failed to load alerts:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load alerts."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAlerts(false);
        }
      }
    }

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [normalizedTicker]);

  /* =========================================================
     OPEN CREATE ALERT MODAL
  ========================================================= */

  function openModal() {
    setError(null);
    setSuccess(false);
    setTargetValue("");
    setAlertType("PRICE_ABOVE");
    setOpen(true);
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeModal() {
    if (loading) {
      return;
    }

    setOpen(false);
    setError(null);
  }

  /* =========================================================
     CREATE ALERT
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const numericTarget =
      Number(targetValue);

    if (
      !Number.isFinite(numericTarget) ||
      numericTarget <= 0
    ) {
      setError(
        "Target value must be a valid positive number."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/alerts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ticker: normalizedTicker,
            alert_type: alertType,
            target_value: numericTarget,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to create alert."
        );
      }

      /*
       * The API returns the newly-created
       * alert.
       */

      const createdAlert: Alert =
        data.alert;

      /*
       * Immediately add it to the UI.
       *
       * No page refresh required.
       */

      setAlerts((currentAlerts) => [
        createdAlert,
        ...currentAlerts,
      ]);

      setSuccess(true);
      setTargetValue("");

      /*
       * Close the modal after success.
       */

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1000);
    } catch (error) {
      console.error(
        "Failed to create alert:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create alert."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     DELETE ALERT
  ========================================================= */

  async function handleDeleteAlert(
    alertId: string
  ) {
    try {
      setDeletingId(alertId);
      setError(null);

      const response = await fetch(
        `/api/alerts/${alertId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to delete alert."
        );
      }

      /*
       * Remove it immediately from UI.
       */

      setAlerts((currentAlerts) =>
        currentAlerts.filter(
          (alert) =>
            alert.id !== alertId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete alert:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete alert."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     ALERT LABEL
  ========================================================= */

  function getAlertLabel(
    alertType: AlertType
  ) {
    switch (alertType) {
      case "PRICE_ABOVE":
        return "Price Above";

      case "PRICE_BELOW":
        return "Price Below";

      case "PERCENT_CHANGE":
        return "Percentage Change";

      default:
        return alertType;
    }
  }

  /* =========================================================
     ALERT VALUE
  ========================================================= */

  function formatAlertValue(
    alert: Alert
  ) {
    if (
      alert.alert_type ===
      "PERCENT_CHANGE"
    ) {
      return `${alert.target_value}%`;
    }

    return `₹${Number(
      alert.target_value
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loadingAlerts) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-500">
        <Bell className="h-4 w-4 animate-pulse" />

        Loading alerts...
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">

        {/* ===================================================
            EXISTING ALERTS
        =================================================== */}

        {alerts.length > 0 &&
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="group flex items-center gap-3 rounded-xl border border-[#ff4d61]/20 bg-[#ff4d61]/[0.06] px-4 py-3"
            >
              <Bell className="h-4 w-4 shrink-0 text-[#ff6678]" />

              <div className="min-w-0">

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {getAlertLabel(
                    alert.alert_type
                  )}
                </p>

                <p className="mt-0.5 text-sm font-bold text-white">
                  {formatAlertValue(
                    alert
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  handleDeleteAlert(
                    alert.id
                  )
                }
                disabled={
                  deletingId ===
                  alert.id
                }
                className="ml-1 rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Delete alert"
              >
                <Trash2 className="h-4 w-4" />
              </button>

            </div>
          ))}

        {/* ===================================================
            ADD ALERT BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={openModal}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#ff4d61]/20 bg-[#ff4d61]/[0.06] px-4 py-3 text-sm font-semibold text-[#ff6678] transition hover:border-[#ff4d61]/40 hover:bg-[#ff4d61]/[0.12]"
        >
          {alerts.length > 0 ? (
            <Plus className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}

          {alerts.length > 0
            ? "Add Another Alert"
            : "Add Alert"}
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !open && (
        <div className="mt-3 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3">
          <p className="text-xs text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          MODAL
      ===================================================== */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#101318] p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <Bell className="h-5 w-5 text-[#ff6678]" />

                  <h2 className="text-xl font-bold text-white">
                    Create Alert
                  </h2>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Monitor{" "}
                  <span className="font-semibold text-slate-300">
                    {normalizedTicker}
                  </span>
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                aria-label="Close alert dialog"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* STOCK */}

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Stock
                </label>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white">
                  {normalizedTicker}
                </div>

              </div>

              {/* ALERT TYPE */}

              <div>

                <label
                  htmlFor="stock-alert-type"
                  className="mb-2 block text-xs font-semibold text-slate-400"
                >
                  Alert Type
                </label>

                <select
                  id="stock-alert-type"
                  value={alertType}
                  onChange={(event) =>
                    setAlertType(
                      event.target
                        .value as AlertType
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#11151a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff4d61]/40"
                >
                  <option value="PRICE_ABOVE">
                    Price Above
                  </option>

                  <option value="PRICE_BELOW">
                    Price Below
                  </option>

                  <option value="PERCENT_CHANGE">
                    Percentage Change
                  </option>
                </select>

              </div>

              {/* TARGET */}

              <div>

                <label
                  htmlFor="stock-alert-target"
                  className="mb-2 block text-xs font-semibold text-slate-400"
                >
                  Target Value
                </label>

                <input
                  id="stock-alert-target"
                  type="number"
                  min="0"
                  step="any"
                  value={targetValue}
                  onChange={(event) =>
                    setTargetValue(
                      event.target.value
                    )
                  }
                  placeholder={
                    alertType ===
                    "PERCENT_CHANGE"
                      ? "5"
                      : "1600"
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-[#ff4d61]/40"
                />

                <p className="mt-2 text-xs text-slate-600">

                  {alertType ===
                  "PRICE_ABOVE"
                    ? "Alert when the stock reaches or exceeds this price."
                    : alertType ===
                      "PRICE_BELOW"
                    ? "Alert when the stock reaches or falls below this price."
                    : "Alert when the percentage change reaches this value."}

                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3">

                  <p className="text-xs text-red-400">
                    {error}
                  </p>

                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3">

                  <p className="text-xs text-emerald-400">
                    Alert created successfully.
                  </p>

                </div>
              )}

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-xl border border-white/[0.07] px-4 py-3 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#ff4d61] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#ff6577] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creating..."
                    : "Create Alert"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}