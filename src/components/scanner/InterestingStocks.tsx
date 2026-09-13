import type { ScannerStockResult } from "../../lib/scanner/scanner.types";
import ScannerStockCard from "./ScannerStockCard";

interface InterestingStocksProps {
  stocks: ScannerStockResult[];
}

export default function InterestingStocks({
  stocks,
}: InterestingStocksProps) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Radar Findings
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
            Interesting Stocks
          </h2>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Stocks with stronger quantitative evidence from this scan.
          </p>
        </div>

        {stocks.length > 0 && (
          <div className="hidden rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 sm:block">
            <span className="text-xs font-medium text-slate-400">
              {stocks.length}{" "}
              {stocks.length === 1 ? "stock" : "stocks"}
            </span>
          </div>
        )}
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#11151F]/60 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white/[0.03]">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-300">
                No standout stocks detected
              </p>

              <p className="mt-1 text-xs text-slate-600">
                No stocks crossed the scanner threshold in this scan.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stocks.map((stock) => (
            <ScannerStockCard
              key={stock.ticker}
              stock={stock}
            />
          ))}
        </div>
      )}
    </section>
  );
}