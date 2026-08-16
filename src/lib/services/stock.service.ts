import { getMarketDataProvider } from "../providers/market-data";

export async function getStockQuote(ticker: string) {
  const provider = getMarketDataProvider();

  return provider.getQuote(ticker);
}
export async function getStockFundamentals(
  ticker: string
) {
  const provider = getMarketDataProvider();

  return provider.getFundamentals(ticker);
}

export interface HistoricalData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getHistoricalData(
  ticker: string,
  period: string = "1y",
  interval: string = "1d"
): Promise<HistoricalData[]> {
  const baseUrl =
    process.env.MARKET_DATA_API_URL || "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/historical/${ticker}?period=${period}&interval=${interval}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch historical stock data");
  }

  return response.json();
}