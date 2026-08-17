"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import type { Shareholding } from "../../lib/providers/market-data/types";

interface ShareholdingChartProps {
  shareholding: Shareholding;
}

interface ChartData {
  name: string;
  value: number;
}

const CHART_COLORS = [
  "#ff6577",
  "#38bdf8",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
];

export default function ShareholdingChart({
  shareholding,
}: ShareholdingChartProps) {

  const data: ChartData[] = [];

  // ========================================
  // PROMOTERS
  // ========================================

  if (
    shareholding.promoterHolding != null &&
    shareholding.promoterHolding > 0
  ) {
    data.push({
      name: "Promoters",
      value: shareholding.promoterHolding,
    });
  }


  // ========================================
  // INSTITUTIONAL
  // ========================================

  if (
    shareholding.institutionalHolding != null &&
    shareholding.institutionalHolding > 0
  ) {
    data.push({
      name: "Institutions",
      value: shareholding.institutionalHolding,
    });
  }


  // ========================================
  // MUTUAL FUNDS
  // ========================================

  if (
    shareholding.mutualFundHolding != null &&
    shareholding.mutualFundHolding > 0
  ) {
    data.push({
      name: "Mutual Funds",
      value: shareholding.mutualFundHolding,
    });
  }


  // ========================================
  // INSIDERS
  // ========================================

  if (
    shareholding.insiderHolding != null &&
    shareholding.insiderHolding > 0
  ) {
    data.push({
      name: "Insiders",
      value: shareholding.insiderHolding,
    });
  }


  // ========================================
  // OTHER / UNCLASSIFIED
  // ========================================

  if (
    shareholding.publicHolding != null &&
    shareholding.publicHolding > 0
  ) {
    data.push({
      name: "Other / Unclassified",
      value: shareholding.publicHolding,
    });
  }


  // ========================================
  // NO DATA
  // ========================================

  if (data.length === 0) {

    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-8">

        <div className="text-center">

          <p className="text-sm font-semibold text-slate-300">
            Shareholding data unavailable
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Yahoo Finance does not currently provide
            sufficient ownership information for this
            stock.
          </p>

        </div>

      </div>
    );
  }


  // ========================================
  // CLEAN CHART VALUES
  // ========================================

  const cleanData = data
    .map((item) => ({
      ...item,
      value: Math.max(
        0,
        Math.min(
          Number(item.value) || 0,
          100
        )
      ),
    }))
    .filter(
      (item) => item.value > 0
    );


  // ========================================
  // CHART
  // ========================================

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6">

      {/* HEADER */}

      <div className="mb-6">

        <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
          Ownership
        </p>

        <h3 className="mt-1 text-xl font-black text-white">
          Shareholding Pattern
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Ownership distribution based on available
          market data.
        </p>

      </div>


      {/* PIE */}

      <div className="h-[420px] w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={cleanData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={85}
              outerRadius={145}
              paddingAngle={3}
              stroke="none"
              label={({
                name,
                value,
              }) =>
                `${name}: ${Number(
                  value
                ).toFixed(2)}%`
              }
              labelLine={false}
            >

              {cleanData.map(
                (entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={
                      CHART_COLORS[
                        index %
                          CHART_COLORS.length
                      ]
                    }
                  />
                )
              )}

            </Pie>


            <Tooltip
              contentStyle={{
                backgroundColor:
                  "#101318",

                border:
                  "1px solid rgba(255,255,255,0.08)",

                borderRadius:
                  "12px",

                color:
                  "#ffffff",
              }}
              formatter={(value) => [
                `${Number(
                  value
                ).toFixed(2)}%`,
                "Ownership",
              ]}
            />


            <Legend
              verticalAlign="bottom"
              height={42}
              wrapperStyle={{
                fontSize: "12px",
                color: "#94a3b8",
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>


      {/* BREAKDOWN */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {cleanData.map(
          (item, index) => (

            <div
              key={item.name}
              className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
            >

              <div className="flex items-center gap-2">

                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      CHART_COLORS[
                        index %
                          CHART_COLORS.length
                      ],
                  }}
                />

                <p className="text-xs text-slate-600">
                  {item.name}
                </p>

              </div>

              <p className="mt-2 text-xl font-black text-white">
                {item.value.toFixed(2)}%
              </p>

            </div>

          )
        )}

      </div>


      {/* AVAILABLE DATA NOTICE */}

      <div className="mt-5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">

        <p className="text-xs leading-5 text-slate-600">
          Ownership percentages are based on the
          information currently available through Yahoo
          Finance. Promoter and mutual-fund classifications
          may be unavailable for some Indian stocks.
          "Other / Unclassified" represents the remaining
          percentage that could not be classified.
        </p>

      </div>

    </div>
  );
}