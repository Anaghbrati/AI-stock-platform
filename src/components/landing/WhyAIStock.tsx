export default function WhyAIStock() {
  return (
    <section
      id="why"
      className="relative overflow-hidden border-t border-white/[0.06] px-6 py-32 lg:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4d61]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl text-center">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d61]">
          Why AI Stock
        </p>

        <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
          Data is useful.
          <br />
          <span className="text-slate-500">
            Context makes it actionable.
          </span>
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-500">
          AI Stock brings market data, technical analysis,
          watchlists and AI-assisted reasoning together in
          one focused workspace.
        </p>

        <div className="mx-auto mt-14 grid max-w-3xl gap-4 text-left sm:grid-cols-3">

          <Reason
            number="01"
            title="Observe"
            text="See what the market is doing."
          />

          <Reason
            number="02"
            title="Analyze"
            text="Understand the signals behind the movement."
          />

          <Reason
            number="03"
            title="Decide"
            text="Make your own informed decision."
          />

        </div>

        <p className="mx-auto mt-12 max-w-xl text-xs leading-5 text-slate-700">
          AI-generated analysis is informational and educational.
          It does not guarantee future market performance or
          constitute financial advice.
        </p>

      </div>
    </section>
  );
}

function Reason({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">

      <span className="font-mono text-xs text-[#ff4d61]">
        {number}
      </span>

      <h3 className="mt-6 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}