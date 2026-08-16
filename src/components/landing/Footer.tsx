import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-10 lg:px-8">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute h-3 w-3 rotate-45 rounded-[2px] bg-[#ff4d61]" />
          </span>

          <span className="text-sm font-bold text-slate-300">
            AI Stock
          </span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-600">

          <Link
            href="/#about"
            className="transition hover:text-slate-300"
          >
            About
          </Link>

          <Link
            href="/#features"
            className="transition hover:text-slate-300"
          >
            Features
          </Link>

          <Link
            href="/#providers"
            className="transition hover:text-slate-300"
          >
            Providers
          </Link>

          <Link
            href="/#why"
            className="transition hover:text-slate-300"
          >
            Why
          </Link>

          <Link
            href="/#docs"
            className="transition hover:text-slate-300"
          >
            Docs
          </Link>

        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-700">
          © 2026 AI Stock Platform
        </p>

      </div>

    </footer>
  );
}