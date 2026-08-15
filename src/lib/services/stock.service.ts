import { getMarketDataProvider } from "../providers/market-data";

export async function getStockQuote(ticker: string) {
  const provider = getMarketDataProvider();

  return provider.getQuote(ticker);
}