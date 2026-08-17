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
    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      throw new Error("Ticker is required");
    }

    const maxAttempts = 3;

    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        const response = await fetch(
          `${MARKET_DATA_API}/api/quote/${encodeURIComponent(
            normalizedTicker
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json().catch(
            () => null
          );

        if (response.ok) {
          return {
            ticker:
              data?.ticker ??
              normalizedTicker,

            companyName:
              data?.companyName ??
              normalizedTicker,

            price:
              data?.price ?? null,

            change:
              data?.change ?? null,

            changePercent:
              data?.changePercent ?? null,

            volume:
              data?.volume ?? null,

            marketCap:
              data?.marketCap ?? null,

            currency:
              data?.currency ?? "INR",

            fiftyTwoWeekHigh:
              data?.fiftyTwoWeekHigh ??
              null,

            fiftyTwoWeekLow:
              data?.fiftyTwoWeekLow ??
              null,

            timestamp:
              new Date().toISOString(),
          };
        }

        lastError = new Error(
          data?.detail ||
            data?.error ||
            `Quote request failed with status ${response.status}`
        );

        console.warn(
          `[MarketData] Quote attempt ${attempt}/${maxAttempts} failed`,
          {
            ticker: normalizedTicker,
            status: response.status,
          }
        );
      } catch (error) {
        lastError = error;

        console.warn(
          `[MarketData] Quote attempt ${attempt}/${maxAttempts} failed`,
          error
        );
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            500 * attempt
          )
        );
      }
    }

    throw new Error(
      `Failed to fetch quote for ${normalizedTicker} after ${maxAttempts} attempts`,
      {
        cause: lastError,
      }
    );
  }

  // ========================================
  // HISTORICAL DATA
  // ========================================

  async getHistoricalData(
    ticker: string,
    period: string = "1y",
    interval: string = "1d"
  ): Promise<HistoricalData[]> {
    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      throw new Error("Ticker is required");
    }

    const normalizedPeriod =
      period.trim().toLowerCase();

    const normalizedInterval =
      interval.trim().toLowerCase();

    if (
      !normalizedPeriod ||
      !normalizedInterval
    ) {
      throw new Error(
        "Historical period and interval are required"
      );
    }

    const url =
      `${MARKET_DATA_API}/api/historical/` +
      `${encodeURIComponent(normalizedTicker)}` +
      `?period=${encodeURIComponent(
        normalizedPeriod
      )}` +
      `&interval=${encodeURIComponent(
        normalizedInterval
      )}`;

    console.log(
      "[MarketData] Historical request:",
      url
    );

    const response = await fetch(
      url,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json().catch(
        () => null
      );

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.error ||
          `Failed to fetch historical data for ${normalizedTicker} (${response.status})`
      );
    }

    if (!Array.isArray(data)) {
      throw new Error(
        `Invalid historical data returned for ${normalizedTicker}`
      );
    }

    const historicalData =
      data
        .filter((item: unknown) => {
          if (
            !item ||
            typeof item !== "object"
          ) {
            return false;
          }

          const row =
            item as Record<
              string,
              unknown
            >;

          return (
            Number.isFinite(
              Number(row.time)
            ) &&
            Number.isFinite(
              Number(row.open)
            ) &&
            Number.isFinite(
              Number(row.high)
            ) &&
            Number.isFinite(
              Number(row.low)
            ) &&
            Number.isFinite(
              Number(row.close)
            )
          );
        })
        .map(
          (
            item: Record<
              string,
              unknown
            >
          ): HistoricalData => ({
            time: Number(item.time),

            open: Number(item.open),

            high: Number(item.high),

            low: Number(item.low),

            close: Number(item.close),

            volume:
              Number.isFinite(
                Number(item.volume)
              )
                ? Number(item.volume)
                : 0,
          })
        );

    historicalData.sort(
      (a, b) =>
        a.time - b.time
    );

    return historicalData;
  }

  // ========================================
  // FUNDAMENTALS
  // ========================================

  async getFundamentals(
    ticker: string
  ): Promise<StockFundamentals> {
    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      throw new Error("Ticker is required");
    }

    const response = await fetch(
      `${MARKET_DATA_API}/api/fundamentals/${encodeURIComponent(
        normalizedTicker
      )}`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json().catch(
        () => null
      );

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.error ||
          `Failed to fetch fundamentals for ${normalizedTicker}`
      );
    }

    return {
      ticker:
        data?.ticker ??
        normalizedTicker,

      peRatio:
        data?.peRatio ?? null,

      pbRatio:
        data?.pbRatio ?? null,

      roe:
        data?.roe ?? null,

      roce:
        data?.roce ?? null,

      debtToEquity:
        data?.debtToEquity ?? null,

      dividendYield:
        data?.dividendYield ?? null,

      freeCashFlow:
        data?.freeCashFlow ?? null,

      eps:
        data?.eps ?? null,

      marketCap:
        data?.marketCap ?? null,
    };
  }

  // ========================================
  // FINANCIAL STATEMENTS
  // ========================================

  async getFinancialStatements(
    ticker: string
  ): Promise<FinancialStatements> {
    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      throw new Error("Ticker is required");
    }

    const response = await fetch(
      `${MARKET_DATA_API}/api/financials/${encodeURIComponent(
        normalizedTicker
      )}`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json().catch(
        () => null
      );

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.error ||
          `Failed to fetch financial statements for ${normalizedTicker}`
      );
    }

    return {
      ticker:
        data?.ticker ??
        normalizedTicker,

      annual:
        Array.isArray(data?.annual)
          ? data.annual
          : [],

      quarterly:
        Array.isArray(
          data?.quarterly
        )
          ? data.quarterly
          : [],
    };
  }

  // ========================================
  // SHAREHOLDING
  // ========================================

  async getShareholding(
    ticker: string
  ): Promise<Shareholding> {
    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      throw new Error("Ticker is required");
    }

    const response = await fetch(
      `${MARKET_DATA_API}/api/shareholding/${encodeURIComponent(
        normalizedTicker
      )}`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json().catch(
        () => null
      );

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.error ||
          `Failed to fetch shareholding for ${normalizedTicker}`
      );
    }

    return {
      ticker:
        data?.ticker ??
        normalizedTicker,

      promoterHolding:
        data?.promoterHolding ??
        null,

      institutionalHolding:
        data?.institutionalHolding ??
        null,

      mutualFundHolding:
        data?.mutualFundHolding ??
        null,

      publicHolding:
        data?.publicHolding ??
        null,

      insiderHolding:
        data?.insiderHolding ??
        null,
    };
  }

  // ========================================
  // STOCK SEARCH
  // ========================================

  async searchStocks(
    query: string
  ): Promise<StockSearchResult[]> {
    const normalizedQuery =
      query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const response = await fetch(
      `${MARKET_DATA_API}/api/search?q=${encodeURIComponent(
        normalizedQuery
      )}`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json().catch(
        () => null
      );

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.error ||
          `Failed to search stocks for "${normalizedQuery}"`
      );
    }

    const results =
      Array.isArray(data)
        ? data
        : Array.isArray(
            data?.results
          )
        ? data.results
        : [];

    return results.map(
      (
        item: any
      ): StockSearchResult => ({
        ticker:
          item?.ticker ??
          item?.symbol ??
          "",

        companyName:
          item?.companyName ??
          item?.longname ??
          item?.shortname ??
          item?.name ??
          item?.ticker ??
          item?.symbol ??
          "",
      })
    );
  }
}