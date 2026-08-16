export default function Providers() {
  return (
    <section
      id="providers"
      className="border-t border-white/[0.06] px-6 py-28 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.5fr]">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d61]">
              Providers
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Built to evolve.
            </h2>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-slate-500">
            AI Stock uses abstraction layers so the application
            is not tightly coupled to a single market-data,
            AI or infrastructure provider.
          </p>

        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">

          <ProviderCard
            category="MARKET DATA"
            name="Yahoo Finance"
            description="Current beta market-data provider."
          />

          <ProviderCard
            category="AI ENGINE"
            name="Groq"
            description="Fast AI inference for market analysis."
          />

          <ProviderCard
            category="DATABASE + AUTH"
            name="Supabase"
            description="Authentication and PostgreSQL infrastructure."
          />

        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-300">
                Provider abstraction
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Swap providers without changing the application layer.
              </p>
            </div>

            <div className="font-mono text-xs text-[#ff4d61]">
              Port → Adapter → Provider
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function ProviderCard({
  category,
  name,
  description,
}: {
  category: string;
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 transition hover:border-white/[0.13]">

      <p className="text-[10px] font-bold tracking-[0.2em] text-slate-600">
        {category}
      </p>

      <div className="mt-6 flex items-center gap-3">

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-bold text-[#ff4d61]">
          ◆
        </span>

        <h3 className="text-lg font-bold text-white">
          {name}
        </h3>

      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}