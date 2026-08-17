"use client";

interface FinancialStatementPeriod {
  period: string;

  revenue?: number | null;
  grossProfit?: number | null;
  operatingIncome?: number | null;
  netIncome?: number | null;
  eps?: number | null;

  totalAssets?: number | null;
  totalLiabilities?: number | null;
  totalEquity?: number | null;
  cash?: number | null;
  totalDebt?: number | null;

  operatingCashFlow?: number | null;
  investingCashFlow?: number | null;
  financingCashFlow?: number | null;
  freeCashFlow?: number | null;
}

interface FinancialStatements {
  ticker: string;
  annual: FinancialStatementPeriod[];
  quarterly: FinancialStatementPeriod[];
}

interface Props {
  financials: FinancialStatements;
}

export default function FinancialStatementsCard({
  financials,
}: Props) {
  const latest = financials?.annual?.[0];

  if (!latest) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6">
        <p className="text-sm text-slate-500">
          Financial statement data is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

      {/* Header */}

      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
          Financial Data
        </p>

        <h2 className="mt-1 text-2xl font-black">
          Financial Statements
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Latest annual financial performance.
        </p>
      </div>


      {/* Period */}

      <div className="mb-5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          Reporting Period
        </p>

        <p className="mt-1 text-sm font-semibold text-white">
          {latest.period}
        </p>
      </div>


      {/* Metrics */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

        <FinancialMetric
          label="Revenue"
          value={formatLargeNumber(latest.revenue)}
        />

        <FinancialMetric
          label="Gross Profit"
          value={formatLargeNumber(latest.grossProfit)}
        />

        <FinancialMetric
          label="Operating Income"
          value={formatLargeNumber(
            latest.operatingIncome
          )}
        />

        <FinancialMetric
          label="Net Income"
          value={formatLargeNumber(
            latest.netIncome
          )}
        />

        <FinancialMetric
          label="Total Assets"
          value={formatLargeNumber(
            latest.totalAssets
          )}
        />

        <FinancialMetric
          label="Total Liabilities"
          value={formatLargeNumber(
            latest.totalLiabilities
          )}
        />

        <FinancialMetric
          label="Total Equity"
          value={formatLargeNumber(
            latest.totalEquity
          )}
        />

        <FinancialMetric
          label="Cash"
          value={formatLargeNumber(
            latest.cash
          )}
        />

        <FinancialMetric
          label="Total Debt"
          value={formatLargeNumber(
            latest.totalDebt
          )}
        />

        <FinancialMetric
          label="Operating Cash Flow"
          value={formatLargeNumber(
            latest.operatingCashFlow
          )}
        />

        <FinancialMetric
          label="Investing Cash Flow"
          value={formatLargeNumber(
            latest.investingCashFlow
          )}
        />

        <FinancialMetric
          label="Free Cash Flow"
          value={formatLargeNumber(
            latest.freeCashFlow
          )}
        />

      </div>

    </div>
  );
}


function FinancialMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0f13] p-4">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-base font-bold text-white">
        {value}
      </p>

    </div>
  );
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

  const absolute = Math.abs(value);

  if (absolute >= 1_00_00_000) {
    return `${(
      value / 1_00_00_000
    ).toFixed(2)} Cr`;
  }

  if (absolute >= 1_00_000) {
    return `${(
      value / 1_00_000
    ).toFixed(2)} L`;
  }

  return value.toLocaleString("en-IN");
}