"use client";

import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  const [email, setEmail] =
    useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/user",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data =
          await response.json();

        setEmail(
          data.user?.email ?? ""
        );
      } catch {
        // User information is optional
      }
    }

    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090b0f]/90 backdrop-blur-xl">

      <div className="flex h-20 items-center gap-4 px-5 sm:px-8 lg:px-10">

        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-400 hover:text-white lg:hidden"
        >
          ☰
        </button>

        {/* Search */}
        <div className="relative hidden max-w-md flex-1 md:block">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search stocks, indices..."
            className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-700 focus:border-white/[0.12]"
          />

          <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.06] px-2 py-1 text-[9px] text-slate-700 lg:block">
            /
          </span>

        </div>

        <div className="ml-auto flex items-center gap-3">

          {/* Market status */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 sm:flex">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] font-semibold text-emerald-400">
              Markets active
            </span>

          </div>

          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-500 transition hover:text-white">
            ♢

            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#ff4d61]" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="max-w-[160px] truncate text-xs font-semibold text-white">
                {email || "Your account"}
              </p>

              <p className="text-[10px] text-slate-600">
                Free workspace
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4d61]/10 text-sm font-bold text-[#ff6577]">
              {email
                ? email
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}