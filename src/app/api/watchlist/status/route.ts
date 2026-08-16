
import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

import {
  isInWatchlist,
} from "../../../../lib/repositories/watchlist.repository";

export async function GET(
  request: Request
) {
  try {
    const supabase =
      await createClient();

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
      url.searchParams.get(
        "ticker"
      );

    if (
      !ticker ||
      ticker.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Ticker is required",
        },
        {
          status: 400,
        }
      );
    }

    const inWatchlist =
      await isInWatchlist(
        user.id,
        ticker
      );

    return NextResponse.json({
      ticker:
        ticker
          .trim()
          .toUpperCase(),

      inWatchlist,
    });
  } catch (error) {
    console.error(
      "Watchlist status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check watchlist status",
      },
      {
        status: 500,
      }
    );
  }
}
