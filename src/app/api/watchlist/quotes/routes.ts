import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

import { getStockQuote } from "../../../../lib/services/stock.service";

interface QuoteRequest {
  tickers?: unknown;
}

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

    const body =
      (await request.json()) as QuoteRequest;

    const tickers = Array.isArray(body?.tickers)
      ? body.tickers
          .filter(
            (ticker): ticker is string =>
              typeof ticker === "string"
          )
          .map((ticker) =>
            ticker.trim().toUpperCase()
          )
          .filter(Boolean)
      : [];

    const uniqueTickers = [
      ...new Set(tickers),
    ];

    if (uniqueTickers.length === 0) {
      return NextResponse.json(
        {
          quotes: {},
        },
        {
          status: 200,
        }
      );
    }

    /*
     * Fetch quotes in parallel.
     *
     * IMPORTANT:
     * This endpoint is NOT called before the
     * watchlist itself is displayed.
     */

    const results = await Promise.all(
      uniqueTickers.map(async (ticker) => {
        try {
          const quote =
            await getStockQuote(ticker);

          return [
            ticker,
            quote
              ? {
                  ticker:
                    quote.ticker ?? ticker,
                  companyName:
                    quote.companyName ?? null,
                  price:
                    quote.price ?? null,
                  change:
                    quote.change ?? null,
                  changePercent:
                    quote.changePercent ?? null,
                  currency:
                    quote.currency ?? null,
                }
              : null,
          ] as const;
        } catch (error) {
          console.error(
            `Watchlist quote failed for ${ticker}:`,
            error
          );

          return [ticker, null] as const;
        }
      })
    );

    const quotes = Object.fromEntries(
      results
    );

    return NextResponse.json(
      {
        quotes,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, max-age=5, stale-while-revalidate=15",
        },
      }
    );
  } catch (error) {
    console.error(
      "POST /api/watchlist/quotes error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch quotes",
      },
      {
        status: 500,
      }
    );
  }
}