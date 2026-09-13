import { z } from "zod";

const YahooSearchResponseSchema = z.object({
  quotes: z.array(
    z.object({
      symbol: z.string().optional(),
      shortname: z.string().optional(),
      longname: z.string().optional(),
      exchange: z.string().optional(),
      quoteType: z.string().optional(),
    })
  ),
});

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string | null;
  quoteType: string | null;
}

export async function searchStocks(
  query: string
): Promise<StockSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const url =
    `https://query1.finance.yahoo.com/v1/finance/search` +
    `?q=${encodeURIComponent(trimmedQuery)}` +
    `&quotesCount=20` +
    `&newsCount=0`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance search failed: ${response.status}`);
  }

  const json: unknown = await response.json();

  const parsed = YahooSearchResponseSchema.parse(json);

  return parsed.quotes
    .filter((quote) => {
      return (
        Boolean(quote.symbol) &&
        quote.quoteType === "EQUITY"
      );
    })
    .map((quote) => ({
      symbol: quote.symbol!.trim().toUpperCase(),
      name:
        quote.longname?.trim() ||
        quote.shortname?.trim() ||
        quote.symbol!.trim().toUpperCase(),
      exchange: quote.exchange?.trim() || null,
      quoteType: quote.quoteType || null,
    }));
}