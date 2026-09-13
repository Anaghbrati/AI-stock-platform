"use client";

interface ScanButtonProps {
  isScanning: boolean;
  sectorName: string;
  onClick: () => void;
}

export default function ScanButton({
  isScanning,
  sectorName,
  onClick,
}: ScanButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isScanning}
      className="mt-5 flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-300 disabled:cursor-not-allowed disabled:border-red-500/15 disabled:bg-red-500/[0.04] disabled:text-red-300"
    >
      {isScanning ? (
        <span className="flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute h-3.5 w-3.5 animate-ping rounded-full bg-red-400/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          </span>

          Scanning {sectorName}...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Scan Sector

          <span className="text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-red-400">
            →
          </span>
        </span>
      )}
    </button>
  );
}