"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
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

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[#0c0f13] transition-transform duration-300 lg:translate-x-0 ${
        open
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >

      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/[0.06] px-6">

        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >

          <span className="relative flex h-8 w-8 items-center justify-center">

            <span className="absolute h-3.5 w-3.5 rotate-45 rounded-[2px] bg-[#ff4d61]" />

            <span className="absolute h-1.5 w-1.5 rotate-45 rounded-[1px] bg-white" />

          </span>

          <div>
            <p className="text-sm font-black tracking-tight text-white">
              AI Stock
            </p>

            <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Intelligence
            </p>
          </div>

        </Link>

        <button
          onClick={onClose}
          className="ml-auto text-slate-600 hover:text-white lg:hidden"
        >
          ×
        </button>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">

        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Workspace
        </p>

        <div className="space-y-1">

          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[#ff4d61]/10 font-semibold text-[#ff6577]"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-white"
                }`}
              >

                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                    active
                      ? "bg-[#ff4d61]/10"
                      : "bg-white/[0.025]"
                  }`}
                >
                  {item.icon}
                </span>

                {item.name}

              </Link>
            );
          })}

        </div>

        <p className="mb-3 mt-8 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Account
        </p>

        <Link
          href="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/[0.03] hover:text-white ${
            pathname.startsWith("/settings")
              ? "bg-white/[0.04] text-white"
              : ""
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.025]">
            ⚙
          </span>

          Settings
        </Link>

      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-4">

        <div className="mb-3 rounded-xl border border-[#ff4d61]/10 bg-[#ff4d61]/5 p-3">

          <p className="text-xs font-semibold text-white">
            AI Intelligence
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-600">
            Unlock deeper market analysis
            as we build your workspace.
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-500/5 hover:text-red-400"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.025]">
            ↪
          </span>

          Logout
        </button>

      </div>

    </aside>
  );
}