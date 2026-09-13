"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

type VerificationMethod = "pin" | "otp";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [method, setMethod] =
    useState<VerificationMethod>("pin");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [pin, setPin] = useState("");

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  async function sendOtp() {
    setError("");
    setMessage("");
    setOtpLoading(true);

    try {
      const response = await fetch(
        "/api/security/password/otp",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to send verification code."
        );
        return;
      }

      setOtpSent(true);
      setMessage(
        "Verification code sent to your email."
      );
    } catch {
      setError(
        "Unable to send verification code."
      );
    } finally {
      setOtpLoading(false);
    }
  }

  async function changePassword() {
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      method === "pin" &&
      !/^\d{6}$/.test(pin)
    ) {
      setError(
        "Enter your 6-digit login PIN."
      );
      return;
    }

    if (
      method === "otp" &&
      !/^\d{6}$/.test(otp)
    ) {
      setError(
        "Enter the 6-digit verification code."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/security/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword,
            verificationMethod: method,
            pin:
              method === "pin"
                ? pin
                : undefined,
            otp:
              method === "otp"
                ? otp
                : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to change password."
        );
        return;
      }

      setMessage(
        "Password changed successfully."
      );

      setTimeout(() => {
        router.push("/settings");
      }, 1200);
    } catch {
      setError(
        "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <button
        type="button"
        onClick={() => router.push("/settings")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Settings
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#11151F] p-6 sm:p-8">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <KeyRound
              size={22}
              className="text-rose-400"
            />
          </div>

          <h1 className="text-2xl font-semibold text-white">
            Change Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Create a new password and verify the
            change using your login PIN or email.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              New password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-rose-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirm new password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your new password"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-rose-400/50"
            />
          </div>

          <div className="pt-3">
            <p className="mb-3 text-sm font-medium text-slate-300">
              Verify password change
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMethod("pin");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  method === "pin"
                    ? "border-rose-400/40 bg-rose-400/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <ShieldCheck
                  size={20}
                  className="mb-3 text-emerald-400"
                />

                <p className="text-sm font-medium text-white">
                  Verify with PIN
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Use your 6-digit login PIN.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod("otp");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  method === "otp"
                    ? "border-rose-400/40 bg-rose-400/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <Mail
                  size={20}
                  className="mb-3 text-blue-400"
                />

                <p className="text-sm font-medium text-white">
                  Verify with Email
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Receive a verification code.
                </p>
              </button>
            </div>
          </div>

          {method === "pin" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Login PIN
              </label>

              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(event) =>
                  setPin(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="••••••"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-lg tracking-[0.5em] text-white outline-none transition placeholder:text-slate-700 focus:border-rose-400/50"
              />
            </div>
          )}

          {method === "otp" && (
            <div>
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading}
                className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {otpLoading ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Mail size={15} />
                )}

                {otpSent
                  ? "Resend code"
                  : "Send verification code"}
              </button>

              {otpSent && (
                <input
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
                  placeholder="6-digit code"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-lg tracking-[0.4em] text-white outline-none transition placeholder:text-slate-700 focus:border-rose-400/50"
                />
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300">
              <Check size={16} />
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={changePassword}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            Change password
          </button>
        </div>
      </div>
    </div>
  );
}