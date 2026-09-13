interface ScanProgressProps {
  sectorName: string;
}

export default function ScanProgress({
  sectorName,
}: ScanProgressProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-red-500/10 bg-red-500/[0.025]">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>

            <span className="text-xs font-medium text-slate-300">
              Scanning {sectorName}
            </span>
          </div>

          <span className="text-[10px] uppercase tracking-[0.12em] text-red-400/60">
            Processing
          </span>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-red-400/60" />
        </div>

        <p className="mt-2.5 text-[10px] leading-4 text-slate-600">
          Fetching market data and calculating quantitative signals.
        </p>
      </div>
    </div>
  );
}