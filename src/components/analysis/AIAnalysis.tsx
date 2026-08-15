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

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-xl">
          🤖
        </div>

        <div>
          <p className="text-slate-400 text-sm">
            AI-Powered Analysis
          </p>

          <h2 className="text-2xl font-semibold mt-1">
            Market Intelligence
          </h2>
        </div>
      </div>

      {/* Summary */}

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5">
        <p className="text-slate-400 text-sm">
          Summary
        </p>

        <p className="text-slate-200 mt-2 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Outlook + Risk */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        {/* Outlook */}

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
          <p className="text-slate-400 text-sm">
            Market Outlook
          </p>

          <p className="text-slate-200 mt-2 leading-relaxed">
            {outlook}
          </p>
        </div>

        {/* Risk */}

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

        <div className="space-y-2">

          {keyPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3"
            >
              <span className="text-purple-400 mt-0.5">
                •
              </span>

              <p className="text-sm text-slate-300">
                {point}
              </p>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}