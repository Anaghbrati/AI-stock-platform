import { createClient } from "../supabase/server";

export interface WatchlistItem {
  id: number;
  user_id: string;
  ticker: string;
  created_at: string;
}

export async function getWatchlist(
  userId: string
): Promise<WatchlistItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to fetch watchlist: ${error.message}`
    );
  }

  return data ?? [];
}

export async function addToWatchlist(
  userId: string,
  ticker: string
): Promise<WatchlistItem> {
  const supabase = await createClient();

  const normalizedTicker =
    ticker.trim().toUpperCase();

  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      ticker: normalizedTicker,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        `${normalizedTicker} is already in your watchlist`
      );
    }

    throw new Error(
      `Failed to add stock: ${error.message}`
    );
  }

  return data;

}

export async function removeFromWatchlist(
  userId: string,
  ticker: string
): Promise<void> {
  const supabase = await createClient();

  const normalizedTicker =
    ticker.trim().toUpperCase();

  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", normalizedTicker);

  if (error) {
    throw new Error(
      `Failed to remove stock: ${error.message}`
    );
  }
}

export async function isInWatchlist(
  userId: string,
  ticker: string
): Promise<boolean> {
  const supabase = await createClient();

  const normalizedTicker =
    ticker.trim().toUpperCase();

  const { data, error } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("ticker", normalizedTicker)
    .maybeSingle();

  if (error) {
  console.error("WATCHLIST SUPABASE ERROR:", error);

  throw new Error(
    `Failed to fetch watchlist: ${error.message}`
  );
}

  return data !== null;
}