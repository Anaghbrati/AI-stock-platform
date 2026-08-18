"use client";

import Link from "next/link";

import type { Alert } from "../../types/alert";

interface DashboardStockQuote {
  ticker: string;
  companyName: string | null;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
}

interface DashboardWatchlistItem {
  id: number;
  ticker: string;
  stock: DashboardStockQuote | null;
  alerts: Alert[];
}

interface DashboardMarketIndex {
  ticker: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
}

interface DashboardAlertSummary {
  active: number;
  triggered: number;
  total: number;
  recent: Alert[];
}

export interface DashboardSummaryData {
  alerts: DashboardAlertSummary;

  watchlist: {
    total: number;
    items: DashboardWatchlistItem[];
  };

  market: {
    indices: DashboardMarketIndex[];
  };
}

interface DashboardSummaryProps {
  summary: DashboardSummaryData;
}

export default function DashboardSummary({
  summary,
}: DashboardSummaryProps) {
  return (
    <section>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Your activity
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Dashboard Summary
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Monitor alerts and your watchlist from one place.
          </p>
        </div>

        <Link
          href="/alerts"
          className="w-fit rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-white"
        >
          Manage Alerts →
        </Link>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Active Alerts"
          value={summary.alerts.active}
          description="Alerts currently watching the market"
          icon="🔔"
          href="/alerts"
          accent="emerald"
        />

        <SummaryCard
          label="Triggered Alerts"
          value={summary.alerts.triggered}
          description="Alerts that have already fired"
          icon="⚡"
          href="/alerts"
          accent="red"
        />

        <SummaryCard
          label="Watchlist"
          value={summary.watchlist.total}
          description="Stocks you're currently tracking"
          icon="⭐"
          href="#watchlist"
          accent="blue"
        />
      </div>

      {/* =====================================================
          WATCHLIST PERFORMANCE
      ====================================================== */}

      <div className="mt-4">
        <WatchlistSnapshot
          items={summary.watchlist.items}
        />
      </div>

      {/* =====================================================
          RECENT ALERTS
      ====================================================== */}

      <div className="mt-4">
        <RecentAlerts
          alerts={summary.alerts.recent}
        />
      </div>

      {/* =====================================================
          MARKET INDICES
      ====================================================== */}

      <div className="mt-4">
        <MarketSnapshot
          indices={summary.market.indices}
        />
      </div>
    </section>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  label,
  value,
  description,
  icon,
  href,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  href: string;
  accent: "emerald" | "red" | "blue";
}) {
  const styles = {
    emerald: {
      icon:
        "border-emerald-500/20 bg-emerald-500/10",
      text:
        "text-emerald-400",
      glow:
        "bg-emerald-500/5",
    },

    red: {
      icon:
        "border-red-500/20 bg-red-500/10",
      text:
        "text-red-400",
      glow:
        "bg-red-500/5",
    },

    blue: {
      icon:
        "border-blue-500/20 bg-blue-500/10",
      text:
        "text-blue-400",
      glow:
        "bg-blue-500/5",
    },
  }[accent];

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#12161b]"
    >
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${styles.glow}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-base ${styles.icon}`}
          >
            {icon}
          </div>

          <span className="text-xs text-slate-700 transition group-hover:text-slate-500">
            →
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
            {label}
          </p>

          <p
            className={`mt-1 text-3xl font-black tracking-tight ${styles.text}`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}


/* ============================================================
   WATCHLIST SNAPSHOT
============================================================ */

function WatchlistSnapshot({
  items,
}: {
  items: DashboardWatchlistItem[];
}) {
  return (
    <div
      id="watchlist"
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Watchlist Snapshot
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Current performance of your watched stocks
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 transition hover:text-white"
        >
          View watchlist →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            Your watchlist is empty
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Add stocks to start tracking their performance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-white/[0.05] md:grid-cols-2 md:divide-y-0">
          {items.slice(0, 6).map((item) => (
            <WatchlistSnapshotRow
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}


/* ============================================================
   WATCHLIST ROW
============================================================ */

function WatchlistSnapshotRow({
  item,
}: {
  item: DashboardWatchlistItem;
}) {
  const price =
    item.stock?.price ?? null;

  const change =
    item.stock?.changePercent ?? null;

  const positive =
    change !== null &&
    change > 0;

  const negative =
    change !== null &&
    change < 0;

  const alertCount =
    item.alerts.length;

  return (
    <Link
      href={`/stock/${encodeURIComponent(
        item.ticker
      )}`}
      className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.02]"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white">
            {item.ticker}
          </p>

          {alertCount > 0 && (
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
              🔔 {alertCount}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-xs text-slate-600">
          {item.stock?.companyName ||
            "Market security"}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-white">
          {price !== null
            ? formatPrice(
                price,
                item.stock?.currency
              )
            : "N/A"}
        </p>

        <p
          className={`mt-1 text-xs font-semibold ${
            positive
              ? "text-emerald-400"
              : negative
              ? "text-red-400"
              : "text-slate-600"
          }`}
        >
          {change !== null
            ? `${
                positive ? "+" : ""
              }${change.toFixed(2)}%`
            : "N/A"}
        </p>
      </div>
    </Link>
  );
}


/* ============================================================
   RECENT ALERTS
============================================================ */

function RecentAlerts({
  alerts,
}: {
  alerts: Alert[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Recent Alerts
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Latest alert activity
          </p>
        </div>

        <Link
          href="/alerts"
          className="text-xs font-semibold text-slate-500 transition hover:text-white"
        >
          View all →
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
            🔔
          </div>

          <p className="mt-3 text-sm font-semibold text-white">
            No recent alerts
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Create an alert to start monitoring a stock.
          </p>

          <Link
            href="/alerts"
            className="mt-4 inline-flex rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Create Alert
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {alerts.map((alert) => (
            <RecentAlertRow
              key={alert.id}
              alert={alert}
            />
          ))}
        </div>
      )}
    </div>
  );
}


/* ============================================================
   RECENT ALERT ROW
============================================================ */

function RecentAlertRow({
  alert,
}: {
  alert: Alert;
}) {
  const triggered =
    alert.is_triggered;

  const candidate = alert as Alert & {
  triggered_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  triggered_value?: number | null;
};

  const triggeredValue =
  "triggered_value" in candidate &&
  typeof candidate.triggered_value === "number"
    ? candidate.triggered_value
    : null;

  const timestamp =
    candidate.triggered_at ??
    candidate.created_at ??
    candidate.updated_at ??
    null;

  return (
    <div className="flex flex-col gap-4 px-5 py-4 transition hover:bg-white/[0.015] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
            triggered
              ? "border-red-500/20 bg-red-500/10"
              : "border-emerald-500/20 bg-emerald-500/10"
          }`}
        >
          {triggered ? "⚡" : "🔔"}
        </div>

        <div className="min-w-0">
          <Link
            href={`/stock/${encodeURIComponent(
              alert.ticker
            )}`}
            className="text-sm font-bold text-white transition hover:text-slate-300"
          >
            {alert.ticker}
          </Link>

          <p className="mt-0.5 text-xs text-slate-600">
            {formatAlertType(
              alert.alert_type
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-700">
            Target
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {formatNumber(
              alert.target_value
            )}
          </p>
        </div>

        {triggered && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-700">
              Triggered
            </p>

            <p className="mt-1 text-xs font-semibold text-red-400">
              {triggeredValue !== null
                ? formatNumber(
                    Number(
                      triggeredValue
                    )
                  )
                : "—"}
            </p>
          </div>
        )}

        <span
          className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
            triggered
              ? "border-red-500/20 bg-red-500/10 text-red-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {triggered
            ? "Triggered"
            : "Active"}
        </span>

        <p className="hidden text-xs text-slate-600 lg:block">
          {formatDate(timestamp)}
        </p>
      </div>
    </div>
  );
}


/* ============================================================
   MARKET SNAPSHOT
============================================================ */

function MarketSnapshot({
  indices,
}: {
  indices: DashboardMarketIndex[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Market Snapshot
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Major Indian indices
          </p>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700">
          Market
        </span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-white/[0.05] md:grid-cols-2 md:divide-x md:divide-y-0">
        {indices.map((index) => {
          const change =
            index.changePercent;

          const positive =
            change !== null &&
            change > 0;

          const negative =
            change !== null &&
            change < 0;

          return (
            <Link
              key={index.ticker}
              href={`/stock/${encodeURIComponent(
                index.ticker
              )}`}
              className="flex items-center justify-between px-5 py-5 transition hover:bg-white/[0.02]"
            >
              <div>
                <p className="text-xs text-slate-600">
                  {index.name}
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {index.price !== null
                    ? index.price.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )
                    : "N/A"}
                </p>
              </div>

              <div
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  positive
                    ? "border-emerald-500/10 bg-emerald-500/10 text-emerald-400"
                    : negative
                    ? "border-red-500/10 bg-red-500/10 text-red-400"
                    : "border-white/[0.06] bg-white/[0.03] text-slate-500"
                }`}
              >
                {change !== null
                  ? `${
                      positive
                        ? "+"
                        : ""
                    }${change.toFixed(
                      2
                    )}%`
                  : "N/A"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function formatPrice(
  price: number,
  currency: string | null | undefined
) {
  const prefix =
    currency === "INR"
      ? "₹"
      : "";

  return `${prefix}${price.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}


function formatNumber(
  value: number
) {
  if (
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "—";
  }

  return Number(value).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}


function formatAlertType(
  type: string
) {
  switch (type) {
    case "PRICE_ABOVE":
      return "Price above target";

    case "PRICE_BELOW":
      return "Price below target";

    case "PERCENT_CHANGE":
      return "Percentage change";

    default:
      return type
        .replaceAll("_", " ")
        .toLowerCase();
  }
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}