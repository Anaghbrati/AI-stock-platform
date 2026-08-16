import { NextResponse } from "next/server";

import {
  getStockFundamentals,
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

    const normalizedTicker =
      ticker.toUpperCase();

    const fundamentals =
      await getStockFundamentals(
        normalizedTicker
      );

    return NextResponse.json({
      fundamentals,
    });

  } catch (error) {
    console.error(
      "Fundamentals API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch fundamentals",
      },
      {
        status: 500,
      }
    );
  }
}