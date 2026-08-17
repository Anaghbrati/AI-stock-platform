import type {
  HistoricalData,
  StockFundamentals,
  StockQuote,
  StockSearchResult,
  FinancialStatements,
  Shareholding,
} from "./types";

export interface MarketDataProvider {
  getQuote(
    ticker: string
  ): Promise<StockQuote>;

  getHistoricalData(
    ticker: string,
    period: string,
    interval: string
  ): Promise<HistoricalData[]>;

  getFundamentals(
    ticker: string
  ): Promise<StockFundamentals>;

  getFinancialStatements(
    ticker: string
  ): Promise<FinancialStatements>;

  getShareholding(
    ticker: string
  ): Promise<Shareholding>;

  searchStocks(
    query: string
  ): Promise<StockSearchResult[]>;
}