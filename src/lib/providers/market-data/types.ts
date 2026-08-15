export interface StockQuote {
  ticker: string;
  companyName?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
  currency?: string;
  timestamp?: string;
}

export interface HistoricalData {
  date: string;
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
  debtToEquity?: number;
  roe?: number;
}

export interface StockSearchResult {
  ticker: string;
  companyName: string;
}