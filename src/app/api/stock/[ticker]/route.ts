
import { NextResponse } from "next/server";

import {
  getStockQuote,
} from "../../../../lib/services/stock.service";

interface RouteContext {
  params: Promise<{
    ticker: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { ticker } = await params;

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

    const normalizedTicker =
      decodeURIComponent(ticker)
        .trim()
        .toUpperCase();

    console.log(
      "Stock API: fetching",
      normalizedTicker
    );

    const stock =
      await getStockQuote(
        normalizedTicker
      );

    if (!stock) {
      return NextResponse.json(
        {
          error: "Stock data unavailable",
          stock: null,
        },
        {
          status: 404,
        }
      );
    }

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
      "================================"
    );

    console.error(
      "Stock quote API error:"
    );

    console.error(error);

    console.error(
      "================================"
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
