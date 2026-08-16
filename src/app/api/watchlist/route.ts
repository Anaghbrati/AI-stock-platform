
import { NextResponse } from "next/server";

import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../../../lib/repositories/watchlist.repository";

import { createClient } from "../../../lib/supabase/server";

import { getStockQuote } from "../../../lib/services/stock.service";

/*
 * GET /api/watchlist
 *
 * Returns the logged-in user's watchlist
 * with current stock information.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const watchlist = await getWatchlist(user.id);

    /*
     * Add live stock quote to every watchlist item
     */
    const watchlistWithQuotes = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const stock = await getStockQuote(
            item.ticker
          );

          return {
            ...item,
            stock,
          };
        } catch (error) {
          console.error(
            `Failed to fetch quote for ${item.ticker}:`,
            error
          );

          return {
            ...item,
            stock: null,
          };
        }
      })
    );

    return NextResponse.json({
      watchlist: watchlistWithQuotes,
    });
  } catch (error) {
    console.error(
      "Watchlist GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch watchlist",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * POST /api/watchlist
 *
 * Adds a stock to the logged-in user's watchlist.
 */
export async function POST(
  request: Request
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const ticker = body?.ticker;

    if (
      typeof ticker !== "string" ||
      ticker.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Ticker is required",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedTicker =
      ticker.trim().toUpperCase();

    /*
     * Validate that the ticker exists
     * before saving it.
     */
    try {
      await getStockQuote(normalizedTicker);
    } catch (error) {
      console.error(
        "Ticker validation failed:",
        error
      );

      return NextResponse.json(
        {
          error: `Stock "${normalizedTicker}" was not found`,
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Ticker is valid — save it.
     */
    const stock = await addToWatchlist(
      user.id,
      normalizedTicker
    );

    return NextResponse.json(
      {
        watchlist: stock,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Watchlist POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add stock to watchlist",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * DELETE /api/watchlist
 *
 * Removes a stock from the logged-in user's watchlist.
 *
 * Example:
 * DELETE /api/watchlist?ticker=RELIANCE.NS
 */
export async function DELETE(
  request: Request
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const url = new URL(request.url);

    const ticker =
      url.searchParams.get("ticker");

    if (
      !ticker ||
      ticker.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Ticker is required",
        },
        {
          status: 400,
        }
      );
    }

    await removeFromWatchlist(
      user.id,
      ticker.trim().toUpperCase()
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Watchlist DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove stock from watchlist",
      },
      {
        status: 500,
      }
    );
  }
}

