"use client";

import { useState } from "react";
import type {
  AlertType,
  CreateAlertInput,
} from "../../../types/alert";

interface CreateAlertFormProps {
  onCreated: (
    alert: Awaited<
      Promise<Response>
    > extends never
      ? never
      : any
  ) => void;
  onCancel: () => void;
}

export default function CreateAlertForm({
  onCreated,
  onCancel,
}: CreateAlertFormProps) {
  const [ticker, setTicker] =
    useState("");

  const [alertType, setAlertType] =
    useState<AlertType>(
      "PRICE_ABOVE"
    );

  const [targetValue, setTargetValue] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

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
        "Target value must be greater than 0."
      );
      return;
    }

    const payload: CreateAlertInput = {
      ticker: normalizedTicker,
      alert_type: alertType,
      target_value: numericTarget,
    };

    setLoading(true);

    try {
      const response = await fetch(
        "/api/alerts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to create alert"
        );
      }

      onCreated(data.alert);

      setTicker("");
      setTargetValue("");
      setAlertType("PRICE_ABOVE");
    } catch (error) {
      console.error(
        "Failed to create alert:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create alert"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-5"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Create Alert
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Set a condition for a stock.
        </p>
      </div>

      {/* Ticker */}
      <div className="mb-4">
        <label
          htmlFor="ticker"
          className="mb-2 block text-sm font-medium"
        >
          Stock Ticker
        </label>

        <input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(event) =>
            setTicker(
              event.target.value
            )
          }
          placeholder="RELIANCE.NS"
          disabled={loading}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Alert Type */}
      <div className="mb-4">
        <label
          htmlFor="alertType"
          className="mb-2 block text-sm font-medium"
        >
          Alert Type
        </label>

        <select
          id="alertType"
          value={alertType}
          onChange={(event) =>
            setAlertType(
              event.target.value as AlertType
            )
          }
          disabled={loading}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="PRICE_ABOVE">
            Price Above
          </option>

          <option value="PRICE_BELOW">
            Price Below
          </option>

          <option value="PERCENT_CHANGE">
            Percent Change
          </option>
        </select>
      </div>

      {/* Target */}
      <div className="mb-5">
        <label
          htmlFor="targetValue"
          className="mb-2 block text-sm font-medium"
        >
          Target Value
        </label>

        <input
          id="targetValue"
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
              : "1500"
          }
          disabled={loading}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-50"
        />

        {alertType ===
          "PERCENT_CHANGE" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Enter the percentage change value.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Alert"}
        </button>
      </div>
    </form>
  );
}