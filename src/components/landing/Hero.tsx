import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 pb-24 pt-36 lg:px-8">

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#ff4d61]/10 blur-[140px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-16 lg:grid-cols-2">

        {/* Left */}
        <div>

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ff4d61]/20 bg-[#ff4d61]/5 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4d61]" />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff6577]">
              AI-Powered Market Intelligence
            </span>
          </div>

          <h1 className="max-w-3xl text-6xl font-black leading-[0.94] tracking-[-0.05em] text-slate-100 sm:text-7xl lg:text-8xl">
            Understand
            <br />
            the market.
            <br />
            <span className="text-[#ff4d61]">
              Before you trade.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400 sm:text-xl">
            AI-powered stock analysis combining market
            data, technical indicators and intelligent
            insights in one powerful workspace.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">

            <Link
              href="/signup"
              className="rounded-xl bg-[#ff4d61] px-7 py-4 text-center text-sm font-bold text-white shadow-2xl shadow-[#ff4d61]/20 transition hover:-translate-y-1 hover:bg-[#ff6577]"
            >
              Start Free →
            </Link>

            <Link
              href="/#features"
              className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-7 py-4 text-center text-sm font-semibold text-slate-200 transition hover:border-white/[0.2] hover:bg-white/[0.05]"
            >
              Explore Features
            </Link>

          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm">

            <Stat
              value="AI"
              label="powered analysis"
            />

            <Stat
              value="Live"
              label="market data"
            />

            <Stat
              value="Technical"
              label="signals"
            />

          </div>

        </div>

        {/* Terminal */}
        <div className="relative">

          <div className="absolute -inset-8 rounded-[40px] bg-[#ff4d61]/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#15191f] shadow-2xl shadow-black/50">

            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/[0.07] bg-[#1b2029] px-5 py-4">

              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />

              <span className="ml-3 font-mono text-xs text-slate-500">
                ai-stock — signal-engine
              </span>

            </div>

            {/* Terminal */}
            <div className="space-y-6 p-7 font-mono text-sm">

              <div>
                <span className="text-[#ff4d61]">$</span>

                <span className="ml-2 text-slate-300">
                  ai-stock scan --market india
                </span>
              </div>

              <div className="space-y-3 border-l border-white/[0.08] pl-5">

                <MarketRow
                  name="NIFTY 50"
                  value="+0.42%"
                  positive
                />

                <MarketRow
                  name="SENSEX"
                  value="+0.18%"
                  positive
                />

                <MarketRow
                  name="RELIANCE"
                  value="-0.53%"
                />

              </div>

              <div className="border-t border-white/[0.07] pt-5">

                <p className="mb-4 text-xs uppercase tracking-widest text-slate-600">
                  AI Signal Analysis
                </p>

                <div className="space-y-4">

                  <Signal
                    label="Technical"
                    value={82}
                  />

                  <Signal
                    label="Fundamental"
                    value={88}
                  />

                  <Signal
                    label="Sentiment"
                    value={74}
                  />

                </div>

              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs uppercase tracking-widest text-slate-500">
                    AI SIGNAL
                  </span>

                  <span className="font-bold text-emerald-400">
                    BULLISH
                  </span>

                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Technical momentum and market structure
                  currently indicate a positive outlook.
                </p>

              </div>

            </div>
          </div>

          <p className="mt-5 text-center font-mono text-xs text-slate-600">
            Market Data → Analysis → AI Intelligence
          </p>

        </div>

      </div>
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <span className="font-bold text-[#ff4d61]">
        {value}
      </span>

      <span className="ml-2 text-slate-500">
        {label}
      </span>
    </div>
  );
}

function MarketRow({
  name,
  value,
  positive = false,
}: {
  name: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex justify-between gap-10">
      <span className="text-slate-500">
        {name}
      </span>

      <span
        className={
          positive
            ? "text-emerald-400"
            : "text-red-400"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Signal({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4">

      <span className="w-24 text-xs text-slate-500">
        {label}
      </span>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-[#ff4d61]"
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <span className="w-7 text-right text-xs font-bold text-slate-300">
        {value}
      </span>

    </div>
  );
}