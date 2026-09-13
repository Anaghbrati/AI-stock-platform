"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldAlert,
  Trash2,
} from "lucide-react";

type Step = 1 | 2 | 3;

export default function DeleteAccountPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  const [phrase, setPhrase] = useState("");
  const [confirmationPhrase, setConfirmationPhrase] =
    useState("");

  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");

  const [loadingPhrase, setLoadingPhrase] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * --------------------------------------------------
   * LOAD CONFIRMATION PHRASE
   * --------------------------------------------------
   */

  async function generatePhrase() {
    try {
      setLoadingPhrase(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/security/delete-account",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to start account deletion."
        );
        return;
      }

      setPhrase(data.phrase);
      setConfirmationPhrase("");
      setStep(1);
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoadingPhrase(false);
    }
  }

  useEffect(() => {
    generatePhrase();
  }, []);

  /*
   * --------------------------------------------------
   * STEP 1
   *
   * Verify confirmation phrase locally.
   * The server verifies it again during deletion.
   * --------------------------------------------------
   */

  function handlePhraseSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!confirmationPhrase.trim()) {
      setError(
        "Please enter the confirmation phrase."
      );
      return;
    }

    if (
      confirmationPhrase.trim() !== phrase
    ) {
      setError(
        "The confirmation phrase does not match."
      );
      return;
    }

    setStep(2);
  }

  /*
   * --------------------------------------------------
   * STEP 2
   *
   * PIN is verified only when the final deletion
   * request is submitted.
   * --------------------------------------------------
   */

  function handlePinSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(pin)) {
      setError(
        "PIN must contain exactly 6 digits."
      );
      return;
    }

    setStep(3);
  }

  /*
   * --------------------------------------------------
   * SEND EMAIL OTP
   *
   * We use Supabase's passwordless email OTP.
   *
   * The current authenticated email is handled by
   * the server, so the browser does not need to
   * submit the email address.
   * --------------------------------------------------
   */

  async function sendOtp() {
    try {
      setSendingOtp(true);
      setError("");
      setSuccess("");

      /*
       * Ask the server to send the OTP.
       *
       * We intentionally use a dedicated endpoint
       * instead of exposing the user's email in the
       * client.
       */

      const response = await fetch(
        "/api/security/delete-account/request-otp",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
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

      setSuccess(
        "A verification code has been sent to your email."
      );
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setSendingOtp(false);
    }
  }

  /*
   * --------------------------------------------------
   * FINAL DELETE
   * --------------------------------------------------
   */

  async function handleDelete(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Verification code must contain 6 digits."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/security/delete-account",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmationPhrase:
              confirmationPhrase.trim(),
            pin,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to delete your account."
        );
        return;
      }

      setSuccess(
        "Your account has been permanently deleted."
      );

      /*
       * Give the user a moment to see the success
       * state, then leave the protected area.
       */

      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1200);
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * --------------------------------------------------
   * BACK
   * --------------------------------------------------
   */

  function goBack() {
    setError("");
    setSuccess("");

    if (step === 1) {
      router.push("/settings");
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    setStep(2);
  }

  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}

      <div className="mb-8">
        <button
          type="button"
          onClick={goBack}
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Delete account
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Permanently delete your account and
              associated data. This action cannot be
              undone.
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}

      <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div>
            <p className="text-sm font-medium text-red-300">
              This action is permanent
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Your account will be permanently removed.
              Make sure you really want to continue
              before completing the verification process.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}

      <div className="mb-6 grid grid-cols-3 gap-2">
        {[
          {
            number: 1,
            label: "Confirm",
          },
          {
            number: 2,
            label: "PIN",
          },
          {
            number: 3,
            label: "Email",
          },
        ].map((item) => {
          const active =
            step === item.number;

          const completed =
            step > item.number;

          return (
            <div
              key={item.number}
              className={`rounded-xl border px-3 py-3 transition ${
                active
                  ? "border-red-500/30 bg-red-500/[0.08]"
                  : completed
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2">
                {completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                      active
                        ? "bg-red-500 text-white"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {item.number}
                  </span>
                )}

                <span
                  className={`text-xs font-medium ${
                    active
                      ? "text-white"
                      : completed
                        ? "text-emerald-300"
                        : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Main card */}

      <div className="rounded-2xl border border-white/10 bg-[#11151F] p-5 sm:p-7">
        {/* STEP 1 */}

        {step === 1 && (
          <form
            onSubmit={handlePhraseSubmit}
            className="space-y-6"
          >
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <ShieldAlert className="h-5 w-5 text-red-400" />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Confirm account deletion
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Type the exact phrase shown below to
                confirm that you understand this action
                is permanent.
              </p>
            </div>

            {loadingPhrase ? (
              <div className="flex min-h-28 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-red-500/20 bg-black/20 p-5 text-center">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Type this phrase
                  </p>

                  <p className="break-all font-mono text-sm font-semibold tracking-wider text-red-300 sm:text-base">
                    {phrase}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmationPhrase"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirmation phrase
                  </label>

                  <input
                    id="confirmationPhrase"
                    type="text"
                    value={confirmationPhrase}
                    onChange={(event) =>
                      setConfirmationPhrase(
                        event.target.value
                      )
                    }
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Enter the phrase exactly"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={generatePhrase}
                  className="w-full text-sm text-slate-500 transition hover:text-slate-300"
                >
                  Generate a new phrase
                </button>
              </>
            )}
          </form>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <form
            onSubmit={handlePinSubmit}
            className="space-y-6"
          >
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                <LockKeyhole className="h-5 w-5 text-slate-300" />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Verify your PIN
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter your 6-digit security PIN to
                continue with account deletion.
              </p>
            </div>

            <div>
              <label
                htmlFor="deletePin"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Security PIN
              </label>

              <input
                id="deletePin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(event) =>
                  setPin(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                autoComplete="off"
                placeholder="••••••"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-center font-mono text-xl tracking-[0.45em] text-white outline-none transition placeholder:text-slate-700 focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs leading-5 text-slate-500">
                Your PIN is verified securely on the
                server. It is never stored in the browser.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <form
            onSubmit={handleDelete}
            className="space-y-6"
          >
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                <Mail className="h-5 w-5 text-slate-300" />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Verify your email
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                We'll send a one-time verification code
                to the email address associated with
                your account.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                <p className="text-sm leading-6 text-slate-400">
                  Check your email for the verification
                  code. The code expires according to your
                  Supabase authentication settings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={sendingOtp}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send verification code
                </>
              )}
            </button>

            <div>
              <label
                htmlFor="deleteOtp"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Verification code
              </label>

              <input
                id="deleteOtp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                autoComplete="one-time-code"
                placeholder="000000"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-center font-mono text-xl tracking-[0.35em] text-white outline-none transition placeholder:text-slate-700 focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10"
              />
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
              <p className="text-xs leading-5 text-red-300/80">
                After verification, your account will
                be permanently deleted. This cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setStep(2);
                }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !/^\d{6}$/.test(otp)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Permanently delete
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer note */}

      <p className="mt-5 text-center text-xs leading-5 text-slate-600">
        Account deletion requires confirmation,
        security PIN verification, and email
        verification.
      </p>
    </div>
  );
}
