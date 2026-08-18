
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const secondaryNavigation = [
  {
    name: "Features",
    href: "/features",
    icon: "✦",
  },
  {
    name: "Docs",
    href: "/docs",
    icon: "▤",
  },
];

const primaryNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "Markets",
    href: "/markets",
    icon: "◈",
  },
  {
    name: "Watchlist",
    href: "/watchlist",
    icon: "☆",
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: "◉",
  },
  {
    name: "AI Scanner",
    href: "/scanner",
    icon: "⌁",
  },
  {
    name: "Signals",
    href: "/signals",
    icon: "↗",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: "▥",
  },
];
export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[#0c0f13] transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* =========================================================
          LOGO
      ========================================================== */}

      <div className="flex h-20 items-center border-b border-white/[0.06] px-6">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="group flex items-center gap-3"
        >
          {/* Logo Mark */}
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute h-4 w-4 rotate-45 rounded-[3px] bg-[#ff4d61] transition-transform duration-300 group-hover:rotate-[135deg]" />

            <span className="absolute h-1.5 w-1.5 rotate-45 rounded-[1px] bg-white" />
          </span>

          {/* Brand */}
          <div>
            <p className="text-sm font-black tracking-tight text-white">
              AI Stock
            </p>

            <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Intelligence
            </p>
          </div>
        </Link>

        {/* Mobile Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-600 transition hover:bg-white/[0.04] hover:text-white lg:hidden"
        >
          ×
        </button>
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {/* Workspace */}
        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Workspace
        </p>

        <div className="space-y-1">
          {primaryNavigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? "bg-[#ff4d61]/10 font-semibold text-[#ff6577]"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                {/* Icon */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition ${
                    active
                      ? "bg-[#ff4d61]/10 text-[#ff6577]"
                      : "bg-white/[0.025] text-slate-600 group-hover:bg-white/[0.05] group-hover:text-slate-300"
                  }`}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span>{item.name}</span>

                {/* Active Indicator */}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff4d61]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Discover */}
        <p className="mb-3 mt-8 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Discover
        </p>

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? "bg-white/[0.04] font-semibold text-white"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                    active
                      ? "bg-white/[0.06] text-white"
                      : "bg-white/[0.025] text-slate-600 group-hover:text-slate-300"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Account */}
        <p className="mb-3 mt-8 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Account
        </p>

        <Link
          href="/settings"
          onClick={onClose}
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
            isActive("/settings")
              ? "bg-white/[0.04] font-semibold text-white"
              : "text-slate-500 hover:bg-white/[0.03] hover:text-white"
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              isActive("/settings")
                ? "bg-white/[0.06] text-white"
                : "bg-white/[0.025] text-slate-600 group-hover:text-slate-300"
            }`}
          >
            ⚙
          </span>

          <span>Settings</span>
        </Link>
      </nav>

      {/* =========================================================
          BOTTOM SECTION
      ========================================================== */}

      <div className="border-t border-white/[0.06] p-4">
        {/* AI Intelligence Card */}
        <div className="mb-3 rounded-xl border border-[#ff4d61]/10 bg-[#ff4d61]/5 p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ff4d61]/10 text-xs text-[#ff6577]">
              ✦
            </span>

            <p className="text-xs font-semibold text-white">
              AI Intelligence
            </p>
          </div>

          <p className="mt-2 text-[10px] leading-4 text-slate-600">
            Unlock deeper market analysis as we build your workspace.
          </p>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-500/5 hover:text-red-400"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.025] transition group-hover:bg-red-500/10">
            ↪
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
