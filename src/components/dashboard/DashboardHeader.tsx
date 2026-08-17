"use client";

import { useEffect, useRef, useState } from "react";

import StockSearch from "../stock-search";
// import ThemeToggle from "../ThemeToggle";
import { createClient } from "../../lib/supabase/client";
import ThemeToggle from "../ui/ThemeToggle";
import ProfileMenu from "../../components/profile/ProfileMenu";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  const [email, setEmail] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/user", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setEmail(data.user?.email ?? "");
      } catch {
        // User information is optional
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  }

  const username = email
    ? email.split("@")[0]
    : "Your account";

  const initial = email
    ? email.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090b0f]/90 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-5 sm:px-8 lg:px-10">

        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
          aria-label="Open menu"
          type="button"
        >
          ☰
        </button>

        {/* STOCK SEARCH */}
        <div className="relative hidden max-w-md flex-1 md:block">
          <StockSearch />
        </div>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-3">

          {/* MARKET STATUS */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] font-semibold text-emerald-400">
              Markets active
            </span>
          </div>

          {/* NOTIFICATIONS */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
            aria-label="Notifications"
            type="button"
          >
            ♢

            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#ff4d61]" />
          </button>

          

          {/* THEME TOGGLE */}
          <ThemeToggle />

          {/* PROFILE */}
          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((value) => !value)
              }
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-white/[0.06] hover:bg-white/[0.025]"
            >
              {/* USER INFO */}
              <div className="hidden text-right sm:block">
                <p className="max-w-[160px] truncate text-xs font-semibold text-white">
                  {username}
                </p>

                <p className="max-w-[160px] truncate text-[10px] text-slate-600">
                  {email || "Free workspace"}
                </p>
              </div>

              {/* AVATAR */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4d61]/10 text-sm font-bold text-[#ff6577]">
                {initial}
              </div>

              {/* CHEVRON */}
              <span
                className={`hidden text-[10px] text-slate-600 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101318] shadow-2xl shadow-black/40">

                {/* USER INFORMATION */}
                <div className="border-b border-white/[0.06] p-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff4d61]/10 text-sm font-bold text-[#ff6577]">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {username}
                      </p>

                      <p className="truncate text-xs text-slate-600">
                        {email || "No email"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* MENU */}
                <div className="p-2">

                  {/* SETTINGS */}
                  <a
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.025]">
                      ⚙
                    </span>

                    <span>Settings</span>
                  </a>

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/5 hover:text-red-400"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.025]">
                      ↪
                    </span>

                    <span>Logout</span>
                  </button>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}