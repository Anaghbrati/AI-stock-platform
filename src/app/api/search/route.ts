import { NextRequest, NextResponse } from "next/server";

import { searchStocks } from "../../../lib/services/search.service";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({
      success: true,
      results: [],
    });
  }

  try {
    const results = await searchStocks(query);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Stock search error:", error);

    return NextResponse.json(
      {
        success: false,
        results: [],
        error: "Failed to search stocks",
      },
      {
        status: 500,
      }
    );
  }
}