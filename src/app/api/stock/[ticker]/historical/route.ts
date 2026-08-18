import { NextResponse } from "next/server";

import {
  getHistoricalData,
} from "../../../../../lib/services/stock.service";

interface RouteContext {
  params: Promise<{
    ticker: string;
  }>;
}

// ========================================
// ALLOWED HISTORICAL RANGES
// ========================================

const ALLOWED_PERIODS = new Set([
  "1d",
  "5d",
  "1mo",
  "3mo",
  "6mo",
  "1y",
  "2y",
  "5y",
  "10y",
  "max",
]);

const ALLOWED_INTERVALS = new Set([
  "1m",
  "2m",
  "5m",
  "15m",
  "30m",
  "60m",
  "90m",
  "1h",
  "1d",
  "5d",
  "1wk",
  "1mo",
  "3mo",
]);

// ========================================
// GET HISTORICAL DATA
// ========================================

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { ticker } = await params;

    if (!ticker) {
      return NextResponse.json(
        {
          error: "Ticker is required",
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
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // READ QUERY PARAMETERS
    // ======================================

    const url = new URL(request.url);

    const period =
      (
        url.searchParams.get("period") ||
        "1y"
      )
        .trim()
        .toLowerCase();

    const interval =
      (
        url.searchParams.get("interval") ||
        "1d"
      )
        .trim()
        .toLowerCase();

    // ======================================
    // VALIDATE PERIOD
    // ======================================

    if (!ALLOWED_PERIODS.has(period)) {
      return NextResponse.json(
        {
          error: `Invalid historical period: ${period}`,
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // VALIDATE INTERVAL
    // ======================================

    if (!ALLOWED_INTERVALS.has(interval)) {
      return NextResponse.json(
        {
          error: `Invalid historical interval: ${interval}`,
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // LOG REQUEST
    // ======================================

    console.log(
      "[Historical API]",
      {
        ticker: normalizedTicker,
        period,
        interval,
      }
    );

    // ======================================
    // FETCH HISTORICAL DATA
    // ======================================

    const data =
      await getHistoricalData(
        normalizedTicker,
        period,
        interval
      );

    // ======================================
    // RETURN DATA
    // ======================================

    const chartData = data.map((item) => ({
  time: item.time,
  open: item.open,
  high: item.high,
  low: item.low,
  close: item.close,
}));

return NextResponse.json(chartData);

  } catch (error) {
    console.error(
      "[Historical API] Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch historical data",
      },
      {
        status: 500,
      }
    );
  }
}