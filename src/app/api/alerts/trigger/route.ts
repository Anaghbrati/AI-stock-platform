
import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

import {
  processTickerAlerts,
} from "../../../../lib/services/alert-trigger.service";

// ========================================
// POST /api/alerts/trigger
// ========================================

export async function POST(
  request: Request
) {
  try {
    // ======================================
    // AUTHENTICATION
    // ======================================

    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

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

    // ======================================
    // PARSE BODY
    // ======================================

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error:
            "Request body must be an object",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    // ======================================
    // TICKER
    // ======================================

    if (
      typeof data.ticker !==
        "string" ||
      !data.ticker.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Ticker is required",
        },
        {
          status: 400,
        }
      );
    }

    const ticker =
      data.ticker
        .trim()
        .toUpperCase();

    // ======================================
    // PROCESS ALERTS
    // ======================================

    const result =
      await processTickerAlerts(
        ticker
      );

    return NextResponse.json(
      {
        success: true,
        result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/alerts/trigger error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process alerts",
      },
      {
        status: 500,
      }
    );
  }
}
