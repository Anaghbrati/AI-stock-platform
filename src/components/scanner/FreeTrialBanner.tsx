export default function FreeTrialBanner() {
  return (
    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-3.5">
      <div className="flex items-start gap-3">
        {/* Alert indicator */}
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
        </div>

        <div>
          <p className="text-xs leading-5 text-slate-400">
            <span className="font-semibold text-red-400">
              Free Trial Active
            </span>

            <span className="mx-2 text-red-500/40">•</span>

            You’re currently using the free trial of AI Market Radar.
            Membership plans will be introduced after the platform is
            officially published.
          </p>
        </div>
      </div>
    </div>
  );
}