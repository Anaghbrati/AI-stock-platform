"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import type { AlertType } from "../../types/alert";

interface CreateAlertFormProps {
  onCreated: () => void;
  ticker?: string;
}

export default function CreateAlertForm({
  onCreated,
  ticker: initialTicker,
}: CreateAlertFormProps) {
  const [ticker, setTicker] = useState(
    initialTicker?.trim().toUpperCase() ?? ""
  );

  const [alertType, setAlertType] =
    useState<AlertType>("PRICE_ABOVE");

  const [targetValue, setTargetValue] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  /*
   * Keep ticker synchronized with
   * the URL/query parameter.
   */
  useEffect(() => {
    setTicker(
      initialTicker?.trim().toUpperCase() ?? ""
    );
  }, [initialTicker]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const normalizedTicker =
      ticker.trim().toUpperCase();

    const numericTarget =
      Number(targetValue);

    if (!normalizedTicker) {
      setError("Ticker is required.");
      return;
    }

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
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            ticker: normalizedTicker,
            alert_type: alertType,
            target_value:
              numericTarget,
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
       * Keep the ticker when coming from
       * Watchlist / stock page.
       *
       * Otherwise clear it after creation.
       */
      if (!initialTicker) {
        setTicker("");
      }

      setTargetValue("");
      setAlertType("PRICE_ABOVE");
      setSuccess(true);

      onCreated();
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

  const hasPrefilledTicker =
    Boolean(initialTicker);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <p className="text-sm text-slate-500">
          Create monitoring rule
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          New Alert
        </h2>

        {hasPrefilledTicker && (
          <p className="mt-2 text-xs text-slate-500">
            Creating an alert for{" "}
            <span className="font-semibold text-[#ff6577]">
              {ticker}
            </span>
          </p>
        )}
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        {/* ===================================================
            TICKER
        ==================================================== */}

        <div>
          <label
            htmlFor="alert-ticker"
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            Stock ticker
          </label>

          <div className="relative">
            <input
              id="alert-ticker"
              value={ticker}
              onChange={(event) =>
                setTicker(
                  event.target.value
                    .toUpperCase()
                )
              }
              placeholder="RELIANCE.NS"
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white outline-none placeholder:text-slate-700 transition focus:border-[#ff4d61]/40 focus:bg-white/[0.04] ${
                hasPrefilledTicker
                  ? "border-[#ff4d61]/20 bg-[#ff4d61]/[0.04]"
                  : "border-white/[0.06] bg-white/[0.025]"
              }`}
            />

            {hasPrefilledTicker && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[#ff4d61]/20 bg-[#ff4d61]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#ff6577]">
                Selected
              </span>
            )}
          </div>
        </div>

        {/* ===================================================
            ALERT TYPE
        ==================================================== */}

        <div>
          <label
            htmlFor="alert-type"
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            Alert type
          </label>

          <select
            id="alert-type"
            value={alertType}
            onChange={(event) =>
              setAlertType(
                event.target.value as AlertType
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

        {/* ===================================================
            TARGET
        ==================================================== */}

        <div>
          <label
            htmlFor="alert-target"
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            {alertType ===
            "PERCENT_CHANGE"
              ? "Target percentage"
              : "Target price"}
          </label>

          <div className="relative">
            <input
              id="alert-target"
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
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-[#ff4d61]/40 focus:bg-white/[0.04]"
            />

            {alertType ===
              "PERCENT_CHANGE" && (
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3">
          <p className="text-xs text-red-400">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3">
          <p className="text-xs text-emerald-400">
            Alert created successfully for{" "}
            <span className="font-semibold">
              {ticker}
            </span>
            .
          </p>
        </div>
      )}

      {/* =====================================================
          SUBMIT
      ====================================================== */}

      <div className="mt-6 flex justify-end">
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
  );
}