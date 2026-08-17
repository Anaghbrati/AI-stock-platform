import { getMarketDataProvider } from "../providers/market-data";

import type {
  HistoricalData,
  StockFundamentals,
  StockQuote,
  FinancialStatements,
  Shareholding,
} from "../providers/market-data/types";

// ========================================
// STOCK QUOTE
// ========================================

export async function getStockQuote(
  ticker: string
): Promise<StockQuote> {
  const normalizedTicker = ticker
    .trim()
    .toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const provider = getMarketDataProvider();

  return provider.getQuote(normalizedTicker);
}

// ========================================
// STOCK FUNDAMENTALS
// ========================================

export async function getStockFundamentals(
  ticker: string
): Promise<StockFundamentals> {
  const normalizedTicker = ticker
    .trim()
    .toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const provider = getMarketDataProvider();

  return provider.getFundamentals(normalizedTicker);
}

// ========================================
// HISTORICAL DATA
// ========================================

export async function getHistoricalData(
  ticker: string,
  period: string = "1y",
  interval: string = "1d"
): Promise<HistoricalData[]> {
  const normalizedTicker = ticker
    .trim()
    .toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const normalizedPeriod = period
    .trim()
    .toLowerCase();

  const normalizedInterval = interval
    .trim()
    .toLowerCase();

  const provider = getMarketDataProvider();

  const data = await provider.getHistoricalData(
    normalizedTicker,
    normalizedPeriod,
    normalizedInterval
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item: any) => ({
      time: Number(item?.time),

      open: Number(item?.open),

      high: Number(item?.high),

      low: Number(item?.low),

      close: Number(item?.close),

      volume: Number(item?.volume ?? 0),
    }))
    .filter((item) => {
      return (
        Number.isFinite(item.time) &&
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close)
      );
    })
    .sort((a, b) => a.time - b.time);
}

// ========================================
// FINANCIAL STATEMENTS
// ========================================

export async function getFinancialStatements(
  ticker: string
): Promise<FinancialStatements> {
  const normalizedTicker = ticker
    .trim()
    .toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const provider = getMarketDataProvider();

  return provider.getFinancialStatements(
    normalizedTicker
  );
}

// ========================================
// SHAREHOLDING
// ========================================

export async function getShareholding(
  ticker: string
): Promise<Shareholding> {
  const normalizedTicker = ticker
    .trim()
    .toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const provider = getMarketDataProvider();

  return provider.getShareholding(
    normalizedTicker
  );
}