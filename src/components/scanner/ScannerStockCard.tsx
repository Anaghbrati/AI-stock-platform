"use client";

import Link from "next/link";
import type { ScannerStockResult } from "../../lib/scanner/scanner.types";

interface ScannerStockCardProps {
stock: ScannerStockResult;
}

function formatPercent(value: number | null) {
if (value === null || !Number.isFinite(value)) {
return "—";
}

return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function cleanTicker(ticker: string) {
return ticker.replace(".NS", "");
}

export default function ScannerStockCard({
stock,
}: ScannerStockCardProps) {
const ticker = cleanTicker(stock.ticker);

return ( <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"> <div className="flex items-start justify-between gap-4"> <div> <h3 className="text-base font-semibold text-white">
{ticker} </h3>


      <p className="mt-1 text-xs text-slate-500">
        Quantitative radar result
      </p>
    </div>

    <div className="text-right">
      <p className="text-lg font-semibold text-white">
        {stock.scannerScore.toFixed(0)}
      </p>

      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        Scanner Score
      </p>
    </div>
  </div>

  <div className="mt-5 grid grid-cols-2 gap-3">
    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        20D Return
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {formatPercent(stock.signals.return20D)}
      </p>
    </div>

    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        Relative Strength
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {formatPercent(
          stock.relativePerformance.relativePerformance20D
        )}
      </p>
    </div>

    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        Volume
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {stock.signals.volumeRatio20D !== null
          ? `${stock.signals.volumeRatio20D.toFixed(2)}x`
          : "—"}
      </p>
    </div>

    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        Volatility
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {stock.signals.volatility20D !== null
          ? `${stock.signals.volatility20D.toFixed(2)}%`
          : "—"}
      </p>
    </div>
  </div>

  {stock.observations.length > 0 && (
    <div className="mt-4">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
        Evidence
      </p>

      <ul className="space-y-1.5">
        {stock.observations.slice(0, 3).map((observation) => (
          <li
            key={observation}
            className="text-xs leading-5 text-slate-400"
          >
            • {observation}
          </li>
        ))}
      </ul>
    </div>
  )}

  <Link
  href={`/stock/${encodeURIComponent(stock.ticker)}`}
  className="mt-5 flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
>
  Investigate Stock →
</Link>
</div>


);
}
