"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "otp";

export default function ForgotPinPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your account email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/pin/forgot/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to send verification code.");
        return;
      }

      setEmail(normalizedEmail);
      setStep("otp");
      setSuccess("Verification code sent to your email.");
    } catch {
      setError("Unable to connect to the security service.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    if (!/^\d{6}$/.test(newPin)) {
      setError("New PIN must contain exactly 6 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/pin/forgot/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token: otp,
            newPin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to change PIN.");
        return;
      }

      setSuccess("Your PIN has been changed successfully.");

      setTimeout(() => {
        router.replace("/pin");
      }, 800);
    } catch {
      setError("Unable to connect to the security service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090b0f] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full">
          <Link
            href="/settings"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4d61]/20 bg-[#ff4d61]/[0.08]">
              {step === "email" ? (
                <Mail className="h-5 w-5 text-[#ff4d61]" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-[#ff4d61]" />
              )}
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#ff4d61]">
              Account security
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Forgot your PIN?
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Verify your account email and create a new 6-digit
              login PIN.
            </p>

            {step === "email" ? (
              <form onSubmit={requestOtp} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Account email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-[#ff4d61]/50"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff4d61] px-5 py-3.5 text-sm font-bold transition hover:bg-[#ff6577] disabled:opacity-60"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Send verification code
                </button>
              </form>
            ) : (
              <form onSubmit={resetPin} className="mt-8 space-y-5">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs text-slate-500">
                    Code sent to
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {email}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-xl tracking-[0.4em] text-white outline-none focus:border-[#ff4d61]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPin"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    New PIN
                  </label>

                  <input
                    id="newPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={newPin}
                    onChange={(event) =>
                      setNewPin(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-white outline-none focus:border-[#ff4d61]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPin"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm new PIN
                  </label>

                  <input
                    id="confirmPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(event) =>
                      setConfirmPin(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-white outline-none focus:border-[#ff4d61]/50"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff4d61] px-5 py-3.5 text-sm font-bold transition hover:bg-[#ff6577] disabled:opacity-60"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Change PIN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                    setSuccess("");
                  }}
                  className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 transition hover:text-white"
                >
                  <KeyRound className="h-4 w-4" />
                  Use a different email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}