export default function Features() {
  const features = [
    {
      number: "01",
      title: "Market Data",
      description:
        "Track major indices and individual stocks through a normalized market-data layer.",
    },
    {
      number: "02",
      title: "Technical Analysis",
      description:
        "Analyze price action, momentum and technical indicators to understand market structure.",
    },
    {
      number: "03",
      title: "AI Analysis",
      description:
        "Turn market information into structured AI-assisted insights and educational analysis.",
    },
    {
      number: "04",
      title: "Watchlists",
      description:
        "Keep the stocks you care about close and monitor their latest market performance.",
    },
    {
      number: "05",
      title: "Stock Intelligence",
      description:
        "Move from a market snapshot into detailed stock-level analysis and signals.",
    },
    {
      number: "06",
      title: "Provider Ready",
      description:
        "Provider abstractions allow market-data and AI providers to evolve without rewriting the application.",
    },
  ];

  return (
    <section
      id="features"
      className="border-t border-white/[0.06] px-6 py-28 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d61]">
          Features
        </p>

        <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Market intelligence
          <br />
          without the noise.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
          Everything is designed around giving you a clearer
          view of the market instead of overwhelming you with
          disconnected data.
        </p>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <FeatureCard
              key={feature.number}
              {...feature}
            />
          ))}

        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#ff4d61]/25 hover:bg-white/[0.035]">

      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#ff4d61]/5 blur-2xl transition group-hover:bg-[#ff4d61]/10" />

      <span className="relative font-mono text-xs text-[#ff4d61]">
        {number}
      </span>

      <h3 className="relative mt-8 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="relative mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="relative mt-8 text-xs font-semibold text-slate-600 transition group-hover:text-[#ff6577]">
        Explore →
      </div>

    </div>
  );
}