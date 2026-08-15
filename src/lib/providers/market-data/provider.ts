import type {
  HistoricalData,
  StockFundamentals,
  StockQuote,
  StockSearchResult,
} from "./types";

export interface MarketDataProvider {
  getQuote(ticker: string): Promise<StockQuote>;

  getHistoricalData(
    ticker: string,
    range: string
  ): Promise<HistoricalData[]>;

  getFundamentals(
    ticker: string
  ): Promise<StockFundamentals>;

  searchStocks(
    query: string
  ): Promise<StockSearchResult[]>;
}