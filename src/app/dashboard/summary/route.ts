import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

import {
  getDashboardSummary,
} from "../../../lib/services/dashboard.service";

/*
 * GET /api/dashboard/summary
 *
 * Returns the authenticated user's complete
 * dashboard summary.
 *
 * Includes:
 *
 * - Alert summary
 * - Recent alerts
 * - Watchlist
 * - Watchlist stock quotes
 * - Watchlist alert status
 * - Major market indices
 *
 * Authentication is handled server-side through
 * the Supabase SSR client.
 */

export async function GET() {
  try {
    /*
     * ==========================================
     * AUTHENTICATION
     * ==========================================
     */

    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ==========================================
     * GET DASHBOARD SUMMARY
     * ==========================================
     *
     * The service handles:
     *
     * - Alerts
     * - Watchlist
     * - Stock quotes
     * - Market indices
     *
     * and performs independent requests in
     * parallel wherever possible.
     */

    const summary =
      await getDashboardSummary(
        user.id
      );

    /*
     * ==========================================
     * RESPONSE
     * ==========================================
     */

    return NextResponse.json(
      {
        success: true,

        data:
          summary,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/dashboard/summary error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard summary",
      },
      {
        status: 500,
      }
    );
  }
}