import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "../../../lib/services/search.service";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!query) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    if (query.length > 50) {
      return NextResponse.json(
        {
          success: false,
          results: [],
          error: "Search query is too long",
        },
        { status: 400 },
      );
    }

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
        error: "Unable to search stocks",
      },
      { status: 500 },
    );
  }
}