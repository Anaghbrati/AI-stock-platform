"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "../../components/auth/AuthShell";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setError(error.message);
        return;
      }

      const redirect =
        new URLSearchParams(
            window.location.search
        ).get("redirect") || "/dashboard";

    router.push(redirect);
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        setError(error.message);
      }
    } catch (error) {
      console.error(error);

      setError(
        "Unable to continue with Google."
      );

      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to continue to your AI-powered market workspace."
    >
      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >

        {/* Email */}
        <div>
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
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-[#ff4d61]/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-[#ff4d61]/10"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">

            <label
              htmlFor="password"
              className="text-xs font-semibold text-slate-400"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs text-[#ff6577] transition hover:text-[#ff8491]"
            >
              Forgot password?
            </Link>

          </div>

          <div className="relative">

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-[#ff4d61]/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-[#ff4d61]/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:text-white"
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#ff4d61] text-sm font-bold text-white shadow-lg shadow-[#ff4d61]/20 transition hover:bg-[#ff6577] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Signing in...
            </span>
          ) : (
            "Sign in"
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
        onClick={handleGoogleLogin}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] text-sm font-semibold text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white disabled:opacity-60"
      >
        {googleLoading ? (
          <>
            <Spinner />
            Connecting...
          </>
        ) : (
          <>
            <span className="text-base font-bold">
              G
            </span>
            Continue with Google
          </>
        )}
      </button>

      {/* Signup */}
      <p className="mt-7 text-center text-xs text-slate-600">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#ff6577] transition hover:text-[#ff8491]"
        >
          Start free
        </Link>
      </p>
    </AuthShell>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}