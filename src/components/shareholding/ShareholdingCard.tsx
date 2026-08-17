"use client";

interface Shareholding {
  ticker: string;

  promoterHolding?: number | null;
  institutionalHolding?: number | null;
  mutualFundHolding?: number | null;
  publicHolding?: number | null;
}

interface Props {
  shareholding: Shareholding;
}

export default function ShareholdingCard({
  shareholding,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

      {/* Header */}

      <div className="mb-6">

        <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
          Ownership
        </p>

        <h2 className="mt-1 text-2xl font-black">
          Shareholding
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Current ownership distribution.
        </p>

      </div>


      {/* Holdings */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <HoldingCard
          label="Promoters"
          value={shareholding.promoterHolding}
        />

        <HoldingCard
          label="Institutions"
          value={shareholding.institutionalHolding}
        />

        <HoldingCard
          label="Mutual Funds"
          value={shareholding.mutualFundHolding}
        />

        <HoldingCard
          label="Public"
          value={shareholding.publicHolding}
        />

      </div>

    </div>
  );
}


function HoldingCard({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0f13] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        {value !== null &&
        value !== undefined
          ? `${value.toFixed(2)}%`
          : "N/A"}
      </p>

    </div>
  );
}