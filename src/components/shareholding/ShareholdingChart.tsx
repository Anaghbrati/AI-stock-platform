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

export default function ShareholdingChart({
  shareholding,
}: ShareholdingChartProps) {

  const data: ChartData[] = [];

  // ========================================
  // INSTITUTIONAL
  // ========================================

  if (
    shareholding.institutionalHolding != null &&
    shareholding.institutionalHolding > 0
  ) {
    data.push({
      name: "Institutional",
      value: shareholding.institutionalHolding,
    });
  }


  // ========================================
  // INSIDER
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

        <p className="text-center text-sm text-slate-500">
          Shareholding data is currently unavailable
          for this stock.
        </p>

      </div>
    );
  }


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


      {/* PIE CHART */}

      <div className="h-[400px] w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={135}
              paddingAngle={3}
              label={({ name, value }) =>
                `${name}: ${Number(value).toFixed(2)}%`
              }
              labelLine={false}
            >

              {data.map(
                (entry, index) => (
                  <Cell
                    key={`cell-${index}`}
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
                `${Number(value).toFixed(2)}%`,
                "Holding",
              ]}
            />


            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: "12px",
                color: "#94a3b8",
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>


      {/* BREAKDOWN */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

        {data.map((item) => (

          <div
            key={item.name}
            className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
          >

            <p className="text-xs text-slate-600">
              {item.name}
            </p>

            <p className="mt-2 text-xl font-black text-white">
              {item.value.toFixed(2)}%
            </p>

          </div>

        ))}

      </div>


      {/* DISCLAIMER */}

      <p className="mt-5 text-xs leading-5 text-slate-600">
        Ownership categories are based on data available
        through Yahoo Finance. "Other / Unclassified"
        represents the remaining ownership percentage
        that could not be classified from the available
        data.
      </p>

    </div>
  );
}