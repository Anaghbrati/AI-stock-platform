import type { StockSearchResult } from "../../../types/search";

const YAHOO_SEARCH_URL =
  "https://query1.finance.yahoo.com/v1/finance/search";

type YahooSearchQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  exchDisp?: string;
  quoteType?: string;
};

type YahooSearchResponse = {
  quotes?: YahooSearchQuote[];
};

export async function searchYahooStocks(
  query: string,
): Promise<StockSearchResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = new URL(YAHOO_SEARCH_URL);

  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("quotesCount", "10");
  url.searchParams.set("newsCount", "0");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Yahoo search failed: ${response.status}`);
  }

  const data = (await response.json()) as YahooSearchResponse;

  return (data.quotes ?? [])
    .filter(
      (quote) =>
        quote.symbol &&
        (quote.longname || quote.shortname) &&
        quote.quoteType === "EQUITY",
    )
    .map((quote) => ({
      symbol: quote.symbol!,
      name: quote.longname ?? quote.shortname!,
      exchange: quote.exchDisp ?? quote.exchange ?? "Unknown",
    }));
}