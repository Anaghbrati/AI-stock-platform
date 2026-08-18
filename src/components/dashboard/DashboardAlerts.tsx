"use client";

import { useMemo } from "react";
import Link from "next/link";

import type { Alert } from "../../types/alert";

interface DashboardAlertsProps {
  alerts: Alert[];
}

export default function DashboardAlerts({
  alerts,
}: DashboardAlertsProps) {
  /*
   * ==========================================================
   * DERIVED DASHBOARD DATA
   *
   * No API requests happen in this component.
   *
   * The dashboard server already fetched the user's alerts once.
   * ==========================================================
   */

  const activeAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          alert.is_active &&
          !alert.is_triggered
      ),
    [alerts]
  );

  const triggeredAlerts = useMemo(
    () =>
      alerts
        .filter(
          (alert) =>
            alert.is_triggered
        )
        .sort(
          (a, b) =>
            getTime(b.triggered_at) -
            getTime(a.triggered_at)
        ),
    [alerts]
  );

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .sort(
          (a, b) =>
            getTime(
              b.updated_at ||
                b.created_at
            ) -
            getTime(
              a.updated_at ||
                a.created_at
            )
        )
        .slice(0, 4),
    [alerts]
  );

  return (
    <section className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Automated monitoring
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Alert Overview
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Monitor your active and triggered market conditions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-600">
            {alerts.length} total
          </span>

          <Link
            href="/alerts"
            className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            Manage alerts
          </Link>
        </div>
      </div>


      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <AlertStatCard
          label="Active alerts"
          value={activeAlerts.length}
          description="Currently monitoring"
          valueClass="text-emerald-400"
        />

        <AlertStatCard
          label="Triggered"
          value={triggeredAlerts.length}
          description="Conditions reached"
          valueClass="text-[#ff6577]"
        />

        <AlertStatCard
          label="Total alerts"
          value={alerts.length}
          description="All monitoring rules"
          valueClass="text-white"
        />

      </div>


      {/* =====================================================
          ALERT CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* ===================================================
            RECENT ALERTS
        ==================================================== */}

        <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                Activity
              </p>

              <h3 className="mt-1 text-sm font-bold text-white">
                Recent alerts
              </h3>
            </div>

            <Link
              href="/alerts"
              className="text-[11px] font-semibold text-slate-500 transition hover:text-[#ff6577]"
            >
              Manage →
            </Link>

          </div>


          {recentAlerts.length === 0 ? (
            <AlertEmptyState
              message="No alerts created yet."
            />
          ) : (
            <div className="space-y-3">
              {recentAlerts.map(
                (alert) => (
                  <DashboardAlertRow
                    key={alert.id}
                    alert={alert}
                  />
                )
              )}
            </div>
          )}

        </section>


        {/* ===================================================
            TRIGGERED ALERTS
        ==================================================== */}

        <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                Signals
              </p>

              <h3 className="mt-1 text-sm font-bold text-white">
                Triggered alerts
              </h3>
            </div>

            <Link
              href="/alerts"
              className="text-[11px] font-semibold text-slate-500 transition hover:text-[#ff6577]"
            >
              View all →
            </Link>

          </div>


          {triggeredAlerts.length === 0 ? (
            <AlertEmptyState
              message="No alerts have been triggered."
            />
          ) : (
            <div className="space-y-3">
              {triggeredAlerts
                .slice(0, 4)
                .map((alert) => (
                  <TriggeredAlertRow
                    key={alert.id}
                    alert={alert}
                  />
                ))}
            </div>
          )}

        </section>

      </div>

    </section>
  );
}


/* =============================================================
   STAT CARD
============================================================= */

function AlertStatCard({
  label,
  value,
  description,
  valueClass,
}: {
  label: string;
  value: number;
  description: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-700">
        {description}
      </p>

    </div>
  );
}


/* =============================================================
   RECENT ALERT ROW
============================================================= */

function DashboardAlertRow({
  alert,
}: {
  alert: Alert;
}) {
  const isTriggered =
    alert.is_triggered;

  const isActive =
    alert.is_active &&
    !alert.is_triggered;

  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <Link
              href={`/stock/${encodeURIComponent(
                alert.ticker
              )}`}
              className="text-sm font-bold text-white transition hover:text-[#ff6577]"
            >
              {alert.ticker}
            </Link>

            <AlertStatus
              triggered={isTriggered}
              active={isActive}
            />

          </div>

          <p className="mt-1 text-xs text-slate-500">
            {formatAlertCondition(alert)}
          </p>

        </div>


        <div className="shrink-0 text-right">

          <p className="text-sm font-semibold text-white">
            {formatTarget(alert)}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            {formatDate(
              alert.updated_at ||
                alert.created_at
            )}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   TRIGGERED ALERT ROW
============================================================= */

function TriggeredAlertRow({
  alert,
}: {
  alert: Alert;
}) {
  return (
    <div className="rounded-xl border border-[#ff4d61]/10 bg-[#ff4d61]/[0.025] p-4">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <Link
              href={`/stock/${encodeURIComponent(
                alert.ticker
              )}`}
              className="text-sm font-bold text-white transition hover:text-[#ff6577]"
            >
              {alert.ticker}
            </Link>

            <span className="rounded-full border border-[#ff4d61]/20 bg-[#ff4d61]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff6577]">
              Triggered
            </span>

          </div>

          <p className="mt-1 text-xs text-slate-500">
            {formatAlertCondition(alert)}
          </p>

        </div>


        <div className="shrink-0 text-right">

          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
            Triggered value
          </p>

          <p className="mt-1 text-sm font-bold text-white">
            {formatValue(
              alert.current_value
            )}
          </p>

        </div>

      </div>


      <div className="mt-3 border-t border-white/[0.05] pt-3">

        <p className="text-[10px] text-slate-600">
          {alert.triggered_at
            ? `Triggered ${formatDate(
                alert.triggered_at
              )}`
            : "Trigger time unavailable"}
        </p>

      </div>

    </div>
  );
}


/* =============================================================
   STATUS
============================================================= */

function AlertStatus({
  triggered,
  active,
}: {
  triggered: boolean;
  active: boolean;
}) {
  if (triggered) {
    return (
      <span className="rounded-full border border-[#ff4d61]/20 bg-[#ff4d61]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff6577]">
        Triggered
      </span>
    );
  }

  if (active) {
    return (
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
        Active
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
      Inactive
    </span>
  );
}


/* =============================================================
   CONDITION
============================================================= */

function formatAlertCondition(
  alert: Alert
) {
  switch (alert.alert_type) {
    case "PRICE_ABOVE":
      return `Price above ${formatValue(
        alert.target_value
      )}`;

    case "PRICE_BELOW":
      return `Price below ${formatValue(
        alert.target_value
      )}`;

    case "PERCENT_CHANGE":
      return `Percentage change ${formatPercentTarget(
        alert.target_value
      )}`;

    default:
      return "Market condition";
  }
}


/* =============================================================
   TARGET
============================================================= */

function formatTarget(
  alert: Alert
) {
  if (
    alert.alert_type ===
    "PERCENT_CHANGE"
  ) {
    return formatPercentTarget(
      alert.target_value
    );
  }

  return formatValue(
    alert.target_value
  );
}


/* =============================================================
   VALUE
============================================================= */

function formatValue(
  value: number | null
) {
  if (
    value === null ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}


/* =============================================================
   PERCENT
============================================================= */

function formatPercentTarget(
  value: number
) {
  if (!Number.isFinite(Number(value))) {
    return "—";
  }

  return `${Number(value) > 0 ? "+" : ""}${Number(
    value
  ).toFixed(2)}%`;
}


/* =============================================================
   DATE
============================================================= */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}


/* =============================================================
   TIME
============================================================= */

function getTime(
  value: string | null
) {
  if (!value) {
    return 0;
  }

  const time = new Date(
    value
  ).getTime();

  return Number.isFinite(time)
    ? time
    : 0;
}


/* =============================================================
   EMPTY
============================================================= */

function AlertEmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-8 text-center">

      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <span className="text-sm text-slate-600">
          🔔
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        {message}
      </p>

      <Link
        href="/alerts"
        className="mt-3 inline-block text-xs font-semibold text-slate-500 transition hover:text-[#ff6577]"
      >
        Create an alert →
      </Link>

    </div>
  );
}