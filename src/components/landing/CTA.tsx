
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

          {/* Documentation Highlight */}
          <div className="mt-9 flex justify-center">
            <Link
              href="/docs"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#ff4d61]/30 bg-[#ff4d61]/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff4d61]/60 hover:bg-[#ff4d61]/[0.10] hover:shadow-[0_0_30px_rgba(255,77,97,0.12)]"
            >
              {/* Hover sweep */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#ff4d61]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d61] shadow-[0_0_8px_rgba(255,77,97,0.8)]" />

                <span>
                  Read the full documentation
                </span>

                <span className="text-[#ff4d61] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </div>

          {/* Primary CTA */}
          <Link
            href="/signup"
            className="mt-5 inline-flex rounded-xl bg-[#ff4d61] px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-[#ff4d61]/20 transition hover:-translate-y-1 hover:bg-[#ff6577]"
          >
            Start Free →
          </Link>
        </div>
      </div>
    </section>
  );
}
