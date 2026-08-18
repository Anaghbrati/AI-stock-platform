import {
  SupabaseAlertRepository,
} from "../repositories/alerts/supabase-alert.repository";

import {
  getWatchlist,
} from "../repositories/watchlist.repository";

import {
  getStockQuote,
} from "./stock.service";

import type {
  Alert,
} from "../../types/alert";

// ========================================
// CONSTANTS
// ========================================

const MARKET_INDICES = [
  {
    ticker: "^NSEI",
    name: "NIFTY 50",
  },
  {
    ticker: "^BSESN",
    name: "SENSEX",
  },
] as const;

// ========================================
// TYPES
// ========================================

export interface DashboardStockQuote {
  ticker: string;
  companyName: string | null;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
}

export interface DashboardWatchlistItem {
  id: number;
  ticker: string;
  stock: DashboardStockQuote | null;
  alerts: Alert[];
}

export interface DashboardMarketIndex {
  ticker: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
}

export interface DashboardAlertSummary {
  active: number;
  triggered: number;
  total: number;
  recent: Alert[];
}

export interface DashboardSummary {
  alerts: DashboardAlertSummary;

  watchlist: {
    total: number;
    items: DashboardWatchlistItem[];
  };

  market: {
    indices: DashboardMarketIndex[];
  };
}

// ========================================
// HELPERS
// ========================================

function normalizeTicker(
  ticker: string
): string {
  return ticker.trim().toUpperCase();
}

// ========================================
// SAFE STOCK QUOTE
// ========================================
//
// A failed quote should not make the entire
// dashboard fail.
//
// This is especially important because one
// invalid/unavailable ticker should not prevent
// the remaining dashboard data from rendering.
//

async function getSafeStockQuote(
  ticker: string
): Promise<DashboardStockQuote | null> {
  const normalizedTicker =
    normalizeTicker(ticker);

  try {
    const stock =
      await getStockQuote(
        normalizedTicker
      );

    if (!stock) {
      return null;
    }

    return {
      ticker:
        typeof stock.ticker === "string"
          ? stock.ticker
          : normalizedTicker,

      companyName:
        typeof stock.companyName === "string"
          ? stock.companyName
          : null,

      price:
        typeof stock.price === "number" &&
        Number.isFinite(stock.price)
          ? stock.price
          : null,

      changePercent:
        typeof stock.changePercent === "number" &&
        Number.isFinite(
          stock.changePercent
        )
          ? stock.changePercent
          : null,

      currency:
        typeof stock.currency === "string"
          ? stock.currency
          : null,
    };
  } catch (error) {
    console.error(
      `[Dashboard] Failed to fetch quote for ${normalizedTicker}:`,
      error
    );

    return null;
  }
}

// ========================================
// GET ALERT SUMMARY
// ========================================

function buildAlertSummary(
  alerts: Alert[]
): DashboardAlertSummary {
  const active =
    alerts.filter(
      (alert) =>
        alert.is_active &&
        !alert.is_triggered
    ).length;

  const triggered =
    alerts.filter(
      (alert) =>
        alert.is_triggered
    ).length;

  /*
   * Recent alerts
   *
   * Triggered alerts are prioritised because
   * they are the most useful dashboard events.
   *
   * We then fall back to the most recently
   * created alerts.
   */

  const sortedAlerts = [
    ...alerts,
  ].sort(
    (a, b) => {
      const aTime =
        getAlertTimestamp(a);

      const bTime =
        getAlertTimestamp(b);

      return bTime - aTime;
    }
  );

  const recent =
    sortedAlerts.slice(
      0,
      5
    );

  return {
    active,
    triggered,
    total: alerts.length,
    recent,
  };
}

// ========================================
// ALERT TIMESTAMP
// ========================================
//
// Alert schemas can evolve. We therefore
// safely check the common timestamp fields
// rather than assuming one exact field exists.
//

function getAlertTimestamp(
  alert: Alert
): number {
  const candidate =
    alert as Alert & {
      triggered_at?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };

  const timestamp =
    candidate.triggered_at ??
    candidate.created_at ??
    candidate.updated_at ??
    null;

  if (!timestamp) {
    return 0;
  }

  const time =
    new Date(
      timestamp
    ).getTime();

  return Number.isFinite(time)
    ? time
    : 0;
}

// ========================================
// GET MARKET INDICES
// ========================================
//
// All indices are fetched in parallel.
//

async function getMarketIndices(): Promise<
  DashboardMarketIndex[]
> {
  const results =
    await Promise.all(
      MARKET_INDICES.map(
        async (index) => {
          const stock =
            await getSafeStockQuote(
              index.ticker
            );

          return {
            ticker:
              index.ticker,

            name:
              index.name,

            price:
              stock?.price ??
              null,

            changePercent:
              stock?.changePercent ??
              null,

            currency:
              stock?.currency ??
              null,
          };
        }
      )
    );

  return results;
}

// ========================================
// GET WATCHLIST WITH QUOTES + ALERTS
// ========================================
//
// Important:
//
// Watchlist database data, alerts, and market
// quotes are handled here rather than making
// every dashboard component independently
// request the same information.
//

async function getDashboardWatchlist(
  userId: string,
  alerts: Alert[]
): Promise<
  DashboardWatchlistItem[]
> {
  const watchlist =
    await getWatchlist(
      userId
    );

  if (
    watchlist.length === 0
  ) {
    return [];
  }

  /*
   * Fetch all watchlist quotes in parallel.
   *
   * Each ticker is fetched only once inside
   * this dashboard operation.
   */

  const items =
    await Promise.all(
      watchlist.map(
        async (item) => {
          const normalizedTicker =
            normalizeTicker(
              item.ticker
            );

          const stock =
            await getSafeStockQuote(
              normalizedTicker
            );

          const tickerAlerts =
            alerts.filter(
              (alert) =>
                normalizeTicker(
                  alert.ticker
                ) ===
                normalizedTicker
            );

          return {
            id:
              item.id,

            ticker:
              normalizedTicker,

            stock,

            alerts:
              tickerAlerts,
          };
        }
      )
    );

  return items;
}

// ========================================
// GET DASHBOARD SUMMARY
// ========================================
//
// Main dashboard data entry point.
//
// This function is intentionally server-side.
//
// The dashboard API route will call this function.
//
// ========================================

export async function getDashboardSummary(
  userId: string
): Promise<DashboardSummary> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  const alertRepository =
    new SupabaseAlertRepository();

  /*
   * ======================================
   * PARALLEL BASE DATA
   * ======================================
   *
   * Alerts, watchlist and market indices are
   * independent at this stage.
   *
   * Fetch them concurrently.
   */

  const [
  alerts,
  marketIndices,
] = await Promise.all([
  alertRepository.getAlerts(userId),
  getMarketIndices(),
]);

  /*
   * ======================================
   * WATCHLIST
   * ======================================
   */

  const dashboardWatchlist =
    await getDashboardWatchlist(
      userId,
      alerts
    );

  /*
   * ======================================
   * ALERT SUMMARY
   * ======================================
   */

  const alertSummary =
    buildAlertSummary(
      alerts
    );

  /*
   * ======================================
   * FINAL RESULT
   * ======================================
   */

  return {
    alerts:
      alertSummary,

    watchlist: {
      total:
        dashboardWatchlist.length,

      items:
        dashboardWatchlist,
    },

    market: {
      indices:
        marketIndices,
    },
  };
}