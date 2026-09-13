
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "../../components/auth/AuthShell";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!acceptedDisclaimer) {
      setError(
        "Please acknowledge the educational-use and risk disclosure before creating your account."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      /*
       * If email confirmation is disabled,
       * Supabase may return a session immediately.
       */
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(
        "Account created. Check your email to confirm your account."
      );
    } catch (error) {
      console.error(error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setSuccess("");

    if (!acceptedDisclaimer) {
      setError(
        "Please acknowledge the educational-use and risk disclosure before continuing with Google."
      );
      return;
    }

    setGoogleLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error(error);

      setError("Unable to continue with Google.");
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Start for free."
      description="Create your account and build your personalized market workspace."
    >
      <form onSubmit={handleSignup} className="space-y-5">
        {/* Email */}
        <div className="animate-[fadeSlideUp_0.45s_ease-out]">
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-700 focus:border-[#ff4d61]/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-[#ff4d61]/10"
          />
        </div>

        {/* Password */}
        <div className="animate-[fadeSlideUp_0.5s_ease-out]">
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 pr-16 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-700 focus:border-[#ff4d61]/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-[#ff4d61]/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-white active:scale-95"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password strength */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              password
                ? "mt-3 max-h-20 opacity-100"
                : "mt-0 max-h-0 opacity-0"
            }`}
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => {
                const active = password.length >= level * 3;

                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      active
                        ? "bg-[#ff4d61] shadow-[0_0_10px_rgba(255,77,97,0.35)]"
                        : "bg-white/[0.07]"
                    }`}
                  />
                );
              })}
            </div>

            <p className="mt-2 text-[10px] text-slate-600">
              Use at least 6 characters.
            </p>
          </div>
        </div>

        {/* Confirm password */}
        <div className="animate-[fadeSlideUp_0.55s_ease-out]">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            Confirm password
          </label>

          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-700 focus:border-[#ff4d61]/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-[#ff4d61]/10"
          />
        </div>

        {/* Educational disclosure */}
        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
            acceptedDisclaimer
              ? "border-[#ff4d61]/30 bg-[#ff4d61]/[0.045] shadow-[0_0_35px_rgba(255,77,97,0.07)]"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.13]"
          }`}
        >
          {/* Animated accent */}
          <div
            className={`absolute left-0 top-0 h-full w-[2px] transition-all duration-500 ${
              acceptedDisclaimer
                ? "bg-[#ff4d61] shadow-[0_0_14px_rgba(255,77,97,0.7)]"
                : "bg-transparent"
            }`}
          />

          <label
            htmlFor="educational-consent"
            className="flex cursor-pointer gap-3.5 p-4"
          >
            {/* Custom checkbox */}
            <div className="relative mt-0.5 shrink-0">
              <input
                id="educational-consent"
                type="checkbox"
                checked={acceptedDisclaimer}
                onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                className="peer sr-only"
              />

              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-300 ${
                  acceptedDisclaimer
                    ? "scale-105 border-[#ff4d61] bg-[#ff4d61] shadow-[0_0_14px_rgba(255,77,97,0.3)]"
                    : "border-white/15 bg-white/[0.025] group-hover:border-white/25"
                }`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`h-3.5 w-3.5 text-white transition-all duration-300 ${
                    acceptedDisclaimer
                      ? "scale-100 opacity-100"
                      : "scale-50 opacity-0"
                  }`}
                >
                  <path
                    d="M4 10.5L8 14L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Disclosure text */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  Educational use & risk disclosure
                </span>

                <span className="rounded-full border border-[#ff4d61]/20 bg-[#ff4d61]/[0.06] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#ff6577]">
                  Required
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-[1.7] text-slate-500">
                I understand that this platform provides market data,
                technical analysis, AI-assisted analysis, signals, and
                educational information for informational and educational
                purposes only. It does not promote, endorse, recommend, or
                solicit the purchase or sale of any particular stock,
                security, or financial product.
              </p>

              <p className="mt-2 text-[10px] leading-[1.7] text-slate-600">
                I understand that this information is not personalized
                investment advice and that financial markets involve risk.
                I am responsible for my own investment decisions and research.
              </p>

              <div
                className={`mt-3 flex items-center gap-2 text-[9px] font-medium transition-all duration-300 ${
                  acceptedDisclaimer
                    ? "translate-x-0 text-emerald-400 opacity-100"
                    : "translate-x-[-4px] text-slate-700 opacity-0"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.6)]" />
                Disclosure acknowledged
              </div>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-[fadeSlideUp_0.25s_ease-out] rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-xs leading-5 text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="animate-[fadeSlideUp_0.25s_ease-out] rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3 text-xs leading-5 text-emerald-400">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !acceptedDisclaimer}
          className={`group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white transition-all duration-300 ${
            acceptedDisclaimer
              ? "bg-[#ff4d61] shadow-lg shadow-[#ff4d61]/20 hover:-translate-y-0.5 hover:bg-[#ff6577] hover:shadow-[#ff4d61]/30 active:translate-y-0"
              : "cursor-not-allowed bg-white/[0.06] text-slate-600"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {/* Button shine */}
          {acceptedDisclaimer && !loading && (
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          )}

          {loading ? (
            <span className="relative flex items-center gap-2">
              <Spinner />
              Creating account...
            </span>
          ) : (
            <span className="relative flex items-center gap-2">
              Create free account
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.07]" />

        <span className="text-[10px] uppercase tracking-widest text-slate-700">
          OR
        </span>

        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      {/* Google */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleSignup}
        className={`group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border text-sm font-semibold transition-all duration-300 ${
          acceptedDisclaimer
            ? "border-white/[0.08] bg-white/[0.025] text-slate-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white active:translate-y-0"
            : "cursor-not-allowed border-white/[0.05] bg-white/[0.015] text-slate-700"
        } disabled:opacity-60`}
      >
        {acceptedDisclaimer && !googleLoading && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}

        {googleLoading ? (
          <>
            <Spinner />
            Connecting...
          </>
        ) : (
          <>
            <span className="relative text-base font-bold">G</span>

            <span className="relative">Continue with Google</span>
          </>
        )}
      </button>

      {/* Consent reminder */}
      {!acceptedDisclaimer && (
        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-slate-700">
          <span className="h-1 w-1 rounded-full bg-[#ff4d61]/60" />
          Acknowledgement is required to continue
        </div>
      )}

      {/* Login */}
      <p className="mt-7 text-center text-xs text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#ff6577] transition-colors duration-300 hover:text-[#ff8491]"
        >
          Sign in
        </Link>
      </p>

      {/* Inline animation styles */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </AuthShell>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}
