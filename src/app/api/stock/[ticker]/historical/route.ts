import { NextResponse } from "next/server";

import {
  getHistoricalData,
} from "../../../../../lib/services/stock.service";

interface RouteContext {
  params: Promise<{
    ticker: string;
  }>;
}

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
        { status: 400 }
      );
    }

    const normalizedTicker =
      decodeURIComponent(ticker)
        .trim()
        .toUpperCase();

    const url = new URL(request.url);

    const period =
      url.searchParams.get("period") ||
      "1y";

    const interval =
      url.searchParams.get("interval") ||
      "1d";

    console.log(
      "[Historical API]",
      {
        ticker: normalizedTicker,
        period,
        interval,
      }
    );

    const data =
      await getHistoricalData(
        normalizedTicker,
        period,
        interval
      );

    return NextResponse.json(data);
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
      { status: 500 }
    );
  }
}