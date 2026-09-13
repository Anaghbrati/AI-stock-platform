export default function ScannerHeader() {
  return (
    <header className="relative overflow-hidden">
      {/* Subtle radar glow */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-red-500/[0.06] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
          </span>

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-400/80">
            AI Market Radar
          </p>
        </div>

        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.025em] text-slate-100 sm:text-4xl lg:text-[42px]">
          Find what’s worth{" "}
          <span className="text-slate-400">investigating.</span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
          Discover unusual market activity across sectors using
          quantitative signals and AI-powered market interpretation.
        </p>
      </div>
    </header>
  );
}