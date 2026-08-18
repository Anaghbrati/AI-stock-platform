import {
  SupabaseAlertRepository,
} from "../repositories/alerts/supabase-alert.repository";

import {
  getStockQuote,
} from "./stock.service";

import type {
  Alert,
} from "../../types/alert";

/*
 * ============================================================
 * ALERT REPOSITORY
 * ============================================================
 */

const alertRepository =
  new SupabaseAlertRepository();

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

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

/*
 * ============================================================
 * EVALUATE ALERT
 * ============================================================
 *
 * Pure function.
 *
 * It does not:
 * - call Supabase
 * - call Yahoo
 * - make API requests
 *
 * It only determines whether the alert condition
 * has been reached.
 */

export function evaluateAlert(
  alert: Alert,
  currentValue: number
): AlertEvaluationResult {
  if (!Number.isFinite(currentValue)) {
    throw new Error(
      "Current value must be a valid number"
    );
  }

  /*
   * Already inactive or already triggered alerts
   * should never trigger again.
   */

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
    /*
     * PRICE ABOVE
     */

    case "PRICE_ABOVE":
      triggered =
        currentValue >=
        Number(alert.target_value);
      break;

    /*
     * PRICE BELOW
     */

    case "PRICE_BELOW":
      triggered =
        currentValue <=
        Number(alert.target_value);
      break;

    /*
     * PERCENT CHANGE
     *
     * Absolute comparison means:
     *
     * target +5%
     * triggers at +5% or higher
     *
     * target -5%
     * triggers at -5% or lower
     */

    case "PERCENT_CHANGE":
      triggered =
        Math.abs(currentValue) >=
        Math.abs(
          Number(alert.target_value)
        );
      break;

    /*
     * UNKNOWN TYPE
     */

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

/*
 * ============================================================
 * CHECK ALERTS FOR USER + TICKER
 * ============================================================
 *
 * Used when the caller already has market data.
 *
 * Example:
 *
 * POST /api/alerts/check
 *
 * The API route fetches:
 *
 * quote
 *   ↓
 * checkAlertsForTicker()
 *
 * Therefore this function does NOT fetch the quote again.
 *
 * ============================================================
 */

export async function checkAlertsForTicker(
  userId: string,
  marketData: AlertMarketData
): Promise<CheckAlertsResult> {
  /*
   * Validate user
   */

  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  /*
   * Normalize ticker
   */

  const normalizedTicker =
    marketData.ticker
      .trim()
      .toUpperCase();

  if (!normalizedTicker) {
    throw new Error(
      "Ticker is required"
    );
  }

  /*
   * Validate price
   */

  if (
    !Number.isFinite(
      marketData.price
    )
  ) {
    throw new Error(
      "Current stock price is invalid"
    );
  }

  /*
   * ==========================================================
   * GET ACTIVE ALERTS
   * ==========================================================
   */

  const alerts =
    await alertRepository.getActiveAlertsByTicker(
      normalizedTicker
    );

  /*
   * ==========================================================
   * SECURITY FILTER
   * ==========================================================
   *
   * Repository returns alerts for the ticker.
   *
   * We additionally filter by authenticated user.
   *
   * This ensures that one user cannot trigger
   * another user's alerts.
   */

  const userAlerts =
    alerts.filter(
      (alert) =>
        alert.user_id === userId
    );

  /*
   * Nothing to process.
   */

  if (
    userAlerts.length === 0
  ) {
    return {
      checked: 0,
      triggered: 0,
    };
  }

  /*
   * ==========================================================
   * PROCESS ALERTS
   * ==========================================================
   */

  let triggered = 0;

  /*
   * Process independent alerts in parallel.
   */

  await Promise.all(
    userAlerts.map(
      async (alert) => {
        let currentValue:
          | number
          | null;

        /*
         * Determine which market value
         * this alert needs.
         */

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

        /*
         * Ignore unavailable market data.
         */

        if (
          currentValue === null ||
          !Number.isFinite(
            currentValue
          )
        ) {
          return;
        }

        /*
         * ======================================================
         * EVALUATE
         * ======================================================
         */

        const evaluation =
          evaluateAlert(
            alert,
            currentValue
          );

        /*
         * Condition not reached.
         */

        if (
          !evaluation.triggered
        ) {
          return;
        }

        /*
         * ======================================================
         * TRIGGER ALERT
         * ======================================================
         *
         * The repository should update only an alert
         * that is still active and untriggered.
         *
         * This protects against duplicate triggers.
         */

        const updated =
          await alertRepository.updateAlertTriggerState(
            userId,
            alert.id,
            currentValue
          );

        /*
         * null means another request already triggered
         * the alert.
         */

        if (!updated) {
          return;
        }

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
    )
  );

  return {
    checked:
      userAlerts.length,

    triggered,
  };
}

/*
 * ============================================================
 * PROCESS ALERTS FOR ONE TICKER
 * ============================================================
 *
 * This function is used by:
 *
 * POST /api/alerts/process
 *
 * Unlike checkAlertsForTicker(), this function:
 *
 * 1. Finds active alerts
 * 2. Fetches the stock quote
 * 3. Evaluates all alerts
 * 4. Triggers matching alerts
 *
 * IMPORTANT:
 *
 * The quote is fetched ONCE per ticker.
 *
 * If a user has:
 *
 * RELIANCE.NS PRICE_ABOVE
 * RELIANCE.NS PRICE_BELOW
 * RELIANCE.NS PERCENT_CHANGE
 *
 * we do NOT fetch RELIANCE.NS three times.
 *
 * ============================================================
 */

export async function processTickerAlerts(
  ticker: string
): Promise<AlertProcessingResult> {
  /*
   * ==========================================================
   * 1. NORMALIZE TICKER
   * ==========================================================
   */

  const normalizedTicker =
    ticker
      .trim()
      .toUpperCase();

  if (!normalizedTicker) {
    throw new Error(
      "Ticker is required"
    );
  }

  /*
   * ==========================================================
   * 2. GET ACTIVE ALERTS
   * ==========================================================
   */

  const alerts =
    await alertRepository.getActiveAlertsByTicker(
      normalizedTicker
    );

  /*
   * No active alerts.
   */

  if (
    alerts.length === 0
  ) {
    return {
      ticker:
        normalizedTicker,

      processed: 0,

      triggered: 0,

      skipped: 0,

      failed: 0,
    };
  }

  /*
   * ==========================================================
   * 3. FETCH STOCK QUOTE ONCE
   * ==========================================================
   *
   * This is the important optimization.
   *
   * One ticker
   *     ↓
   * one stock request
   *     ↓
   * multiple alert evaluations
   */

  const quote =
    await getStockQuote(
      normalizedTicker
    );

  /*
   * Quote unavailable.
   *
   * The alerts were found, but we could not evaluate them.
   */

  if (!quote) {
    return {
      ticker:
        normalizedTicker,

      processed:
        alerts.length,

      triggered: 0,

      skipped:
        alerts.length,

      failed: 0,
    };
  }

  /*
   * ==========================================================
   * 4. VALIDATE PRICE
   * ==========================================================
   */

  const price =
    Number(quote.price);

  if (
    !Number.isFinite(price)
  ) {
    return {
      ticker:
        normalizedTicker,

      processed:
        alerts.length,

      triggered: 0,

      skipped:
        alerts.length,

      failed: 1,
    };
  }

  /*
   * Normalize percentage change.
   */

  const changePercent =
    quote.changePercent !==
      null &&
    quote.changePercent !==
      undefined
      ? Number(
          quote.changePercent
        )
      : null;

  /*
   * ==========================================================
   * 5. PROCESS ALERTS
   * ==========================================================
   */

  let triggered = 0;
  let skipped = 0;
  let failed = 0;

  /*
   * Each alert is independent.
   *
   * Promise.allSettled() means one failed alert
   * does not stop the other alerts.
   */

  const results =
    await Promise.allSettled(
      alerts.map(
        async (alert) => {
          /*
           * ================================================
           * DETERMINE CURRENT VALUE
           * ================================================
           */

          let currentValue:
            | number
            | null;

          switch (
            alert.alert_type
          ) {
            case "PRICE_ABOVE":
            case "PRICE_BELOW":
              currentValue =
                price;
              break;

            case "PERCENT_CHANGE":
              currentValue =
                changePercent;
              break;

            default:
              skipped++;
              return;
          }

          /*
           * ================================================
           * INVALID / UNAVAILABLE DATA
           * ================================================
           */

          if (
            currentValue === null ||
            !Number.isFinite(
              currentValue
            )
          ) {
            skipped++;
            return;
          }

          /*
           * ================================================
           * EVALUATE CONDITION
           * ================================================
           */

          const evaluation =
            evaluateAlert(
              alert,
              currentValue
            );

          /*
           * Condition has not been reached.
           */

          if (
            !evaluation.triggered
          ) {
            skipped++;
            return;
          }

          /*
           * ================================================
           * TRIGGER ALERT
           * ================================================
           */

          const updated =
            await alertRepository.updateAlertTriggerState(
              alert.user_id,
              alert.id,
              currentValue
            );

          /*
           * If null is returned, another request
           * already triggered this alert.
           */

          if (!updated) {
            skipped++;
            return;
          }

          /*
           * Successfully triggered.
           */

          triggered++;

          console.log(
            "[Alert Triggered]",
            {
              alertId:
                alert.id,

              userId:
                alert.user_id,

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

  /*
   * ==========================================================
   * 6. COUNT FAILED ALERTS
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * 7. RETURN RESULT
   * ==========================================================
   */

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