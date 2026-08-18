import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../../../lib/repositories/watchlist.repository";

// =========================================================
// GET WATCHLIST
// =========================================================

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

    const watchlist =
      await getWatchlist(user.id);

    return NextResponse.json(
      {
        watchlist,
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
      "GET /api/watchlist error:",
      error
    );

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

// =========================================================
// POST — ADD
// =========================================================

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
      await request.json();

    const ticker =
      typeof body?.ticker === "string"
        ? body.ticker.trim().toUpperCase()
        : "";

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

    const item =
      await addToWatchlist(
        user.id,
        ticker
      );

    return NextResponse.json(
      {
        ...item,
        stock: null,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/watchlist error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add stock",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================================
// DELETE — REMOVE
// =========================================================

export async function DELETE(
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

    const url =
      new URL(request.url);

    const ticker =
      url.searchParams
        .get("ticker")
        ?.trim()
        .toUpperCase() ?? "";

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

    await removeFromWatchlist(
      user.id,
      ticker
    );

    return NextResponse.json(
      {
        success: true,
        ticker,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE /api/watchlist error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove stock",
      },
      {
        status: 500,
      }
    );
  }
}