import { searchYahooStocks } from "../../lib/providers/market-data/search";
import type { StockSearchResult } from "../../types/search";

export async function searchStocks(
  query: string,
): Promise<StockSearchResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  if (trimmedQuery.length < 1) {
    return [];
  }

  return searchYahooStocks(trimmedQuery);
}