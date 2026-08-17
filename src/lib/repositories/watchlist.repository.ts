import { createClient } from "../supabase/server";

export interface WatchlistItem {
  id: number;
  user_id: string;
  ticker: string;
  created_at: string;
}

// ========================================
// GET WATCHLIST
// ========================================

export async function getWatchlist(
  userId: string
): Promise<WatchlistItem[]> {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist")
    .select(
      "id, user_id, ticker, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "GET WATCHLIST SUPABASE ERROR:",
      error
    );

    throw new Error(
      `Failed to fetch watchlist: ${error.message}`
    );
  }

  return data ?? [];
}

// ========================================
// ADD TO WATCHLIST
// ========================================

export async function addToWatchlist(
  userId: string,
  ticker: string
): Promise<WatchlistItem> {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const normalizedTicker =
    ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      ticker: normalizedTicker,
    })
    .select(
      "id, user_id, ticker, created_at"
    )
    .single();

  if (error) {
    console.error(
      "ADD WATCHLIST SUPABASE ERROR:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        `${normalizedTicker} is already in your watchlist.`
      );
    }

    throw new Error(
      `Failed to add stock: ${error.message}`
    );
  }

  return data;
}

// ========================================
// REMOVE FROM WATCHLIST
// ========================================

export async function removeFromWatchlist(
  userId: string,
  ticker: string
): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const normalizedTicker =
    ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", normalizedTicker);

  if (error) {
    console.error(
      "REMOVE WATCHLIST SUPABASE ERROR:",
      error
    );

    throw new Error(
      `Failed to remove stock: ${error.message}`
    );
  }
}

// ========================================
// CHECK WATCHLIST
// ========================================

export async function isInWatchlist(
  userId: string,
  ticker: string
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const normalizedTicker =
    ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    return false;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("ticker", normalizedTicker)
    .maybeSingle();

  if (error) {
    console.error(
      "CHECK WATCHLIST SUPABASE ERROR:",
      error
    );

    throw new Error(
      `Failed to check watchlist: ${error.message}`
    );
  }

  return data !== null;
}