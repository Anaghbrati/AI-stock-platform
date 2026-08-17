"use client";

interface Fundamentals {
  ticker: string;
  peRatio?: number | null;
  pbRatio?: number | null;
  roe?: number | null;
  debtToEquity?: number | null;
  dividendYield?: number | null;
  freeCashFlow?: number | null;
  eps?: number | null;
  marketCap?: number | null;
}

interface FundamentalsCardProps {
  fundamentals: Fundamentals;
}

export default function FundamentalsCard({
  fundamentals,
}: FundamentalsCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

      {/* Header */}

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#ff6678]">
          Fundamentals
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Financial Overview
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Key financial metrics for {fundamentals.ticker}.
        </p>
      </div>


      {/* Metrics */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <Metric
          label="P/E Ratio"
          value={formatNumber(fundamentals.peRatio)}
        />

        <Metric
          label="P/B Ratio"
          value={formatNumber(fundamentals.pbRatio)}
        />

        <Metric
          label="ROE"
          value={formatPercent(fundamentals.roe)}
        />

        <Metric
          label="Debt / Equity"
          value={formatNumber(
            fundamentals.debtToEquity
          )}
        />

        <Metric
          label="Dividend Yield"
          value={formatPercent(
            fundamentals.dividendYield
          )}
        />

        <Metric
          label="EPS"
          value={formatNumber(fundamentals.eps)}
        />

        <Metric
          label="Free Cash Flow"
          value={formatLargeNumber(
            fundamentals.freeCashFlow
          )}
        />

        <Metric
          label="Market Cap"
          value={formatLargeNumber(
            fundamentals.marketCap
          )}
        />

      </div>


      {/* Disclaimer */}

      <div className="mt-6 border-t border-white/[0.05] pt-4">
        <p className="text-[11px] leading-5 text-slate-600">
          Fundamental data is provided for informational
          purposes and may be delayed or incomplete depending
          on the underlying market-data provider.
        </p>
      </div>

    </section>
  );
}


/* =========================================
   METRIC
========================================= */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition hover:border-white/[0.1]">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   FORMATTERS
========================================= */

function formatNumber(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}


function formatPercent(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

  return `${value.toFixed(2)}%`;
}


function formatLargeNumber(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

  if (value >= 1_00_00_000) {
    return `${(
      value / 1_00_00_000
    ).toFixed(2)} Cr`;
  }

  if (value >= 1_00_000) {
    return `${(
      value / 1_00_000
    ).toFixed(2)} L`;
  }

  return value.toLocaleString("en-IN");
}