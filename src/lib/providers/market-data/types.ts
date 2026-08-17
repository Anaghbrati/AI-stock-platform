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
  time: number;
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


export interface FinancialStatementPeriod {
  period: string;

  revenue?: number | null;
  grossProfit?: number | null;
  operatingIncome?: number | null;
  netIncome?: number | null;
  eps?: number | null;

  totalAssets?: number | null;
  totalLiabilities?: number | null;
  totalEquity?: number | null;
  cash?: number | null;
  totalDebt?: number | null;

  operatingCashFlow?: number | null;
  investingCashFlow?: number | null;
  financingCashFlow?: number | null;
  freeCashFlow?: number | null;
}


export interface FinancialStatements {
  ticker: string;

  annual: FinancialStatementPeriod[];

  quarterly: FinancialStatementPeriod[];
}


export interface Shareholding {
  ticker: string;

  promoterHolding?: number | null;

  institutionalHolding?: number | null;

  mutualFundHolding?: number | null;

  publicHolding?: number | null;

  insiderHolding?: number | null;
}


export interface StockSearchResult {
  ticker: string;
  companyName: string;
}