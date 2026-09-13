"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PinPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"loading" | "create" | "verify">(
    "loading"
  );

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkPinStatus() {
      try {
        const response = await fetch("/api/security/pin/status", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to check PIN status.");
          return;
        }

        if (data.hasPin) {
          setMode("verify");
        } else {
          setMode("create");
        }
      } catch {
        setError("Unable to connect to the security service.");
      }
    }

    checkPinStatus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(pin)) {
      setError("PIN must contain exactly 6 digits.");
      return;
    }

    if (mode === "create" && pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/security/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: mode === "create" ? "create" : "verify",
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the security service.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0f] text-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff4d61]" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090b0f] px-4 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 shadow-2xl shadow-black/30 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4d61]/20 bg-[#ff4d61]/[0.08]">
            {mode === "create" ? (
              <KeyRound className="h-5 w-5 text-[#ff4d61]" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-[#ff4d61]" />
            )}
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff4d61]">
              {mode === "create"
                ? "Security setup"
                : "Security verification"}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {mode === "create"
                ? "Create your login PIN"
                : "Enter your login PIN"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {mode === "create"
                ? "Create a 6-digit PIN that will be required when accessing your account."
                : "Enter your 6-digit PIN to continue to your workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="pin"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                {mode === "create" ? "New PIN" : "PIN"}
              </label>

              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={pin}
                onChange={(event) =>
                  setPin(
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-white outline-none transition focus:border-[#ff4d61]/50"
                placeholder="••••••"
                autoFocus
              />
            </div>

            {mode === "create" && (
              <div>
                <label
                  htmlFor="confirmPin"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm PIN
                </label>

                <input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(event) =>
                    setConfirmPin(
                      event.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-white outline-none transition focus:border-[#ff4d61]/50"
                  placeholder="••••••"
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff4d61] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#ff6577] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {mode === "create" ? "Create PIN" : "Verify PIN"}
            </button>
          </form>

          {mode === "verify" && (
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="mt-5 w-full text-center text-sm text-slate-500 transition hover:text-white"
            >
              Forgot PIN?
            </button>
          )}
        </div>
      </div>
    </main>
  );
}