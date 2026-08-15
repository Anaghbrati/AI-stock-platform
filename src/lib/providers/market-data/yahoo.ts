import type {
  HistoricalData,
  StockFundamentals,
  StockQuote,
  StockSearchResult,
} from "./types";

import type { MarketDataProvider } from "./provider";

const MARKET_DATA_API =
  process.env.MARKET_DATA_API_URL || "http://localhost:8000";

export class YahooFinanceProvider implements MarketDataProvider {
  async getQuote(ticker: string): Promise<StockQuote> {
    const response = await fetch(
      `${MARKET_DATA_API}/api/quote/${encodeURIComponent(ticker)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${ticker}`);
    }

    const data = await response.json();

    return {
      ticker: data.ticker,
      companyName: data.companyName,
      price: data.price,
      change: data.change ?? 0,
      changePercent: data.changePercent ?? 0,
      volume: data.volume,
      marketCap: data.marketCap,
      currency: data.currency,
      timestamp: new Date().toISOString(),
    };
  }

  async getHistoricalData(
    ticker: string,
    range: string
  ): Promise<HistoricalData[]> {
    throw new Error(
      `Historical data not implemented yet: ${ticker}, ${range}`
    );
  }

  async getFundamentals(
    ticker: string
  ): Promise<StockFundamentals> {
    throw new Error(`Fundamentals not implemented yet: ${ticker}`);
  }

  async searchStocks(
    query: string
  ): Promise<StockSearchResult[]> {
    throw new Error(`Stock search not implemented yet: ${query}`);
  }
}