"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Info,
  Radio,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

type BacktestHorizon = {
  horizonDays: number;
  instances: number;
  followThroughRate: number | null;
  averageReturn: number | null;
};

type LiveHorizon = {
  horizonDays: number;
  instances: number;
  followThroughRate: number | null;
  averageReturn: number | null;
  status: string;
  message: string | null;
};

type SignalItem = {
  id: string;
  symbol: string;
  detectedAt: string;
  priceAtDetection: number;
};

type SignalOutcome = {
  horizonDays: 5 | 10 | 20;
  status: "pending" | "completed";
  pctChange: number | null;
  followedThrough: boolean | null;
};

type RecentSignal = SignalItem & {
  outcomes: SignalOutcome[];
};

type TrackRecordResponse = {
  success: boolean;

  signal: {
    type: string;
    name: string;
    description: string;
  };

  backtest: {
    available: boolean;
    universe: string | null;
    computedAt: string | null;
    horizons: BacktestHorizon[];
  };

  live: {
    totalSignals: number;
    meaningfulSample: boolean;
    minimumMeaningfulSignals: number;
    message: string | null;

    completedOutcomes: {
      fiveDay: number;
      tenDay: number;
      twentyDay: number;
    };

    horizons: LiveHorizon[];

    todaySignals: SignalItem[];
    recentSignals: RecentSignal[];
  };
};

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

function formatReturn(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const prefix = value > 0 ? "+" : "";

  return `${prefix}${value.toFixed(2)}%`;
}

function formatHorizon(days: number) {
  return `${days}D`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function formatSymbol(symbol: string) {
  return symbol.replace(".NS", "");
}

function getHorizonColor(rate: number | null) {
  if (rate === null) {
    return "text-slate-400";
  }

  if (rate >= 60) {
    return "text-emerald-400";
  }

  if (rate >= 50) {
    return "text-amber-400";
  }

  return "text-rose-400";
}

function StatusPill({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        live
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-slate-700 bg-slate-800/70 text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          live ? "bg-emerald-400" : "bg-slate-500"
        }`}
      />

      {live ? "Live tracking" : "Historical"}
    </span>
  );
}

function OutcomeCell({
  outcome,
}: {
  outcome: SignalOutcome;
}) {
  if (outcome.status === "pending") {
    return (
      <div className="min-w-[76px] rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-center">
        <p className="text-[10px] text-slate-600">
          {formatHorizon(outcome.horizonDays)}
        </p>

        <div className="mt-1 flex items-center justify-center gap-1">
          <Clock3 className="h-3 w-3 text-amber-400" />

          <span className="text-[11px] font-medium text-amber-300">
            Pending
          </span>
        </div>
      </div>
    );
  }

  const positive =
    outcome.pctChange !== null &&
    outcome.pctChange > 0;

  return (
    <div className="min-w-[76px] rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-center">
      <p className="text-[10px] text-slate-600">
        {formatHorizon(outcome.horizonDays)}
      </p>

      <p
        className={`mt-1 text-xs font-semibold ${
          positive
            ? "text-emerald-300"
            : "text-rose-300"
        }`}
      >
        {formatReturn(outcome.pctChange)}
      </p>
    </div>
  );
}

export default function SignalsPage() {
  const [data, setData] =
    useState<TrackRecordResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTrackRecord() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/signals/track-record",
          {
            cache: "no-store",
          }
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error ||
              "Unable to load signal track record."
          );
        }

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load signal data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrackRecord();

    return () => {
      cancelled = true;
    };
  }, []);

  const todaySignals =
    data?.live.todaySignals ?? [];

  const recentSignals =
    data?.live.recentSignals ?? [];

  const fiveDayBacktest = useMemo(
    () =>
      data?.backtest.horizons.find(
        (item) => item.horizonDays === 5
      ),
    [data]
  );

  const tenDayBacktest = useMemo(
    () =>
      data?.backtest.horizons.find(
        (item) => item.horizonDays === 10
      ),
    [data]
  );

  const twentyDayBacktest = useMemo(
    () =>
      data?.backtest.horizons.find(
        (item) => item.horizonDays === 20
      ),
    [data]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800" />

          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-800" />

          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70"
                />
              )
            )}
          </div>

          <div className="h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2">
              <Info className="h-5 w-5 text-rose-400" />
            </div>

            <h1 className="text-lg font-semibold">
              Unable to load Signals
            </h1>
          </div>

          <p className="text-sm text-slate-400">
            {error ||
              "Signal data is unavailable right now."}
          </p>
        </div>
      </main>
    );
  }

  const sampleProgress = Math.min(
    100,
    (data.live.totalSignals /
      data.live.minimumMeaningfulSignals) *
      100
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}

        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusPill live={true} />

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Evidence-based
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Signals
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Don&apos;t trust the signal. Check its
                record.
                <br />
                Live signals are tracked against their
                historical performance so you can judge
                the setup instead of blindly following it.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Database className="h-4 w-4" />

              {data.backtest.universe ||
                "Active stock universe"}
            </div>
          </div>
        </section>

        {/* Today's Signals */}

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-emerald-400" />

                <h2 className="text-lg font-semibold">
                  Today&apos;s Signals
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Stocks that triggered the RSI Recovery
                setup today.
              </p>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
              {todaySignals.length} detected
            </span>
          </div>

          {todaySignals.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_35%)]" />

              <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <Radio className="h-7 w-7 text-slate-500" />
                </div>

                <h3 className="text-base font-semibold text-slate-200">
                  No RSI Recovery signals today
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No stock in the active universe has
                  triggered the RSI Recovery setup today.
                  This is normal when the market is closed
                  or no RSI recovery occurred.
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-slate-600">
                  <Clock3 className="h-4 w-4" />

                  Waiting for the next market session
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="divide-y divide-slate-800">
                {todaySignals.map((signal) => {
                  const symbol = formatSymbol(
                    signal.symbol
                  );

                  return (
                    <Link
                      key={signal.id}
                      href={`/markets/${encodeURIComponent(
                        signal.symbol
                      )}`}
                      className="group flex flex-col gap-4 p-4 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {symbol}
                            </span>

                            <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                              RSI Recovery
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            Detected{" "}
                            {formatDate(
                              signal.detectedAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Signal price
                          </p>

                          <p className="mt-1 font-medium text-slate-200">
                            ₹
                            {signal.priceAtDetection.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Recent Signals */}

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />

                <h2 className="text-lg font-semibold">
                  Recent Signals
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Previously detected live signals and
                their outcome progress.
              </p>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
              {recentSignals.length} shown
            </span>
          </div>

          {recentSignals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
                <Activity className="h-5 w-5 text-slate-600" />
              </div>

              <h3 className="text-sm font-semibold text-slate-300">
                No previous signals yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
                Once the live tracker records signals,
                they will appear here with their 5D, 10D
                and 20D outcome status.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="divide-y divide-slate-800">
                {recentSignals.map((signal) => {
                  const symbol = formatSymbol(
                    signal.symbol
                  );

                  return (
                    <Link
                      key={signal.id}
                      href={`/markets/${encodeURIComponent(
                        signal.symbol
                      )}`}
                      className="group block p-4 transition hover:bg-slate-800/40"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
                            <TrendingUp className="h-4 w-4 text-slate-400" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-200">
                                {symbol}
                              </span>

                              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                RSI Recovery
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-600">
                              Detected{" "}
                              {formatDate(
                                signal.detectedAt
                              )}
                              {" · "}
                              ₹
                              {signal.priceAtDetection.toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {signal.outcomes.map(
                            (outcome) => (
                              <OutcomeCell
                                key={
                                  outcome.horizonDays
                                }
                                outcome={outcome}
                              />
                            )
                          )}

                          <div className="hidden items-center pl-2 sm:flex">
                            <ArrowRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Signal Definition */}

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/10 p-2">
                    <Zap className="h-4 w-4 text-violet-400" />
                  </div>

                  <span className="text-xs font-medium uppercase tracking-wider text-violet-300">
                    Active signal
                  </span>
                </div>

                <h2 className="text-xl font-semibold">
                  {data.signal.name}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  {data.signal.description}
                </p>
              </div>

              <span className="hidden rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-500 sm:block">
                {data.signal.type}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs text-slate-500">
                  Condition
                </p>

                <p className="mt-2 text-sm font-medium text-slate-200">
                  RSI below 30
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs text-slate-500">
                  Trigger
                </p>

                <p className="mt-2 text-sm font-medium text-emerald-300">
                  Crosses above 30
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs text-slate-500">
                  Tracking
                </p>

                <p className="mt-2 text-sm font-medium text-slate-200">
                  5 / 10 / 20D
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <Target className="h-4 w-4" />

              <span className="text-xs font-medium uppercase tracking-wider">
                What this means
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-400">
              This is not a prediction engine. The page
              measures how this exact signal behaved
              historically and then tracks every new
              occurrence going forward.
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-400/10 bg-amber-400/5 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

              <p className="text-xs leading-5 text-slate-500">
                A positive follow-through rate does not
                guarantee a profitable trade. Use the
                signal as evidence, not as a standalone
                trading decision.
              </p>
            </div>
          </div>
        </section>

        {/* Historical Track Record */}

        <section className="mb-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />

                <h2 className="text-lg font-semibold">
                  Historical Track Record
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Historical performance of this signal across
                the active stock universe. These are not
                today&apos;s signals.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-4 w-4" />

              Backtest computed{" "}
              {formatDate(data.backtest.computedAt)}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              fiveDayBacktest,
              tenDayBacktest,
              twentyDayBacktest,
            ]
              .filter(
                (
                  item
                ): item is BacktestHorizon =>
                  Boolean(item)
              )
              .map((item) => (
                <div
                  key={item.horizonDays}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                      {formatHorizon(
                        item.horizonDays
                      )}
                    </span>

                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>

                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Follow-through rate
                    </p>

                    <p
                      className={`mt-1 text-3xl font-bold tracking-tight ${getHorizonColor(
                        item.followThroughRate
                      )}`}
                    >
                      {formatPercent(
                        item.followThroughRate
                      )}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
                    <div>
                      <p className="text-[11px] text-slate-600">
                        Avg. return
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {formatReturn(
                          item.averageReturn
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-600">
                        Instances
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {item.instances}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Live Tracking */}

        <section className="mb-8">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />

              <h2 className="text-lg font-semibold">
                Live Performance
              </h2>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                LIVE
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Real signals detected after launch. No
              historical events are mixed into this section.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">
                  Live signals collected
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    {data.live.totalSignals}
                  </span>

                  <span className="text-sm text-slate-500">
                    /{" "}
                    {
                      data.live
                        .minimumMeaningfulSignals
                    }{" "}
                    meaningful sample
                  </span>
                </div>
              </div>

              <div className="min-w-[240px]">
                <div className="mb-2 flex justify-between text-[11px] text-slate-600">
                  <span>Sample size</span>

                  <span>
                    {sampleProgress.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${sampleProgress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start gap-3">
                {data.live.meaningfulSample ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                ) : (
                  <Clock3 className="mt-0.5 h-5 w-5 text-amber-400" />
                )}

                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {data.live.meaningfulSample
                      ? "Enough live data has accumulated"
                      : "Too early for a meaningful live rate"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {data.live.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Outcomes */}

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Live Outcomes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Actual results from signals detected by the
              live tracker.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {data.live.horizons.map((item) => (
              <div
                key={item.horizonDays}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">
                    {formatHorizon(
                      item.horizonDays
                    )}
                  </span>

                  <span className="text-xs text-slate-600">
                    {item.instances} completed
                  </span>
                </div>

                <p className="mt-5 text-xs uppercase tracking-wider text-slate-600">
                  Follow-through
                </p>

                <p
                  className={`mt-1 text-2xl font-bold ${getHorizonColor(
                    item.followThroughRate
                  )}`}
                >
                  {formatPercent(
                    item.followThroughRate
                  )}
                </p>

                <div className="mt-4 border-t border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-600">
                      Average return
                    </span>

                    <span className="text-sm font-medium text-slate-300">
                      {formatReturn(
                        item.averageReturn
                      )}
                    </span>
                  </div>
                </div>

                {!data.live.meaningfulSample && (
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600">
                    <Clock3 className="h-3.5 w-3.5" />

                    {item.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Methodology */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-400" />

                <h2 className="font-semibold">
                  How this signal is evaluated
                </h2>
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                The tracker looks for an RSI(14) recovery
                where the previous trading day was below 30
                and the current trading day closes at or
                above 30. Each occurrence is logged
                independently and evaluated after 5, 10 and
                20 trading days.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <p className="text-lg font-bold text-slate-200">
                  14
                </p>

                <p className="text-[10px] text-slate-600">
                  stocks
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <p className="text-lg font-bold text-slate-200">
                  14D
                </p>

                <p className="text-[10px] text-slate-600">
                  RSI
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <p className="text-lg font-bold text-slate-200">
                  3
                </p>

                <p className="text-[10px] text-slate-600">
                  horizons
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}