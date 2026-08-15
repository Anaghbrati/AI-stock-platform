export interface StockQuote {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  currency: string;
  timestamp: string;
}

export interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockFundamentals {
  ticker: string;
  peRatio?: number;
  pbRatio?: number;
  evToEbitda?: number;
  debtToEquity?: number;
  roe?: number;
  roce?: number;
  dividendYield?: number;
  freeCashFlow?: number;
}

export interface StockSearchResult {
  ticker: string;
  companyName: string;
  exchange: string;
  type: string;
}

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