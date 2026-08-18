"use client";

import { useState } from "react";
import {
  Bell,
  Trash2,
  TrendingDown,
  TrendingUp,
  Percent,
} from "lucide-react";

import type { Alert } from "../../../types/alert";

interface AlertCardProps {
  alert: Alert;
  onDeleted: (alertId: string) => void;
}

function getAlertIcon(
  alertType: Alert["alert_type"]
) {
  switch (alertType) {
    case "PRICE_ABOVE":
      return TrendingUp;

    case "PRICE_BELOW":
      return TrendingDown;

    case "PERCENT_CHANGE":
      return Percent;

    default:
      return Bell;
  }
}

function getAlertLabel(
  alertType: Alert["alert_type"]
) {
  switch (alertType) {
    case "PRICE_ABOVE":
      return "Price Above";

    case "PRICE_BELOW":
      return "Price Below";

    case "PERCENT_CHANGE":
      return "Percent Change";

    default:
      return alertType;
  }
}

export default function AlertCard({
  alert,
  onDeleted,
}: AlertCardProps) {
  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const Icon = getAlertIcon(
    alert.alert_type
  );

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete alert for ${alert.ticker}?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
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
          data?.error ||
            "Failed to delete alert"
        );
      }

      onDeleted(alert.id);
    } catch (error) {
      console.error(
        "Failed to delete alert:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete alert"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="rounded-xl border p-5 transition hover:shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              {alert.ticker}
            </h2>

            <p className="text-sm text-muted-foreground">
              {getAlertLabel(
                alert.alert_type
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Delete ${alert.ticker} alert`}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Target */}
      <div className="mb-4 rounded-lg bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          Target Value
        </p>

        <p className="mt-1 text-2xl font-bold">
          {alert.alert_type ===
          "PERCENT_CHANGE"
            ? `${alert.target_value}%`
            : alert.target_value.toLocaleString()}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Status
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            alert.is_triggered
              ? "bg-muted text-foreground"
              : alert.is_active
              ? "bg-muted text-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {alert.is_triggered
            ? "Triggered"
            : alert.is_active
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      {/* Current Value */}
      {alert.current_value !==
        null && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Current Value
          </span>

          <span className="text-sm font-medium">
            {alert.current_value.toLocaleString()}
          </span>
        </div>
      )}

      {/* Created */}
      <div className="mt-4 border-t pt-3">
        <p className="text-xs text-muted-foreground">
          Created{" "}
          {new Date(
            alert.created_at
          ).toLocaleDateString()}
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </article>
  );
}