"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthShell({
  children,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090b0f] text-white">

      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4d61]/10 blur-[140px]" />

      {/* Top logo */}
      <div className="absolute left-6 top-6 sm:left-10 sm:top-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute h-3.5 w-3.5 rotate-45 rounded-[2px] bg-[#ff4d61] transition group-hover:scale-110" />

            <span className="absolute h-1.5 w-1.5 rotate-45 rounded-[1px] bg-white" />
          </span>

          <span className="text-lg font-bold tracking-tight">
            AI Stock
          </span>
        </Link>
      </div>

      {/* Back */}
      <Link
        href="/"
        className="absolute right-6 top-7 text-sm text-slate-500 transition hover:text-white sm:right-10"
      >
        ← Back
      </Link>

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center px-5 py-24">

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8 text-center">

            <div className="mb-5 inline-flex items-center rounded-full border border-[#ff4d61]/20 bg-[#ff4d61]/5 px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff6577]">
                AI Market Intelligence
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {title}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              {description}
            </p>

          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#101318]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">

            {children}

          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-[11px] leading-5 text-slate-700">
            AI Stock provides informational and educational
            market analysis. It is not financial advice.
          </p>

        </div>
      </div>
    </main>
  );
}