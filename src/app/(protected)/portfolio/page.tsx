"use client";

import Link from "next/link";
import {
ArrowLeft,
ArrowUpRight,
BarChart3,
BriefcaseBusiness,
ChevronRight,
CircleDollarSign,
LockKeyhole,
PieChart,
ShieldCheck,
Sparkles,
TrendingUp,
} from "lucide-react";

const previewStats = [
{
label: "Portfolio value",
value: "₹12,84,650",
change: "+8.42%",
},
{
label: "Invested",
value: "₹11,85,200",
change: "+₹99,450",
},
];

const features = [
{
icon: PieChart,
title: "Portfolio allocation",
description:
"Understand where your capital is concentrated across sectors and positions.",
},
{
icon: TrendingUp,
title: "Performance intelligence",
description:
"Track returns, P&L and performance trends without leaving the platform.",
},
{
icon: ShieldCheck,
title: "Risk intelligence",
description:
"Identify concentration, volatility and portfolio-level risk factors.",
},
{
icon: Sparkles,
title: "AI portfolio insights",
description:
"Get contextual AI analysis across your holdings and portfolio structure.",
},
];

export default function PortfolioPage() {
return ( <div className="relative min-h-[calc(100vh-120px)] overflow-hidden">
{/* Ambient background */} <div className="pointer-events-none absolute inset-0"> <div className="absolute left-[42%] top-[-220px] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-blue-500/[0.055] blur-[140px]" /> <div className="absolute right-[-160px] top-[30%] h-[420px] w-[420px] rounded-full bg-purple-500/[0.035] blur-[130px]" /> <div className="absolute bottom-[-200px] left-[20%] h-[400px] w-[600px] rounded-full bg-emerald-500/[0.025] blur-[130px]" /> </div>

```
  <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
    {/* Top navigation */}
    <div className="mb-10 flex items-center justify-between">
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Dashboard
      </Link>

      <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 backdrop-blur-xl">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.7)]" />
        In development
      </div>
    </div>

    {/* Hero */}
    <section className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      {/* Copy */}
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          Portfolio Intelligence
        </div>

        <h1 className="text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white">
          Your portfolio.
          <span className="mt-2 block text-slate-500">
            Understood.
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
          A complete portfolio intelligence workspace is being built
          inside the platform — combining performance, allocation, risk
          and AI-powered insights.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/markets"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#07090E] transition-all duration-300 hover:bg-slate-200"
          >
            Explore Markets
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-5 py-3 text-sm font-medium text-slate-300 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Product preview */}
      <div className="relative">
        <div className="absolute -inset-8 rounded-[40px] bg-blue-500/[0.035] blur-3xl" />

        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#0D1119]/95 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {/* Browser-style header */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
            </div>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
              <LockKeyhole className="h-3 w-3" />
              Portfolio
            </div>

            <div className="h-6 w-6 rounded-full border border-white/10 bg-white/[0.04]" />
          </div>

          <div className="p-5 sm:p-7">
            {/* Preview heading */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                  Total portfolio value
                </p>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  ₹12,84,650
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +8.42%
                  <span className="text-slate-600">all time</span>
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.06]">
                <CircleDollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            {/* Fake chart */}
            <div className="relative mt-8 h-40 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div className="absolute inset-x-0 bottom-8 top-8 flex flex-col justify-between px-4">
                <div className="border-t border-white/[0.045]" />
                <div className="border-t border-white/[0.045]" />
                <div className="border-t border-white/[0.045]" />
              </div>

              <svg
                viewBox="0 0 700 180"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="portfolioArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3B82F6"
                      stopOpacity="0.16"
                    />
                    <stop
                      offset="100%"
                      stopColor="#3B82F6"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0 145 C55 138 80 142 125 120 C165 102 188 110 225 95 C270 77 292 90 330 72 C370 53 402 69 440 50 C485 28 515 45 550 32 C595 15 630 28 700 12 L700 180 L0 180 Z"
                  fill="url(#portfolioArea)"
                />

                <path
                  d="M0 145 C55 138 80 142 125 120 C165 102 188 110 225 95 C270 77 292 90 330 72 C370 53 402 69 440 50 C485 28 515 45 550 32 C595 15 630 28 700 12"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
              </svg>

              <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] text-slate-700">
                <span>JAN</span>
                <span>MAR</span>
                <span>MAY</span>
                <span>JUL</span>
                <span>SEP</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {previewStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-400">
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom preview row */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-400/[0.08]">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    AI Portfolio Insight
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Contextual analysis across holdings
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-700" />
            </div>
          </div>
        </div>

        {/* Floating status */}
        <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#11151F]/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
              Intelligence layer
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-300">
              Coming soon
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Divider */}
    <div className="my-20 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

    {/* Feature section */}
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            What&apos;s coming
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Built for the complete picture.
          </h2>
        </div>

        <p className="max-w-md text-sm leading-6 text-slate-600">
          Portfolio Intelligence will connect your holdings with the
          broader market intelligence already available on the platform.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group bg-[#0B0E14] p-6 transition-colors duration-300 hover:bg-[#11151F]"
            >
              <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] transition-colors group-hover:border-blue-400/20 group-hover:bg-blue-400/[0.05]">
                <Icon
                  className="h-4.5 w-4.5 text-slate-500 transition-colors group-hover:text-blue-400"
                  strokeWidth={1.6}
                />
              </div>

              <h3 className="text-sm font-medium text-slate-200">
                {feature.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="mt-16 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.035] to-transparent">
      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-72 w-72 rounded-full bg-blue-500/[0.05] blur-[100px]" />

        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
              While you wait
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Explore the intelligence already available.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Scan markets, analyze individual stocks and monitor signals
              while Portfolio Intelligence is being developed.
            </p>
          </div>

          <Link
            href="/scanner"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.045] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white"
          >
            Open AI Scanner
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  </div>
</div>

);
}
