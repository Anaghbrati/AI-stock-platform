"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  ChevronRight,
  Check,
  Loader2,
  Info,
} from "lucide-react";

import { createClient } from "../../../lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "";

        setEmail(user.email ?? "");
        setFullName(name);
        setOriginalName(name);
      }

      setLoading(false);
    }

    loadUser();
  }, [supabase]);

  async function handleSaveName() {
    const trimmedName = fullName.trim();

    if (!trimmedName || trimmedName === originalName) {
      return;
    }

    setSavingName(true);
    setNameSaved(false);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: trimmedName,
      },
    });

    if (!error) {
      setOriginalName(trimmedName);
      setFullName(trimmedName);
      setNameSaved(true);

      window.setTimeout(() => {
        setNameSaved(false);
      }, 2500);
    }

    setSavingName(false);
  }

  const hasNameChanged =
    fullName.trim() !== originalName &&
    fullName.trim().length > 0;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-7 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#ff4d61]/[0.06] blur-3xl" />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <User className="h-4 w-4 text-[#ff4d61]" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff4d61]">
              Account
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your profile, security preferences and account access.
          </p>
        </div>
      </div>

      {/* =========================================================
          PROFILE
      ========================================================= */}

      <SettingsSection
        icon={<User className="h-4 w-4" />}
        eyebrow="Profile"
        title="Personal information"
        description="Update the information associated with your account."
      >
        <div className="space-y-6">
          {/* Name */}

          <div>
            <label
              htmlFor="full-name"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Full name
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setNameSaved(false);
                }}
                placeholder="Enter your full name"
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-[#ff4d61]/50 focus:bg-white/[0.025]"
              />
            </div>
          </div>

          {/* Email */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <span className="text-[11px] font-medium text-slate-600">
                Account email
              </span>
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="h-12 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.015] pl-11 pr-4 text-sm text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Save */}

          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="h-3.5 w-3.5" />

              <span>
                Your name is stored securely with your account information.
              </span>
            </div>

            <button
              type="button"
              disabled={!hasNameChanged || savingName}
              onClick={handleSaveName}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff4d61] px-5 text-sm font-semibold text-white transition hover:bg-[#ff6172] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {savingName ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : nameSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* =========================================================
          SECURITY
      ========================================================= */}

      <SettingsSection
        icon={<ShieldCheck className="h-4 w-4" />}
        eyebrow="Security"
        title="Account security"
        description="Control how your account is protected."
      >
        <div className="divide-y divide-white/[0.06]">
          {/* Password */}

          <SecurityRow
            icon={<Lock className="h-4 w-4" />}
            title="Password"
            description="Change your account password."
            action="Change password"
            onClick={() => router.push("/settings/change-password")}
          />

          {/* Login PIN */}

          <SecurityRow
            icon={<KeyRound className="h-4 w-4" />}
            title="Login PIN"
            description="Require a PIN when entering the platform."
            action="Manage PIN"
            onClick={() => router.push("/pin")}
          />

          {/* Forgot PIN */}

          <SecurityRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Forgot PIN"
            description="Recover your PIN using your verified email."
            action="Recover PIN"
            onClick={() => router.push("/settings/forgot-pin")}
          />
        </div>

        {/* Security notice */}

        <div className="mt-6 flex gap-3 rounded-xl border border-blue-500/[0.12] bg-blue-500/[0.035] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />

          <div>
            <p className="text-xs font-semibold text-slate-300">
              Additional security
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Your PIN is stored as a secure hash. It is never stored as
              plain text.
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* =========================================================
          DANGER ZONE
      ========================================================= */}

      <section className="overflow-hidden rounded-2xl border border-red-500/[0.16] bg-red-500/[0.018]">
        <div className="border-b border-red-500/[0.10] px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/[0.15] bg-red-500/[0.06]">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-400/80">
                Danger zone
              </p>

              <h2 className="mt-1 text-base font-semibold text-white">
                Delete account
              </h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-slate-300">
                Permanently delete your account
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                This will permanently remove your account and associated
                application data. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/settings/delete-account")}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/[0.20] bg-red-500/[0.05] px-5 text-sm font-semibold text-red-400 transition hover:border-red-500/[0.35] hover:bg-red-500/[0.09]"
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER NOTE
      ========================================================= */}

      <div className="pb-6 text-center">
        <p className="text-[11px] text-slate-700">
          AI Stock Intelligence · Account Settings
        </p>
      </div>
    </div>
  );
}

/* ===============================================================
   SETTINGS SECTION
=============================================================== */

function SettingsSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-6 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-[#ff4d61]">
            {icon}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff4d61]/80">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-base font-semibold text-white">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">{children}</div>
    </section>
  );
}

/* ===============================================================
   SECURITY ROW
=============================================================== */

function SecurityRow({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="group inline-flex w-fit items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
      >
        {action}

        <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-[#ff4d61]" />
      </button>
    </div>
  );
}
