"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);

    if (nextDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    setUser(null);
    setMenuOpen(false);

    window.location.href = "/";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.07] bg-[#090b0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute h-3.5 w-3.5 rotate-45 rounded-[2px] bg-[#ff4d61] transition duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#ff4d61]/40" />

            <span className="absolute h-1.5 w-1.5 rotate-45 rounded-[1px] bg-white/90" />
          </span>

          <span className="text-[19px] font-bold tracking-tight text-white">
            AI Stock
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">

          <Link
            href="/#about"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            About
          </Link>

          <Link
            href="/#providers"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Providers
          </Link>

          <Link
            href="/#features"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Features
          </Link>

          <Link
            href="/#why"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Why
          </Link>

          <Link
            href="/#docs"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Docs
          </Link>

        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 lg:flex">

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
          >
            {darkMode ? "☀" : "☾"}
          </button>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-[#ff4d61] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ff4d61]/20 transition hover:-translate-y-0.5 hover:bg-[#ff6577]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              className="rounded-xl bg-[#ff4d61] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ff4d61]/20 transition hover:-translate-y-0.5 hover:bg-[#ff6577]"
            >
              Start Free
            </Link>
          )}

        </div>

        {/* Mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-slate-300 lg:hidden"
        >
          {menuOpen ? (
            <span className="text-2xl">×</span>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="h-[1.5px] w-5 bg-slate-300" />
              <span className="h-[1.5px] w-5 bg-slate-300" />
              <span className="h-[1.5px] w-5 bg-slate-300" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/[0.07] bg-[#090b0f] lg:hidden">
          <div className="mx-auto max-w-7xl px-5 py-6">

            <nav className="flex flex-col">

              {[
                ["About", "#about"],
                ["Providers", "#providers"],
                ["Features", "#features"],
                ["Why", "#why"],
                ["Docs", "#docs"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="border-b border-white/[0.06] py-4 text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}

            </nav>

            <div className="mt-6 flex flex-col gap-3">

              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-semibold text-slate-300"
              >
                {darkMode ? "☀  Light Mode" : "☾  Dark Mode"}
              </button>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="rounded-xl border border-white/[0.08] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-[#ff4d61] px-4 py-3 text-sm font-bold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="rounded-xl bg-[#ff4d61] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Start Free
                </Link>
              )}

            </div>
          </div>
        </div>
      )}
    </header>
  );
}