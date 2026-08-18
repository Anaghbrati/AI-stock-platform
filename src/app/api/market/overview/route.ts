import { NextResponse } from "next/server";

import {
  getStockQuote,
} from "../../../../lib/services/stock.service";

import type {
  StockQuote,
} from "../../../../types/stock";

import {
  INDIAN_STOCK_UNIVERSE,
} from "../../../../lib/market/indian-stock-universe";

interface MarketStock {
  ticker: string;
  companyName: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

/* ============================================================
   PERFORMANCE CONFIG
============================================================ */

/*
 * IMPORTANT:
 *
 * We intentionally only load the first 10 stocks.
 *
 * This prevents the Markets page from requesting
 * 100+ Yahoo Finance quotes just to render the page.
 */
const MARKET_OVERVIEW_LIMIT = 10;

/*
 * Maximum time allowed for one quote.
 *
 * If Yahoo/FastAPI becomes slow, that stock is skipped
 * instead of blocking the entire Markets page.
 */
const QUOTE_TIMEOUT = 3500;

/* ============================================================
   TIMEOUT HELPER
============================================================ */

async function fetchQuoteWithTimeout(
  ticker: string
): Promise<MarketStock | null> {
  try {
    const quotePromise =
      getStockQuote(ticker);

    const timeoutPromise =
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Quote timeout for ${ticker}`
            )
          );
        }, QUOTE_TIMEOUT);
      });

    const quote =
      await Promise.race([
        quotePromise,
        timeoutPromise,
      ]);

    if (!quote) {
      return null;
    }

    return normalizeQuote(quote);
  } catch (error) {
    console.warn(
      `[Market Overview] Skipping ${ticker}:`,
      error instanceof Error
        ? error.message
        : error
    );

    return null;
  }
}

/* ============================================================
   NORMALIZE QUOTE
============================================================ */

function normalizeQuote(
  quote: StockQuote
): MarketStock {
  return {
    ticker:
      quote.ticker,

    companyName:
      quote.companyName ??
      quote.ticker,

    price:
      quote.price ??
      null,

    change:
      quote.change ??
      null,

    changePercent:
      quote.changePercent ??
      null,

    marketCap:
      quote.marketCap ??
      null,

    fiftyTwoWeekHigh:
      quote.fiftyTwoWeekHigh ??
      null,

    fiftyTwoWeekLow:
      quote.fiftyTwoWeekLow ??
      null,
  };
}

/* ============================================================
   GET MARKET OVERVIEW
============================================================ */

export async function GET() {
  const startTime =
    performance.now();

  try {
    /* ========================================================
       1. ONLY TAKE TOP 10 STOCKS
    ======================================================== */

    const tickers =
      INDIAN_STOCK_UNIVERSE.slice(
        0,
        MARKET_OVERVIEW_LIMIT
      );

    console.log(
      "[Market Overview] Loading stocks:",
      tickers
    );

    /* ========================================================
       2. FETCH ALL 10 IN PARALLEL
    ======================================================== */

    const results =
      await Promise.all(
        tickers.map(
          (ticker) =>
            fetchQuoteWithTimeout(
              ticker
            )
        )
      );

    /* ========================================================
       3. REMOVE FAILED QUOTES
    ======================================================== */

    const stocks =
      results.filter(
        (
          stock
        ): stock is MarketStock =>
          stock !== null
      );

    /* ========================================================
       4. VALID STOCKS
    ======================================================== */

    const validStocks =
      stocks.filter(
        (
          stock
        ): stock is MarketStock =>
          stock.price !== null &&
          stock.changePercent !== null
      );

    /* ========================================================
       5. TOP GAINERS
    ======================================================== */

    const topGainers =
      [...validStocks]
        .sort(
          (a, b) =>
            (b.changePercent ?? 0) -
            (a.changePercent ?? 0)
        )
        .slice(0, 5);

    /* ========================================================
       6. TOP LOSERS
    ======================================================== */

    const topLosers =
      [...validStocks]
        .sort(
          (a, b) =>
            (a.changePercent ?? 0) -
            (b.changePercent ?? 0)
        )
        .slice(0, 5);

    /* ========================================================
       7. 52 WEEK HIGH
    ======================================================== */

    const weekHigh =
      validStocks
        .filter(
          (stock) =>
            stock.price !== null &&
            stock.fiftyTwoWeekHigh !==
              null
        )
        .sort(
          (a, b) => {
            const aDistance =
              Math.abs(
                (a.fiftyTwoWeekHigh ?? 0) -
                  (a.price ?? 0)
              );

            const bDistance =
              Math.abs(
                (b.fiftyTwoWeekHigh ?? 0) -
                  (b.price ?? 0)
              );

            return (
              aDistance -
              bDistance
            );
          }
        )
        .slice(0, 5);

    /* ========================================================
       8. 52 WEEK LOW
    ======================================================== */

    const weekLow =
      validStocks
        .filter(
          (stock) =>
            stock.price !== null &&
            stock.fiftyTwoWeekLow !==
              null
        )
        .sort(
          (a, b) => {
            const aDistance =
              Math.abs(
                (a.price ?? 0) -
                  (a.fiftyTwoWeekLow ?? 0)
              );

            const bDistance =
              Math.abs(
                (b.price ?? 0) -
                  (b.fiftyTwoWeekLow ?? 0)
              );

            return (
              aDistance -
              bDistance
            );
          }
        )
        .slice(0, 5);

    /* ========================================================
       9. PERFORMANCE
    ======================================================== */

    const duration =
      performance.now() -
      startTime;

    console.log(
      "[Market Overview]",
      {
        requested:
          tickers.length,

        successful:
          stocks.length,

        valid:
          validStocks.length,

        failed:
          tickers.length -
          stocks.length,

        topGainers:
          topGainers.length,

        topLosers:
          topLosers.length,

        duration:
          `${duration.toFixed(2)}ms`,
      }
    );

    /* ========================================================
       10. RESPONSE
    ======================================================== */

    return NextResponse.json(
      {
        stocks,

        topGainers,

        topLosers,

        weekHigh,

        weekLow,

        updatedAt:
          new Date().toISOString(),
      },
      {
        headers: {
          /*
           * Do not force browser caching here.
           *
           * The frontend can still receive fresh data,
           * while the individual stock provider can later
           * be cached separately.
           */
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Market Overview] Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load market overview.",
      },
      {
        status: 500,
      }
    );
  }
}