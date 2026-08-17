interface TechnicalSignalProps {
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  score: number;
  reasons: string[];
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram?: number | null;
}

export default function TechnicalSignal({
  signal,
  score,
  reasons,
  rsi,
  macd,
  macdSignal,
  macdHistogram,
}: TechnicalSignalProps) {
  const isBullish = signal === "BULLISH";
  const isBearish = signal === "BEARISH";

  const signalColor = isBullish
    ? "text-emerald-400"
    : isBearish
    ? "text-red-400"
    : "text-amber-400";

  const signalBg = isBullish
    ? "bg-emerald-500/10 border-emerald-500/20"
    : isBearish
    ? "bg-red-500/10 border-red-500/20"
    : "bg-amber-500/10 border-amber-500/20";

  const rsiStatus =
    rsi === null
      ? "Unavailable"
      : rsi >= 70
      ? "Overbought"
      : rsi <= 30
      ? "Oversold"
      : "Neutral";

  const rsiColor =
    rsi === null
      ? "text-slate-500"
      : rsi >= 70
      ? "text-red-400"
      : rsi <= 30
      ? "text-emerald-400"
      : "text-amber-400";

  const macdPositive =
    macd !== null &&
    macdSignal !== null &&
    macd > macdSignal;

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ff6678]">
            Technical Intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Technical Signal
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Technical indicators derived from recent price action.
          </p>
        </div>

        {/* Signal */}

        <div
          className={`w-fit rounded-xl border px-5 py-3 ${signalBg}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Signal
          </p>

          <p
            className={`mt-1 text-lg font-black tracking-wide ${signalColor}`}
          >
            {signal}
          </p>
        </div>

      </div>


      {/* =====================================
          SCORE
      ====================================== */}

      <div className="mt-7 rounded-xl border border-white/[0.05] bg-white/[0.02] p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-slate-500">
              Technical Score
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {score}
              <span className="text-base font-medium text-slate-600">
                /10
              </span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-600">
              Overall signal
            </p>

            <p className={`mt-1 text-sm font-bold ${signalColor}`}>
              {signal}
            </p>
          </div>

        </div>

        {/* Score bar */}

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">

          <div
            className={`h-full rounded-full transition-all ${
              isBullish
                ? "bg-emerald-400"
                : isBearish
                ? "bg-red-400"
                : "bg-amber-400"
            }`}
            style={{
              width: `${Math.min(
                Math.max(
                  ((score + 10) / 20) * 100,
                  0
                ),
                100
              )}%`,
            }}
          />

        </div>

      </div>


      {/* =====================================
          INDICATORS
      ====================================== */}

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <IndicatorCard
          label="RSI"
          value={
            rsi !== null
              ? rsi.toFixed(2)
              : "N/A"
          }
          status={rsiStatus}
          statusClass={rsiColor}
        />

        <IndicatorCard
          label="MACD"
          value={
            macd !== null
              ? macd.toFixed(2)
              : "N/A"
          }
          status={
            macdPositive
              ? "Bullish"
              : "Bearish"
          }
          statusClass={
            macdPositive
              ? "text-emerald-400"
              : "text-red-400"
          }
        />

        <IndicatorCard
          label="MACD Signal"
          value={
            macdSignal !== null
              ? macdSignal.toFixed(2)
              : "N/A"
          }
          status="Signal line"
          statusClass="text-slate-500"
        />

        <IndicatorCard
          label="Histogram"
          value={
            macdHistogram !== null &&
            macdHistogram !== undefined
              ? `${
                  macdHistogram > 0
                    ? "+"
                    : ""
                }${macdHistogram.toFixed(2)}`
              : "N/A"
          }
          status={
            macdHistogram === null ||
            macdHistogram === undefined
              ? "Unavailable"
              : macdHistogram > 0
              ? "Positive"
              : "Negative"
          }
          statusClass={
            macdHistogram === null ||
            macdHistogram === undefined
              ? "text-slate-500"
              : macdHistogram > 0
              ? "text-emerald-400"
              : "text-red-400"
          }
        />

      </div>


      {/* =====================================
          REASONS
      ====================================== */}

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Indicator Breakdown
          </p>

          <span className="text-[10px] text-slate-700">
            {reasons.length} signals
          </span>

        </div>

        <div className="space-y-2">

          {reasons.length > 0 ? (
            reasons.map((reason, index) => {

              const negative =
                /below|bearish|negative|overbought|weak|decline|selling/i.test(
                  reason
                );

              const positive =
                /above|bullish|positive|oversold|strong|growth|buying/i.test(
                  reason
                );

              return (
                <div
                  key={`${reason}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3"
                >

                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      negative
                        ? "bg-red-500/10 text-red-400"
                        : positive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/[0.05] text-slate-500"
                    }`}
                  >
                    {negative
                      ? "−"
                      : positive
                      ? "+"
                      : "•"}
                  </span>

                  <p className="text-sm text-slate-400">
                    {reason}
                  </p>

                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-white/[0.04] p-4 text-sm text-slate-600">
              No technical indicators available.
            </div>
          )}

        </div>

      </div>

    </section>
  );
}


/* =========================================
   INDICATOR CARD
========================================= */

function IndicatorCard({
  label,
  value,
  status,
  statusClass,
}: {
  label: string;
  value: string;
  status: string;
  statusClass: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>

      <p className={`mt-1 text-xs font-medium ${statusClass}`}>
        {status}
      </p>

    </div>
  );
}