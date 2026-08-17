"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

interface ProfileMenuProps {
  email: string;
  name?: string | null;
}

export default function ProfileMenu({
  email,
  name,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    name?.trim() || email.split("@")[0];

  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-2 py-1.5 transition hover:bg-white/[0.05]"
      >
        {/* Avatar */}
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4d61]/10 text-xs font-bold text-[#ff6577]">
          {initial}
        </span>

        {/* User Info */}
        <span className="hidden text-left sm:block">
          <span className="block max-w-[150px] truncate text-xs font-semibold text-white">
            {displayName}
          </span>

          <span className="block max-w-[150px] truncate text-[10px] text-slate-600">
            {email}
          </span>
        </span>

        {/* Chevron */}
        <span
          className={`hidden text-xs text-slate-600 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        >
          ↓
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101318] shadow-2xl shadow-black/40">
          {/* Profile Header */}
          <div className="border-b border-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4d61]/10 text-sm font-bold text-[#ff6577]">
                {initial}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>

                <p className="truncate text-xs text-slate-600">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="p-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.025]">
                ⚙
              </span>

              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/5 hover:text-red-400"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.025]">
                ↪
              </span>

              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}