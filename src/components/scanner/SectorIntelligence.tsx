import type { SectorAIAnalysisResult } from "../../lib/providers/ai";

interface SectorIntelligenceProps {
  analysis: SectorAIAnalysisResult | null;
  error?: string | null;
}

export default function SectorIntelligence({
  analysis,
  error,
}: SectorIntelligenceProps) {
  if (error) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-[#11151F]/75 p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/15 bg-red-500/[0.06]">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-100">
              Sector Intelligence
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              AI interpretation of the quantitative scan.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/10 bg-red-500/[0.025] p-4">
          <p className="text-sm text-slate-400">
            Quantitative scan completed, but AI interpretation
            was unavailable.
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#11151F]/75 p-5">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/15 bg-red-500/[0.05]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-100">
              Sector Intelligence
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              AI interpretation of the quantitative evidence.
            </p>
          </div>
        </div>

        <span className="hidden rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600 sm:block">
          AI Analysis
        </span>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/[0.06] bg-[#07090E]/60 p-5">
        <p className="text-sm leading-6 text-slate-300">
          {analysis.summary}
        </p>
      </div>

      {/* Market Observation */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400/70" />

          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Market Observation
          </h3>
        </div>

        <p className="mt-2.5 text-sm leading-6 text-slate-400">
          {analysis.marketObservation}
        </p>
      </div>

      {/* Standout Stocks */}
      {analysis.standoutStocks.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              Standout Stocks
            </h3>

            <span className="text-[9px] text-slate-700">
              {analysis.standoutStocks.length} identified
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {analysis.standoutStocks.map((stock) => (
              <div
                key={stock.ticker}
                className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 transition-colors duration-200 hover:border-red-500/10 hover:bg-red-500/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/70" />

                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {stock.ticker.replace(".NS", "")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {stock.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Events */}
      {analysis.keyEvents.length > 0 && (
        <div className="mt-7">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Key Events
          </h3>

          <div className="mt-3 space-y-2">
            {analysis.keyEvents.map((event, index) => (
              <div
                key={`${event.title}-${index}`}
                className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4"
              >
                <p className="text-sm font-medium text-slate-200">
                  {event.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {event.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {analysis.evidence.length > 0 && (
        <div className="mt-7">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Evidence
          </h3>

          <ul className="mt-3 space-y-2">
            {analysis.evidence.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs leading-5 text-slate-400"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Caveats */}
      {analysis.caveats.length > 0 && (
        <div className="mt-7 rounded-xl border border-white/[0.05] bg-[#07090E]/50 p-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />

            <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              Caveats
            </h3>
          </div>

          <ul className="mt-3 space-y-2">
            {analysis.caveats.map((caveat) => (
              <li
                key={caveat}
                className="flex items-start gap-2 text-xs leading-5 text-slate-500"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-700" />
                <span>{caveat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 border-t border-white/[0.05] pt-4">
        <p className="text-[10px] leading-4 text-slate-600">
          AI interpretation is based on the quantitative scanner
          evidence available at the time of the scan. It is not
          investment advice.
        </p>
      </div>
    </section>
  );
}