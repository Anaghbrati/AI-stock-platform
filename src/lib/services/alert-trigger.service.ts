import { SupabaseAlertRepository } from "../repositories/alerts/supabase-alert.repository";
import { getStockQuote } from "./stock.service";
import type { Alert } from "../../types/alert";

const alertRepository = new SupabaseAlertRepository();

export interface AlertEvaluationResult {
  triggered: boolean;
  currentValue: number;
}

export interface AlertProcessingResult {
  processed: number;
  triggered: number;
  skipped: number;
  failed: number;
  durationMs: number;
}

/**
 * Pure O(1) alert-condition evaluation.
 */
export function evaluateAlert(
  alert: Alert,
  currentValue: number
): AlertEvaluationResult {
  if (!Number.isFinite(currentValue)) {
    throw new Error("Current value must be a valid number");
  }

  if (!alert.is_active || alert.is_triggered) {
    return { triggered: false, currentValue };
  }

  switch (alert.alert_type) {
    case "PRICE_ABOVE":
      return {
        triggered: currentValue >= alert.target_value,
        currentValue,
      };

    case "PRICE_BELOW":
      return {
        triggered: currentValue <= alert.target_value,
        currentValue,
      };

    case "PERCENT_CHANGE":
      return {
        triggered: Math.abs(currentValue) >= Math.abs(alert.target_value),
        currentValue,
      };

    default:
      throw new Error(`Unsupported alert type: ${alert.alert_type}`);
  }
}

/**
 * Marks an alert as triggered.
 * The repository performs an atomic is_active/is_triggered check,
 * so concurrent cron executions cannot trigger the same alert twice.
 */
export async function processAlert(
  alert: Alert,
  currentValue: number
): Promise<Alert> {
  const evaluation = evaluateAlert(alert, currentValue);

  if (!evaluation.triggered) {
    return alert;
  }

  return alertRepository.updateAlertTriggerState(
    alert.user_id,
    alert.id,
    currentValue
  );
}

/**
 * Poll all active alerts.
 *
 * Performance design:
 * - DB returns only active/untriggered alerts.
 * - Unique tickers are fetched once, even when many users have
 *   alerts for the same stock.
 * - Quote requests run in parallel.
 * - Database writes happen only for alerts that actually trigger.
 *
 * Evaluation work: O(A + T), where A = active alerts and
 * T = unique tickers. Network quote requests: O(T), not O(A).
 */
export async function runAlertTriggerEngine(): Promise<AlertProcessingResult> {
  const startedAt = performance.now();
  const alerts = await alertRepository.getActiveAlerts();

  if (alerts.length === 0) {
    return {
      processed: 0,
      triggered: 0,
      skipped: 0,
      failed: 0,
      durationMs: Math.round(performance.now() - startedAt),
    };
  }

  const tickerSet = new Set<string>();
  for (const alert of alerts) {
    tickerSet.add(alert.ticker.trim().toUpperCase());
  }

  const tickers = [...tickerSet];

  const quoteResults = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        return {
          ticker,
          quote: await getStockQuote(ticker),
        };
      } catch (error) {
        console.error(`[AlertEngine] Quote failed for ${ticker}:`, error);
        return { ticker, quote: null };
      }
    })
  );

  const quoteMap = new Map(
    quoteResults.map(({ ticker, quote }) => [ticker, quote])
  );

  let triggered = 0;
  let skipped = 0;
  let failed = 0;

  const jobs = alerts.map(async (alert) => {
    const ticker = alert.ticker.trim().toUpperCase();
    const quote = quoteMap.get(ticker);

    if (!quote) {
      skipped++;
      return;
    }

    const currentValue =
      alert.alert_type === "PERCENT_CHANGE"
        ? quote.changePercent
        : quote.price;

    if (
      typeof currentValue !== "number" ||
      !Number.isFinite(currentValue)
    ) {
      skipped++;
      return;
    }

    const evaluation = evaluateAlert(alert, currentValue);

    if (!evaluation.triggered) {
      skipped++;
      return;
    }

    try {
      await processAlert(alert, currentValue);
      triggered++;
    } catch (error) {
      failed++;
      console.error(
        `[AlertEngine] Failed to trigger alert ${alert.id}:`,
        error
      );
    }
  });

  await Promise.all(jobs);

  const durationMs = Math.round(performance.now() - startedAt);

  console.log("[AlertEngine] completed", {
    processed: alerts.length,
    uniqueTickers: tickers.length,
    triggered,
    skipped,
    failed,
    durationMs,
  });

  return {
    processed: alerts.length,
    triggered,
    skipped,
    failed,
    durationMs,
  };
}

/**
 * Backwards-compatible user-scoped entry point for callers that already
 * have a user ID. It intentionally delegates to the same O(A + T) engine.
 */
export async function processUserAlerts(
  userId: string
): Promise<AlertProcessingResult> {
  if (!userId) {
    throw new Error("Authenticated user is required");
  }

  const alerts = await alertRepository.getAlerts(userId);
  const activeAlerts = alerts.filter(
    (alert) => alert.is_active && !alert.is_triggered
  );

  if (activeAlerts.length === 0) {
    return {
      processed: 0,
      triggered: 0,
      skipped: 0,
      failed: 0,
      durationMs: 0,
    };
  }

  const tickerSet = new Set(
    activeAlerts.map((alert) => alert.ticker.trim().toUpperCase())
  );

  const quoteResults = await Promise.all(
    [...tickerSet].map(async (ticker) => ({
      ticker,
      quote: await getStockQuote(ticker).catch((error) => {
        console.error(`[AlertEngine] Quote failed for ${ticker}:`, error);
        return null;
      }),
    }))
  );

  const quoteMap = new Map(
    quoteResults.map(({ ticker, quote }) => [ticker, quote])
  );

  let triggered = 0;
  let skipped = 0;
  let failed = 0;

  await Promise.all(
    activeAlerts.map(async (alert) => {
      const quote = quoteMap.get(alert.ticker.trim().toUpperCase());
      const currentValue =
        alert.alert_type === "PERCENT_CHANGE"
          ? quote?.changePercent
          : quote?.price;

      if (typeof currentValue !== "number" || !Number.isFinite(currentValue)) {
        skipped++;
        return;
      }

      if (!evaluateAlert(alert, currentValue).triggered) {
        skipped++;
        return;
      }

      try {
        await processAlert(alert, currentValue);
        triggered++;
      } catch (error) {
        failed++;
        console.error(`[AlertEngine] Failed to trigger ${alert.id}:`, error);
      }
    })
  );

  return {
    processed: activeAlerts.length,
    triggered,
    skipped,
    failed,
    durationMs: 0,
  };
}
