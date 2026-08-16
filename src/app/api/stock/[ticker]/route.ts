import { NextResponse } from "next/server";

import { getStockQuote } from "../../../../lib/services/stock.service";

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
    const normalizedTicker = ticker.toUpperCase();

    const stock = await getStockQuote(normalizedTicker);

    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Stock quote API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stock quote" },
      { status: 500 }
    );
  }
}