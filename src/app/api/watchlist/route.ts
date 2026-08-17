
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
     * Add live stock quote to every watchlist item.
     */
    const watchlistWithQuotes = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const stock = await getStockQuote(item.ticker);

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
    console.error("Watchlist GET error:", error);

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
export async function POST(request: Request) {
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

    /*
     * Read request body safely.
     */
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate ticker.
     */
    const ticker =
      typeof body === "object" &&
      body !== null &&
      "ticker" in body &&
      typeof (body as { ticker?: unknown }).ticker ===
        "string"
        ? (body as { ticker: string }).ticker
        : null;

    if (!ticker || ticker.trim().length === 0) {
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
     * Basic ticker format protection.
     *
     * Allows:
     * RELIANCE.NS
     * TCS.NS
     * INFY.NS
     * AAPL
     * TSLA
     * ^NSEI
     * ^BSESN
     */
    const tickerPattern =
      /^[A-Z0-9^][A-Z0-9._^-]{0,19}$/;

    if (!tickerPattern.test(normalizedTicker)) {
      return NextResponse.json(
        {
          error: `Invalid ticker format: "${normalizedTicker}"`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================
     * REAL STOCK VALIDATION
     * ========================================
     *
     * Do NOT only check whether getStockQuote()
     * throws.
     *
     * Yahoo Finance can sometimes return an
     * incomplete object for invalid symbols.
     *
     * We therefore verify that the quote contains
     * meaningful stock information.
     */
    try {
      const quote = await getStockQuote(
        normalizedTicker
      );

      const validQuote =
        quote &&
        typeof quote === "object" &&
        typeof quote.ticker === "string" &&
        quote.ticker.length > 0 &&
        typeof quote.companyName === "string" &&
        quote.companyName.trim().length > 0 &&
        quote.price !== null &&
        quote.price !== undefined &&
        Number.isFinite(Number(quote.price));

      if (!validQuote) {
        console.error(
          `Invalid stock quote returned for ${normalizedTicker}:`,
          quote
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
    } catch (error) {
      console.error(
        `Ticker validation failed for ${normalizedTicker}:`,
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
     * ========================================
     * SAVE TO SUPABASE
     * ========================================
     *
     * Only reached after successful validation.
     */
    try {
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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add stock to watchlist";

      /*
       * Duplicate watchlist item.
       */
      if (
        message.includes(
          "already in your watchlist"
        )
      ) {
        return NextResponse.json(
          {
            error: message,
          },
          {
            status: 409,
          }
        );
      }

      throw error;
    }
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
export async function DELETE(request: Request) {
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

    const normalizedTicker =
      ticker.trim().toUpperCase();

    await removeFromWatchlist(
      user.id,
      normalizedTicker
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
