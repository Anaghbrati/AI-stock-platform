export interface StockQuote {
  ticker: string;
  companyName?: string;

  price?: number;
  change?: number;
  changePercent?: number;

  volume?: number;
  marketCap?: number;
  currency?: string;

  // 52 Week Range
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;

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

  // Valuation
  peRatio?: number;
  pbRatio?: number;

  // Profitability
  roe?: number;
  roce?: number;

  // Financial Health
  debtToEquity?: number;

  // Dividend
  dividendYield?: number;

  // Cash Flow
  freeCashFlow?: number;

  // Earnings
  eps?: number;

  // Company Size
  marketCap?: number;
}

export interface StockSearchResult {
  ticker: string;
  companyName: string;
}