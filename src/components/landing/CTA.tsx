import Link from "next/link";

export default function CTA() {
  return (
    <section
      id="docs"
      className="border-t border-white/[0.06] px-6 py-28 lg:px-8"
    >
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-10 text-center sm:p-16">

        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4d61]/10 blur-[100px]" />

        <div className="relative">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d61]">
            Start exploring
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Your market workspace
            <br />
            starts here.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-500">
            Create your account and start building a
            personalized market dashboard.
          </p>

          <Link
            href="/signup"
            className="mt-9 inline-flex rounded-xl bg-[#ff4d61] px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-[#ff4d61]/20 transition hover:-translate-y-1 hover:bg-[#ff6577]"
          >
            Start Free →
          </Link>

        </div>
      </div>
    </section>
  );
}