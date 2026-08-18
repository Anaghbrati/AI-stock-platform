import {
  SupabaseAlertRepository,
} from "../repositories/alerts/supabase-alert.repository";

import {
  getStockQuote,
} from "./stock.service";

import type {
  Alert,
} from "../../types/alert";

const alertRepository =
  new SupabaseAlertRepository();

// ========================================
// TYPES
// ========================================

export interface AlertEvaluationResult {
  triggered: boolean;
  currentValue: number;
}

export interface AlertProcessingResult {
  ticker: string;
  processed: number;
  triggered: number;
  skipped: number;
  failed: number;
}

export interface AlertMarketData {
  ticker: string;
  price: number;
  changePercent: number | null;
}

export interface CheckAlertsResult {
  checked: number;
  triggered: number;
}

// ========================================
// EVALUATE ALERT
// ========================================

export function evaluateAlert(
  alert: Alert,
  currentValue: number
): AlertEvaluationResult {
  if (!Number.isFinite(currentValue)) {
    throw new Error(
      "Current value must be a valid number"
    );
  }

  if (
    !alert.is_active ||
    alert.is_triggered
  ) {
    return {
      triggered: false,
      currentValue,
    };
  }

  let triggered = false;

  switch (alert.alert_type) {
    case "PRICE_ABOVE":
      triggered =
        currentValue >=
        alert.target_value;
      break;

    case "PRICE_BELOW":
      triggered =
        currentValue <=
        alert.target_value;
      break;

    case "PERCENT_CHANGE":
      triggered =
        Math.abs(currentValue) >=
        Math.abs(alert.target_value);
      break;

    default:
      throw new Error(
        `Unsupported alert type: ${alert.alert_type}`
      );
  }

  return {
    triggered,
    currentValue,
  };
}

// ========================================
// CHECK ALERTS FOR USER + TICKER
// ========================================
//
// Used by:
// POST /api/alerts/trigger
//
// The stock quote is already fetched by
// the API route, so this function does NOT
// fetch market data again.
//
// ========================================

export async function checkAlertsForTicker(
  userId: string,
  marketData: AlertMarketData
): Promise<CheckAlertsResult> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  const normalizedTicker =
    marketData.ticker
      .trim()
      .toUpperCase();

  if (!normalizedTicker) {
    throw new Error(
      "Ticker is required"
    );
  }

  if (
    !Number.isFinite(
      marketData.price
    )
  ) {
    throw new Error(
      "Current stock price is invalid"
    );
  }

  // ======================================
  // 1. GET ACTIVE ALERTS
  // ======================================

  const alerts =
    await alertRepository.getActiveAlertsByTicker(
      normalizedTicker
    );

  /*
   * The repository currently returns
   * active alerts for the ticker.
   *
   * Filter by authenticated user here
   * so another user's alerts can never
   * be triggered.
   */

  const userAlerts =
    alerts.filter(
      (alert) =>
        alert.user_id === userId
    );

  if (
    userAlerts.length === 0
  ) {
    return {
      checked: 0,
      triggered: 0,
    };
  }

  // ======================================
  // 2. PROCESS ALERTS
  // ======================================

  let triggered = 0;

  await Promise.all(
    userAlerts.map(
      async (alert) => {
        let currentValue:
          | number
          | null;

        switch (
          alert.alert_type
        ) {
          case "PRICE_ABOVE":
          case "PRICE_BELOW":
            currentValue =
              marketData.price;
            break;

          case "PERCENT_CHANGE":
            currentValue =
              marketData.changePercent;
            break;

          default:
            return;
        }

        if (
          currentValue === null ||
          !Number.isFinite(
            currentValue
          )
        ) {
          return;
        }

        // ==================================
        // 3. EVALUATE CONDITION
        // ==================================

        const evaluation =
          evaluateAlert(
            alert,
            currentValue
          );

        if (
          !evaluation.triggered
        ) {
          return;
        }

        // ==================================
        // 4. TRIGGER ALERT
        // ==================================

        /*
         * The repository method updates
         * only an alert that is still:
         *
         * is_active = true
         * is_triggered = false
         *
         * This protects against duplicate
         * triggers when two requests arrive
         * at almost the same time.
         */

        const updated =
          await alertRepository.updateAlertTriggerState(
            userId,
            alert.id,
            currentValue
          );

        /*
         * updateAlertTriggerState()
         * returns null when another request
         * already triggered this alert.
         */

        if (updated) {
          triggered++;

          console.log(
            "[Alert Triggered]",
            {
              alertId:
                alert.id,

              userId,

              ticker:
                normalizedTicker,

              alertType:
                alert.alert_type,

              targetValue:
                alert.target_value,

              currentValue,
            }
          );
        }
      }
    )
  );

  return {
    checked:
      userAlerts.length,

    triggered,
  };
}

// ========================================
// PROCESS ALERTS FOR ONE TICKER
// ========================================
//
// Optional background/server-side helper.
//
// This function fetches the quote itself.
// The API route above should use
// checkAlertsForTicker() when it already
// has the quote.
//
// ========================================

export async function processTickerAlerts(
  ticker: string
): Promise<AlertProcessingResult> {
  const normalizedTicker =
    ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error(
      "Ticker is required"
    );
  }

  // ======================================
  // 1. FETCH ACTIVE ALERTS
  // ======================================

  const alerts =
    await alertRepository.getActiveAlertsByTicker(
      normalizedTicker
    );

  if (
    alerts.length === 0
  ) {
    return {
      ticker: normalizedTicker,
      processed: 0,
      triggered: 0,
      skipped: 0,
      failed: 0,
    };
  }

  // ======================================
  // 2. FETCH QUOTE ONCE
  // ======================================

  const quote =
    await getStockQuote(
      normalizedTicker
    );

  if (!quote) {
    return {
      ticker: normalizedTicker,
      processed: alerts.length,
      triggered: 0,
      skipped: alerts.length,
      failed: 0,
    };
  }

  // ======================================
  // 3. PROCESS ALERTS
  // ======================================

  let triggered = 0;
  let skipped = 0;
  let failed = 0;

  const results =
    await Promise.allSettled(
      alerts.map(
        async (alert) => {
          let currentValue:
            | number
            | null;

          switch (
            alert.alert_type
          ) {
            case "PRICE_ABOVE":
            case "PRICE_BELOW":
              currentValue =
                Number(
                  quote.price
                );
              break;

            case "PERCENT_CHANGE":
              currentValue =
                quote.changePercent !==
                null &&
                quote.changePercent !==
                undefined
                  ? Number(
                      quote.changePercent
                    )
                  : null;
              break;

            default:
              skipped++;
              return;
          }

          if (
            currentValue === null ||
            !Number.isFinite(
              currentValue
            )
          ) {
            skipped++;
            return;
          }

          // ==================================
          // EVALUATE
          // ==================================

          const evaluation =
            evaluateAlert(
              alert,
              currentValue
            );

          if (
            !evaluation.triggered
          ) {
            skipped++;
            return;
          }

          // ==================================
          // TRIGGER
          // ==================================

          const updated =
            await alertRepository.updateAlertTriggerState(
              alert.user_id,
              alert.id,
              currentValue
            );

          /*
           * null means another concurrent
           * request already triggered it.
           */

          if (!updated) {
            skipped++;
            return;
          }

          triggered++;

          console.log(
            "[Alert Triggered]",
            {
              alertId:
                alert.id,

              ticker:
                normalizedTicker,

              alertType:
                alert.alert_type,

              targetValue:
                alert.target_value,

              currentValue,
            }
          );
        }
      )
    );

  // ======================================
  // 4. COUNT FAILURES
  // ======================================

  for (
    const result of results
  ) {
    if (
      result.status ===
      "rejected"
    ) {
      failed++;

      console.error(
        "[Alert Trigger Engine] Failed:",
        result.reason
      );
    }
  }

  // ======================================
  // 5. RETURN RESULT
  // ======================================

  return {
    ticker:
      normalizedTicker,

    processed:
      alerts.length,

    triggered,

    skipped,

    failed,
  };
}