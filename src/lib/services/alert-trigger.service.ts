import {
  SupabaseAlertRepository,
} from "../repositories/alerts/supabase-alert.repository";

import {
  getAlerts,
} from "./alert.service";

import {
  getStockQuote,
} from "./stock.service";

import type {
  Alert,
} from "../../types/alert";

const alertRepository =
  new SupabaseAlertRepository();

// =========================================================
// TYPES
// =========================================================

export interface AlertEvaluationResult {
  triggered: boolean;
  currentValue: number;
}

export interface AlertProcessingResult {
  processed: number;
  triggered: number;
  skipped: number;
  failed: number;
}

// =========================================================
// EVALUATE ALERT
// =========================================================

export function evaluateAlert(
  alert: Alert,
  currentValue: number
): AlertEvaluationResult {
  if (!Number.isFinite(currentValue)) {
    throw new Error(
      "Current value must be a valid number"
    );
  }

  // Ignore inactive or already-triggered alerts.
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

// =========================================================
// PROCESS SINGLE ALERT
// =========================================================

export async function processAlert(
  alert: Alert,
  currentValue: number
): Promise<Alert> {
  const evaluation =
    evaluateAlert(
      alert,
      currentValue
    );

  if (!evaluation.triggered) {
    return alert;
  }

  console.log(
    "[Alert Triggered]",
    {
      alertId: alert.id,
      ticker: alert.ticker,
      alertType: alert.alert_type,
      targetValue:
        alert.target_value,
      currentValue,
    }
  );

  return alertRepository.updateAlertTriggerState(
    alert.user_id,
    alert.id,
    currentValue
  );
}

// =========================================================
// PROCESS USER ALERTS
// =========================================================

export async function processUserAlerts(
  userId: string
): Promise<AlertProcessingResult> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  const alerts =
    await getAlerts(userId);

  // Only active and untriggered alerts need processing.
  const activeAlerts =
    alerts.filter(
      (alert) =>
        alert.is_active &&
        !alert.is_triggered
    );

  if (activeAlerts.length === 0) {
    return {
      processed: 0,
      triggered: 0,
      skipped: 0,
      failed: 0,
    };
  }

  // =======================================================
  // DEDUPLICATE TICKERS
  // =======================================================

  const tickers = [
    ...new Set(
      activeAlerts.map(
        (alert) =>
          alert.ticker
            .trim()
            .toUpperCase()
      )
    ),
  ];

  // =======================================================
  // FETCH QUOTES IN PARALLEL
  // =======================================================

  const quoteResults =
    await Promise.all(
      tickers.map(
        async (ticker) => {
          try {
            const quote =
              await getStockQuote(
                ticker
              );

            return {
              ticker,
              quote,
            };
          } catch (error) {
            console.error(
              `[Alert] Quote failed for ${ticker}:`,
              error
            );

            return {
              ticker,
              quote: null,
            };
          }
        }
      )
    );

  const quoteMap =
    new Map(
      quoteResults.map(
        ({
          ticker,
          quote,
        }) => [
          ticker,
          quote,
        ]
      )
    );

  let triggered = 0;
  let skipped = 0;
  let failed = 0;

  // =======================================================
  // PROCESS ALERTS
  // =======================================================

  const results =
    await Promise.allSettled(
      activeAlerts.map(
        async (alert) => {
          const ticker =
            alert.ticker
              .trim()
              .toUpperCase();

          const quote =
            quoteMap.get(
              ticker
            );

          if (!quote) {
            skipped++;
            return;
          }

          let currentValue:
            | number
            | null = null;

          // =================================================
          // PRICE ALERT
          // =================================================

          switch (
            alert.alert_type
          ) {
            case "PRICE_ABOVE":
            case "PRICE_BELOW":
              if (
                quote.price ===
                undefined
              ) {
                skipped++;
                return;
              }

              currentValue =
                Number(
                  quote.price
                );

              break;

            // ===============================================
            // PERCENT CHANGE ALERT
            // ===============================================

            case "PERCENT_CHANGE":
              if (
                quote.changePercent ===
                undefined
              ) {
                skipped++;
                return;
              }

              currentValue =
                Number(
                  quote.changePercent
                );

              break;

            default:
              skipped++;
              return;
          }

          // =================================================
          // VALIDATE CURRENT VALUE
          // =================================================

          if (
            currentValue ===
              null ||
            !Number.isFinite(
              currentValue
            )
          ) {
            skipped++;
            return;
          }

          // =================================================
          // CHECK CONDITION
          // =================================================

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

          // =================================================
          // UPDATE DATABASE
          // =================================================

          await processAlert(
            alert,
            currentValue
          );

          triggered++;
        }
      )
    );

  // =======================================================
  // COUNT FAILED ALERTS
  // =======================================================

  for (const result of results) {
    if (
      result.status ===
      "rejected"
    ) {
      failed++;

      console.error(
        "[Alert] Failed to process alert:",
        result.reason
      );
    }
  }

  return {
    processed:
      activeAlerts.length,

    triggered,

    skipped,

    failed,
  };
}
