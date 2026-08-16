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
  return (
    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

      {/* Header */}

      <div className="mb-6">
        <p className="text-slate-400 text-sm">
          AI-Powered Analysis
        </p>

        <h2 className="text-2xl font-bold mt-2">
          Market Intelligence
        </h2>
      </div>

      {/* Summary */}

      <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
        <p className="text-slate-400 text-sm">
          Summary
        </p>

        <p className="text-slate-200 mt-2 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Outlook + Risk */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
          <p className="text-slate-400 text-sm">
            Market Outlook
          </p>

          <p className="text-slate-200 mt-2 leading-relaxed">
            {outlook}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
          <p className="text-slate-400 text-sm">
            Risk Assessment
          </p>

          <p className="text-slate-200 mt-2 leading-relaxed">
            {risk}
          </p>
        </div>

      </div>

      {/* Key Points */}

      <div className="mt-6">

        <p className="text-slate-400 text-sm mb-3">
          Key Points
        </p>

        <div className="space-y-3">

          {keyPoints.map((point, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <span className="text-slate-500">
                {index + 1}.
              </span>

              <p className="text-slate-300 text-sm">
                {point}
              </p>
            </div>
          ))}

        </div>

      </div>

      {/* Disclaimer */}

      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-500">
          AI-generated analysis is for educational and
          informational purposes only. It is not financial
          advice or a guarantee of future market performance.
        </p>
      </div>

    </div>
  );
}