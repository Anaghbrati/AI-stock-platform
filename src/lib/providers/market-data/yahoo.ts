import type {
  HistoricalData,
  StockFundamentals,
  StockQuote,
  StockSearchResult,
  FinancialStatements,
  Shareholding,
} from "./types";

import type { MarketDataProvider } from "./provider";

const MARKET_DATA_API =
  process.env.MARKET_DATA_API_URL ||
  "http://localhost:8000";

export class YahooFinanceProvider
  implements MarketDataProvider
{
  // ========================================
  // STOCK QUOTE
  // ========================================

  async getQuote(
    ticker: string
  ): Promise<StockQuote> {
    const response = await fetch(
      `${MARKET_DATA_API}/api/quote/${encodeURIComponent(
        ticker
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch quote for ${ticker}`
      );
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

      // 52 Week Range
      fiftyTwoWeekHigh:
        data.fiftyTwoWeekHigh,

      fiftyTwoWeekLow:
        data.fiftyTwoWeekLow,

      timestamp:
        new Date().toISOString(),
    };
  }


  // ========================================
  // HISTORICAL DATA
  // ========================================

  async getHistoricalData(
    ticker: string,
    range: string
  ): Promise<HistoricalData[]> {
    throw new Error(
      `Historical data not implemented yet: ${ticker}, ${range}`
    );
  }


  // ========================================
  // FUNDAMENTALS
  // ========================================

  async getFundamentals(
    ticker: string
  ): Promise<StockFundamentals> {

    const response = await fetch(
      `${MARKET_DATA_API}/api/fundamentals/${encodeURIComponent(
        ticker
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch fundamentals for ${ticker}`
      );
    }

    const data =
      await response.json();

    return {
      ticker: data.ticker,

      peRatio: data.peRatio,
      pbRatio: data.pbRatio,

      roe: data.roe,
      roce: data.roce,

      debtToEquity:
        data.debtToEquity,

      dividendYield:
        data.dividendYield,

      freeCashFlow:
        data.freeCashFlow,

      eps: data.eps,

      marketCap:
        data.marketCap,
    };
  }


  // ========================================
  // FINANCIAL STATEMENTS
  // ========================================

  async getFinancialStatements(
    ticker: string
  ): Promise<FinancialStatements> {

    const response = await fetch(
      `${MARKET_DATA_API}/api/financials/${encodeURIComponent(
        ticker
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch financial statements for ${ticker}`
      );
    }

    const data =
      await response.json();

    return {
      ticker:
        data.ticker ?? ticker,

      annual:
        data.annual ?? [],

      quarterly:
        data.quarterly ?? [],
    };
  }


  // ========================================
// SHAREHOLDING
// ========================================

async getShareholding(
  ticker: string
): Promise<Shareholding> {

  const response = await fetch(
    `${MARKET_DATA_API}/api/shareholding/${encodeURIComponent(
      ticker
    )}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch shareholding for ${ticker}`
    );
  }

  const data = await response.json();

  return {
  ticker:
    data.ticker ?? ticker,

  promoterHolding:
    data.promoterHolding ?? null,

  institutionalHolding:
    data.institutionalHolding ?? null,

  mutualFundHolding:
    data.mutualFundHolding ?? null,

  publicHolding:
    data.publicHolding ?? null,

  insiderHolding:
    data.insiderHolding ?? null,
};
}


  // ========================================
  // STOCK SEARCH
  // ========================================

  async searchStocks(
    query: string
  ): Promise<StockSearchResult[]> {
    throw new Error(
      `Stock search not implemented yet: ${query}`
    );
  }
}