import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";

import {
  getDashboardSummary,
} from "../../lib/services/dashboard.service";

import LogoutButton from "../../components/auth/LogoutButton";
import DashboardShell from "../../components/dashboard/DashboardShell";
import DashboardSummary from "../../components/dashboard/DashboardSummary";

import type {
  DashboardSummary as DashboardSummaryData,
} from "../../lib/services/dashboard.service";

export default async function DashboardPage() {
  /*
   * ==========================================================
   * AUTHENTICATION
   * ==========================================================
   */

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * ==========================================================
   * DASHBOARD SUMMARY
   * ==========================================================
   *
   * Fetch ALL dashboard data once on the server.
   *
   * Dashboard service handles:
   *
   * - Alert summary
   * - Recent alerts
   * - Watchlist
   * - Watchlist quotes
   * - Watchlist alert status
   * - NIFTY 50
   * - SENSEX
   *
   * This prevents individual dashboard components from
   * independently requesting the same data.
   */

  let dashboardData:
    | DashboardSummaryData
    | null = null;

  try {
    dashboardData =
      await getDashboardSummary(
        user.id
      );
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );
  }

  /*
   * ==========================================================
   * SAFE FALLBACK
   * ==========================================================
   *
   * If the dashboard service fails, the page itself should
   * still render instead of crashing.
   */

  const safeDashboardData:
    DashboardSummaryData =
    dashboardData ?? {
      alerts: {
        active: 0,
        triggered: 0,
        total: 0,
        recent: [],
      },

      watchlist: {
        total: 0,
        items: [],
      },

      market: {
        indices: [],
      },
    };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <DashboardShell>
      <div className="space-y-8">

        {/* =====================================================
            WELCOME
        ====================================================== */}

        <section>
          <p className="text-sm text-slate-500">
            AI-powered market intelligence
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Market Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Welcome back{" "}
                <span className="text-slate-300">
                  {user.email}
                </span>
              </p>
            </div>

            {/* Connection status */}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium text-slate-400">
                  Market data connected
                </span>

              </div>
            </div>

          </div>
        </section>


        {/* =====================================================
            4F — ADVANCED DASHBOARD
        ====================================================== */}

        <DashboardSummary
          summary={safeDashboardData}
        />


        {/* =====================================================
            AI MARKET INTELLIGENCE
        ====================================================== */}

        <section>

          <div className="mb-4">
            <p className="text-sm text-slate-500">
              Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              AI Market Insight
            </h2>
          </div>


          <div className="relative overflow-hidden rounded-2xl border border-[#ff4d61]/15 bg-[#101318] p-6">

            {/* Background glow */}

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff4d61]/10 blur-3xl" />


            <div className="relative">

              {/* Header */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ff4d61]/20 bg-[#ff4d61]/10">

                    <span className="text-lg text-[#ff6577]">
                      ✦
                    </span>

                  </div>


                  <div>

                    <p className="text-sm font-bold text-white">
                      Market sentiment
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      AI-generated market analysis
                    </p>

                  </div>

                </div>


                {/* Sentiment */}

                <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Bullish
                </span>

              </div>


              {/* Insight */}

              <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-400">
                Indian markets are showing positive momentum.
                Technical momentum, market breadth, and volume
                should be monitored for confirmation of the
                current trend.
              </p>


              {/* Factors */}

              <div className="mt-6 flex flex-wrap gap-2">

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-500">
                  Technical momentum
                </span>

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-500">
                  Market breadth
                </span>

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-500">
                  Volume
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ACCOUNT
        ====================================================== */}

        <section className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#101318] p-5">

          <div>

            <p className="text-sm font-semibold text-white">
              Account
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Signed in as {user.email}
            </p>

          </div>

          <LogoutButton />

        </section>

      </div>
    </DashboardShell>
  );
}