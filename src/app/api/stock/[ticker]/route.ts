import { NextResponse } from "next/server";

import {
  getStockQuote,
} from "../../../../lib/services/stock.service";


interface RouteContext {
  params: Promise<{
    ticker: string;
  }>;
}

// ========================================
// FORCE DYNAMIC
// ========================================
//
// Stock quotes are live data.
// Never statically cache this route.
//

export const dynamic = "force-dynamic";

// ========================================
// GET STOCK QUOTE
// ========================================

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { ticker } = await params;

    // ======================================
    // VALIDATE TICKER
    // ======================================

    if (!ticker) {
      return NextResponse.json(
        {
          error: "Ticker is required",
          stock: null,
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // NORMALIZE TICKER
    // ======================================

    const normalizedTicker =
      decodeURIComponent(ticker)
        .trim()
        .toUpperCase();

    if (!normalizedTicker) {
      return NextResponse.json(
        {
          error: "Ticker is required",
          stock: null,
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Stock API] Fetching quote:",
      normalizedTicker
    );

    // ======================================
    // FETCH QUOTE
    // ======================================

    const stock =
      await getStockQuote(
        normalizedTicker
      );

    // ======================================
    // HANDLE UNAVAILABLE DATA
    // ======================================

    if (!stock) {
      return NextResponse.json(
        {
          error:
            "Stock data unavailable",
          stock: null,
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // SUCCESS
    // ======================================

    return NextResponse.json(
      {
        stock,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Stock API] Quote error:",
      error
    );

    return NextResponse.json(
      
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch stock quote",

        stock: null,
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
      
    );
  }
}