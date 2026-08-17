"use client";

interface AIAnalysisProps {
  summary: string;
  outlook: string;
  risk: string;
  keyPoints: string[];
}

export default function AIAnalysis({
  summary,
  outlook,
  risk,
  keyPoints,
}: AIAnalysisProps) {
  const normalizedOutlook =
    outlook.toUpperCase();

  const outlookColor =
    normalizedOutlook.includes("BULL")
      ? "text-emerald-400"
      : normalizedOutlook.includes("BEAR")
      ? "text-red-400"
      : "text-amber-400";

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex items-start gap-4">

        {/* AI Icon */}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ff6678]/10 bg-[#ff6678]/10 text-lg text-[#ff6678]">
          ✦
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ff6678]">
            AI Intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            AI Market Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            AI-generated interpretation of current market conditions.
          </p>
        </div>

      </div>


      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="mt-6 rounded-xl border border-white/[0.05] bg-white/[0.02] p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Summary
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {summary}
        </p>

      </div>


      {/* =====================================
          OUTLOOK + RISK
      ====================================== */}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Outlook */}

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            AI Outlook
          </p>

          <p
            className={`mt-2 text-lg font-bold ${outlookColor}`}
          >
            {outlook}
          </p>

        </div>


        {/* Risk */}

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Risk Assessment
          </p>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
            {risk}
          </p>

        </div>

      </div>


      {/* =====================================
          KEY INSIGHTS
      ====================================== */}

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Key Insights
          </p>

          <span className="text-[10px] text-slate-700">
            {keyPoints.length} insights
          </span>

        </div>


        <div className="space-y-2">

          {keyPoints.length > 0 ? (

            keyPoints.map((point, index) => (

              <div
                key={`${point}-${index}`}
                className="flex gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3 transition hover:border-white/[0.08]"
              >

                <span className="mt-0.5 shrink-0 text-[#ff6678]">
                  ✦
                </span>

                <p className="text-sm leading-6 text-slate-400">
                  {point}
                </p>

              </div>

            ))

          ) : (

            <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">

              <p className="text-sm text-slate-600">
                No AI insights available.
              </p>

            </div>

          )}

        </div>

      </div>


      {/* =====================================
          DISCLAIMER
      ====================================== */}

      <div className="mt-6 border-t border-white/[0.05] pt-4">

        <p className="text-[11px] leading-5 text-slate-600">
          AI-generated analysis is for educational and
          informational purposes only. It is not financial
          advice or a guarantee of future market performance.
        </p>

      </div>

    </section>
  );
}