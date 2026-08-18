import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

import {
  SupabaseAlertRepository,
} from "../../../../lib/repositories/alerts/supabase-alert.repository";

import {
  processTickerAlerts,
} from "../../../../lib/services/alert-trigger.service";

/*
 * ============================================================
 * POST /api/alerts/process
 * ============================================================
 *
 * Purpose:
 * - Authenticate the current user
 * - Get the user's active alerts
 * - Group alerts by unique ticker
 * - Fetch/process each ticker only once
 * - Trigger matching alerts
 * - Return a complete processing summary
 *
 * IMPORTANT:
 * This route processes alerts for the authenticated user only.
 *
 * ============================================================
 */

export async function POST() {
  try {
    /*
     * ========================================================
     * 1. AUTHENTICATION
     * ========================================================
     */

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ========================================================
     * 2. GET USER ALERTS
     * ========================================================
     *
     * We fetch the user's alerts once.
     *
     * The repository handles the Supabase query.
     */

    const alertRepository =
      new SupabaseAlertRepository();

    const alerts =
      await alertRepository.getAlerts(user.id);

    /*
     * ========================================================
     * 3. FILTER PROCESSABLE ALERTS
     * ========================================================
     *
     * Only alerts that are:
     *
     * is_active = true
     * is_triggered = false
     *
     * need to be checked.
     *
     * Triggered alerts do not need to be checked again.
     */

    const activeAlerts = alerts.filter(
      (alert) =>
        alert.is_active &&
        !alert.is_triggered
    );

    /*
     * ========================================================
     * 4. GET UNIQUE TICKERS
     * ========================================================
     *
     * Example:
     *
     * RELIANCE.NS price alert
     * RELIANCE.NS percentage alert
     * TCS.NS price alert
     *
     * becomes:
     *
     * RELIANCE.NS
     * TCS.NS
     *
     * Therefore RELIANCE.NS is fetched only once.
     */

    const tickers = [
      ...new Set(
        activeAlerts
          .map((alert) =>
            alert.ticker
              .trim()
              .toUpperCase()
          )
          .filter(Boolean)
      ),
    ];

    /*
     * ========================================================
     * 5. NOTHING TO PROCESS
     * ========================================================
     */

    if (tickers.length === 0) {
      return NextResponse.json(
        {
          success: true,

          processed: 0,

          triggered: 0,

          skipped: 0,

          failed: 0,

          tickers: [],
        },
        {
          status: 200,
        }
      );
    }

    /*
     * ========================================================
     * 6. PROCESS UNIQUE TICKERS
     * ========================================================
     *
     * processTickerAlerts():
     *
     * 1. Gets active alerts for the ticker
     * 2. Fetches the stock quote once
     * 3. Evaluates all alerts for that ticker
     * 4. Triggers matching alerts
     *
     * Promise.allSettled() is intentionally used so that
     * failure of one ticker does not stop processing of
     * the remaining tickers.
     */

    const results =
      await Promise.allSettled(
        tickers.map((ticker) =>
          processTickerAlerts(ticker)
        )
      );

    /*
     * ========================================================
     * 7. AGGREGATE RESULTS
     * ========================================================
     */

    let processed = 0;
    let triggered = 0;
    let skipped = 0;
    let failed = 0;

    const tickerResults: Array<{
      ticker: string;
      processed: number;
      triggered: number;
      skipped: number;
      failed: number;
    }> = [];

    /*
     * ========================================================
     * 8. HANDLE EACH TICKER RESULT
     * ========================================================
     */

    for (
      let index = 0;
      index < results.length;
      index++
    ) {
      const result = results[index];

      const ticker = tickers[index];

      /*
       * ------------------------------------------------------
       * SUCCESSFUL TICKER
       * ------------------------------------------------------
       */

      if (
        result.status === "fulfilled"
      ) {
        const tickerResult =
          result.value;

        processed +=
          tickerResult.processed;

        triggered +=
          tickerResult.triggered;

        skipped +=
          tickerResult.skipped;

        failed +=
          tickerResult.failed;

        tickerResults.push(
          tickerResult
        );

        continue;
      }

      /*
       * ------------------------------------------------------
       * FAILED TICKER
       * ------------------------------------------------------
       *
       * One ticker failing should not break the entire
       * alert-processing operation.
       */

      failed++;

      console.error(
        "[Alert Process] Failed ticker:",
        {
          ticker,
          error: result.reason,
        }
      );

      tickerResults.push({
        ticker,
        processed: 0,
        triggered: 0,
        skipped: 0,
        failed: 1,
      });
    }

    /*
     * ========================================================
     * 9. RESPONSE
     * ========================================================
     */

    return NextResponse.json(
      {
        success: true,

        processed,

        triggered,

        skipped,

        failed,

        tickers: tickerResults,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    /*
     * ========================================================
     * GLOBAL ERROR HANDLER
     * ========================================================
     */

    console.error(
      "POST /api/alerts/process error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to process alerts",
      },
      {
        status: 500,
      }
    );
  }
}