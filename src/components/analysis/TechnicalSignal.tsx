"use client";

interface TechnicalSignalProps {
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  score: number;
  reasons: string[];
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
}

export default function TechnicalSignal({
  signal,
  score,
  reasons,
  rsi,
  macd,
  macdSignal,
}: TechnicalSignalProps) {
  const signalStyles = {
    BULLISH: {
      label: "Bullish",
      icon: "🟢",
      color: "text-green-400",
      border: "border-green-500/30",
      background: "bg-green-500/10",
    },

    BEARISH: {
      label: "Bearish",
      icon: "🔴",
      color: "text-red-400",
      border: "border-red-500/30",
      background: "bg-red-500/10",
    },

    NEUTRAL: {
      label: "Neutral",
      icon: "🟡",
      color: "text-yellow-400",
      border: "border-yellow-500/30",
      background: "bg-yellow-500/10",
    },
  };

  const style = signalStyles[signal];

  return (
    <div
      className={`mt-8 rounded-xl border ${style.border} ${style.background} p-6`}
    >
      {/* Signal Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">
            Technical Signal
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${style.color}`}
          >
            {style.icon} {style.label}
          </h2>
        </div>

        <div className="text-left md:text-right">
          <p className="text-slate-400 text-sm">
            Technical Score
          </p>

          <p
            className={`text-2xl font-bold mt-1 ${style.color}`}
          >
            {score > 0 ? "+" : ""}
            {score}
          </p>
        </div>
      </div>

      {/* Indicators */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

        {/* RSI */}

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">
            RSI (14)
          </p>

          <p className="text-2xl font-bold mt-2">
            {rsi !== null
              ? rsi.toFixed(2)
              : "N/A"}
          </p>

          <p className="text-slate-500 text-sm mt-2">
            {rsi === null
              ? "No data"
              : rsi < 30
              ? "Potentially oversold"
              : rsi > 70
              ? "Potentially overbought"
              : "Neutral zone"}
          </p>
        </div>

        {/* MACD */}

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">
            MACD
          </p>

          <p className="text-2xl font-bold mt-2">
            {macd !== null
              ? macd.toFixed(4)
              : "N/A"}
          </p>

          <p className="text-slate-500 text-sm mt-2">
            Signal:{" "}
            {macdSignal !== null
              ? macdSignal.toFixed(4)
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Reasons */}

      <div className="mt-6">
        <p className="text-slate-400 text-sm mb-3">
          Analysis
        </p>

        <div className="space-y-2">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-sm text-slate-300"
            >
              <span className="text-slate-500">
                •
              </span>

              {reason}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}