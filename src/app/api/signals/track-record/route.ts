import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

const SIGNAL_TYPE = "RSI_RECOVERY";
const MIN_MEANINGFUL_LIVE_SIGNALS = 20;
const HORIZONS = [5, 10, 20] as const;

type Horizon = (typeof HORIZONS)[number];

type BacktestRow = {
  horizon_days: number;
  instance_count: number;
  pct_followed_through: number | null;
  avg_pct_change: number | null;
  universe_description: string | null;
  computed_at: string;
};

type SignalRow = {
  id: string;
  symbol: string;
  detected_at: string;
  price_at_detection: number;
};

type OutcomeRow = {
  signal_log_id: string;
  horizon_days: number;
  pct_change: number;
  followed_through: boolean;
};

function buildLiveStats(
  outcomes: OutcomeRow[],
  horizon: Horizon
) {
  const horizonOutcomes = outcomes.filter(
    (outcome) => outcome.horizon_days === horizon
  );

  const instanceCount = horizonOutcomes.length;

  if (instanceCount === 0) {
    return {
      horizonDays: horizon,
      instances: 0,
      followThroughRate: null,
      averageReturn: null,
      status: "insufficient_data",
      message: "No completed outcomes yet.",
    };
  }

  const followedThroughCount =
    horizonOutcomes.filter(
      (outcome) => outcome.followed_through
    ).length;

  const averageReturn =
    horizonOutcomes.reduce(
      (sum, outcome) => sum + Number(outcome.pct_change),
      0
    ) / instanceCount;

  const followThroughRate =
    (followedThroughCount / instanceCount) * 100;

  const isMeaningful =
    instanceCount >= MIN_MEANINGFUL_LIVE_SIGNALS;

  return {
    horizonDays: horizon,
    instances: instanceCount,
    followThroughRate: isMeaningful
      ? Number(followThroughRate.toFixed(2))
      : null,
    averageReturn: Number(averageReturn.toFixed(4)),
    status: isMeaningful
      ? "meaningful"
      : "insufficient_data",
    message: isMeaningful
      ? null
      : "Too early for a meaningful rate.",
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [
      backtestResult,
      signalResult,
      outcomeResult,
    ] = await Promise.all([
      supabase
        .from("backtest_results")
        .select(
          `
          horizon_days,
          instance_count,
          pct_followed_through,
          avg_pct_change,
          universe_description,
          computed_at
        `
        )
        .eq("signal_type", SIGNAL_TYPE)
        .order("horizon_days", {
          ascending: true,
        }),

      supabase
        .from("signal_log")
        .select(
          `
          id,
          symbol,
          detected_at,
          price_at_detection
        `
        )
        .eq("signal_type", SIGNAL_TYPE)
        .order("detected_at", {
          ascending: false,
        }),

      supabase
        .from("signal_outcomes")
        .select(
          `
          signal_log_id,
          horizon_days,
          pct_change,
          followed_through
        `
        ),
    ]);

    if (backtestResult.error) {
      throw new Error(
        `Failed to load backtest results: ${backtestResult.error.message}`
      );
    }

    if (signalResult.error) {
      throw new Error(
        `Failed to load signal log: ${signalResult.error.message}`
      );
    }

    if (outcomeResult.error) {
      throw new Error(
        `Failed to load signal outcomes: ${outcomeResult.error.message}`
      );
    }

    const backtest =
      (backtestResult.data ?? []) as BacktestRow[];

    const signals =
      (signalResult.data ?? []) as SignalRow[];

    const outcomes =
      (outcomeResult.data ?? []) as OutcomeRow[];

    /*
     * ---------------------------------------------------------
     * LIVE STATISTICS
     * ---------------------------------------------------------
     */

    const liveStats = HORIZONS.map((horizon) =>
      buildLiveStats(outcomes, horizon)
    );

    const liveSignals = signals.length;

    const completedOutcomes = {
      fiveDay: outcomes.filter(
        (outcome) => outcome.horizon_days === 5
      ).length,

      tenDay: outcomes.filter(
        (outcome) => outcome.horizon_days === 10
      ).length,

      twentyDay: outcomes.filter(
        (outcome) => outcome.horizon_days === 20
      ).length,
    };

    /*
     * ---------------------------------------------------------
     * TODAY'S SIGNALS
     * ---------------------------------------------------------
     */

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const todaySignals = signals
      .filter((signal) => signal.detected_at === today)
      .map((signal) => ({
        id: signal.id,
        symbol: signal.symbol,
        detectedAt: signal.detected_at,
        priceAtDetection: Number(
          signal.price_at_detection
        ),
      }));

    /*
     * ---------------------------------------------------------
     * RECENT SIGNALS
     *
     * Exclude today's signals because those are displayed
     * separately in the "Today's Signals" section.
     * ---------------------------------------------------------
     */

    const recentSignals = signals
      .filter((signal) => signal.detected_at !== today)
      .slice(0, 20)
      .map((signal) => {
        const signalOutcomes = outcomes.filter(
          (outcome) =>
            outcome.signal_log_id === signal.id
        );

        const outcomeByHorizon = new Map(
          signalOutcomes.map((outcome) => [
            outcome.horizon_days,
            outcome,
          ])
        );

        return {
          id: signal.id,
          symbol: signal.symbol,
          detectedAt: signal.detected_at,
          priceAtDetection: Number(
            signal.price_at_detection
          ),

          outcomes: HORIZONS.map((horizon) => {
            const outcome =
              outcomeByHorizon.get(horizon);

            if (!outcome) {
              return {
                horizonDays: horizon,
                status: "pending",
                pctChange: null,
                followedThrough: null,
              };
            }

            return {
              horizonDays: horizon,
              status: "completed",
              pctChange: Number(
                Number(outcome.pct_change).toFixed(2)
              ),
              followedThrough:
                outcome.followed_through,
            };
          }),
        };
      });

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      signal: {
        type: SIGNAL_TYPE,
        name: "RSI Recovery",
        description:
          "RSI crosses above 30 after previously being below 30.",
      },

      backtest: {
        available: backtest.length > 0,

        universe:
          backtest[0]?.universe_description ?? null,

        computedAt:
          backtest[0]?.computed_at ?? null,

        horizons: backtest.map((row) => ({
          horizonDays: row.horizon_days,

          instances: row.instance_count,

          followThroughRate:
            row.pct_followed_through === null
              ? null
              : Number(
                  row.pct_followed_through
                ),

          averageReturn:
            row.avg_pct_change === null
              ? null
              : Number(row.avg_pct_change),
        })),
      },

      live: {
        totalSignals: liveSignals,

        meaningfulSample:
          liveSignals >=
          MIN_MEANINGFUL_LIVE_SIGNALS,

        minimumMeaningfulSignals:
          MIN_MEANINGFUL_LIVE_SIGNALS,

        message:
          liveSignals >=
          MIN_MEANINGFUL_LIVE_SIGNALS
            ? null
            : "Too early for a meaningful rate.",

        completedOutcomes,

        horizons: liveStats,

        todaySignals,

        recentSignals,
      },
    });
  } catch (error) {
    console.error(
      "[signals/track-record]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load signal track record",
      },
      { status: 500 }
    );
  }
}