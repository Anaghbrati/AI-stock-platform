import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

import {
  getStockQuote,
} from "../../../../lib/services/stock.service";

import {
  checkAlertsForTicker,
} from "../../../../lib/services/alert-trigger.service";

export async function POST(
  request: Request
) {
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
     * PARSE REQUEST
     * ==========================================
     */

    let body: unknown;

    try {
      body = await request.json();
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
            "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const {
      ticker,
    } = body as {
      ticker?: unknown;
    };

    if (
      typeof ticker !== "string" ||
      !ticker.trim()
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

    const normalizedTicker =
      ticker
        .trim()
        .toUpperCase();

    /*
     * ==========================================
     * GET CURRENT STOCK PRICE
     * ==========================================
     *
     * Reuses the existing stock service.
     *
     * No direct Yahoo request here.
     */

    const stock =
      await getStockQuote(
        normalizedTicker
      );

    if (!stock) {
      return NextResponse.json(
        {
          error:
            "Unable to fetch current stock data",
        },
        {
          status: 503,
        }
      );
    }

    if (
      typeof stock.price !==
        "number" ||
      !Number.isFinite(
        stock.price
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Current stock price is unavailable",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * ==========================================
     * RUN ALERT ENGINE
     * ==========================================
     */

    const result =
      await checkAlertsForTicker(
        user.id,
        {
          ticker:
            normalizedTicker,

          price:
            stock.price,

          changePercent:
            stock.changePercent ??
            null,
        }
      );

    /*
     * ==========================================
     * RESPONSE
     * ==========================================
     */

    return NextResponse.json(
      {
        success: true,

        ticker:
          normalizedTicker,

        currentPrice:
          stock.price,

        changePercent:
          stock.changePercent ??
          null,

        checked:
          result.checked,

        triggered:
          result.triggered,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/alerts/check error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check alerts",
      },
      {
        status: 500,
      }
    );
  }
}