import { getMarketDataProvider } from "../providers/market-data";

import {
  getHistoricalCache,
  setHistoricalCache,
  getInFlightRequest,
  setInFlightRequest,
  clearInFlightRequest,
} from "../cache/historical-cache";

import type {
  HistoricalData,
  StockFundamentals,
  StockQuote,
  FinancialStatements,
  Shareholding,
} from "../providers/market-data/types";

/* =========================================================
   PERFORMANCE HELPERS
========================================================= */

function startTimer(): number {
  return performance.now();
}

function logPerformance(
  operation: string,
  ticker: string,
  startTime: number,
  extra?: Record<string, unknown>
): void {
  const duration =
    performance.now() - startTime;

  console.log(
    `[Performance] ${operation}`,
    {
      ticker,
      duration: `${duration.toFixed(2)}ms`,
      ...extra,
    }
  );
}

/* =========================================================
   STOCK QUOTE
========================================================= */

export async function getStockQuote(
  ticker: string
): Promise<StockQuote | null> {
  const normalizedTicker =
    normalizeTicker(ticker);

  const startTime =
    startTimer();

  try {
    const provider =
      getMarketDataProvider();

    const result =
      await provider.getQuote(
        normalizedTicker
      );

    logPerformance(
      "Quote",
      normalizedTicker,
      startTime
    );

    return result;
  } catch (error) {
    logPerformance(
      "Quote FAILED",
      normalizedTicker,
      startTime
    );

    console.error(
      `getStockQuote failed for ${normalizedTicker}:`,
      error
    );

    return null;
  }
}

/* =========================================================
   FUNDAMENTALS
========================================================= */

export async function getStockFundamentals(
  ticker: string
): Promise<StockFundamentals | null> {
  const normalizedTicker =
    normalizeTicker(ticker);

  const startTime =
    startTimer();

  try {
    const provider =
      getMarketDataProvider();

    const result =
      await provider.getFundamentals(
        normalizedTicker
      );

    logPerformance(
      "Fundamentals",
      normalizedTicker,
      startTime
    );

    return result;
  } catch (error) {
    logPerformance(
      "Fundamentals FAILED",
      normalizedTicker,
      startTime
    );

    console.error(
      `getStockFundamentals failed for ${normalizedTicker}:`,
      error
    );

    return null;
  }
}

/* =========================================================
   HISTORICAL DATA
   CACHE + IN-FLIGHT DEDUPLICATION
========================================================= */

export async function getHistoricalData(
  ticker: string,
  period: string = "1y",
  interval: string = "1d"
): Promise<HistoricalData[]> {
  const normalizedTicker =
    normalizeTicker(ticker);

  const normalizedPeriod =
    period.trim().toLowerCase();

  const normalizedInterval =
    interval.trim().toLowerCase();

  if (!normalizedPeriod) {
    throw new Error(
      "Historical period is required"
    );
  }

  if (!normalizedInterval) {
    throw new Error(
      "Historical interval is required"
    );
  }

  const startTime =
    startTimer();

  /* =======================================================
     1. CACHE
  ======================================================= */

  const cachedData =
    getHistoricalCache(
      normalizedTicker,
      normalizedPeriod,
      normalizedInterval
    );

  if (cachedData) {
    logPerformance(
      "Historical CACHE HIT",
      normalizedTicker,
      startTime,
      {
        period: normalizedPeriod,
        interval: normalizedInterval,
        points: cachedData.length,
      }
    );

    return cachedData;
  }

  console.log(
    "[HistoricalData] Cache MISS:",
    {
      ticker: normalizedTicker,
      period: normalizedPeriod,
      interval: normalizedInterval,
    }
  );

  /* =======================================================
     2. IN-FLIGHT REQUEST
  ======================================================= */

  const existingRequest =
    getInFlightRequest(
      normalizedTicker,
      normalizedPeriod,
      normalizedInterval
    );

  if (existingRequest) {
    console.log(
      "[HistoricalData] Reusing in-flight request:",
      {
        ticker: normalizedTicker,
        period: normalizedPeriod,
        interval: normalizedInterval,
      }
    );

    const result =
      await existingRequest;

    logPerformance(
      "Historical IN-FLIGHT REUSE",
      normalizedTicker,
      startTime,
      {
        period: normalizedPeriod,
        interval: normalizedInterval,
        points: result.length,
      }
    );

    return result;
  }

  /* =======================================================
     3. PROVIDER
  ======================================================= */

  const provider =
    getMarketDataProvider();

  const providerStartTime =
    startTimer();

  /*
   * Explicitly type the promise.
   *
   * This guarantees that the cache,
   * provider and service all use
   * HistoricalData[].
   */

  const request: Promise<HistoricalData[]> =
    provider
      .getHistoricalData(
        normalizedTicker,
        normalizedPeriod,
        normalizedInterval
      )
      .then((data): HistoricalData[] => {
        /* =================================================
           4. VALIDATE
        ================================================= */

        if (!Array.isArray(data)) {
          console.warn(
            `[HistoricalData] Provider returned invalid data for ${normalizedTicker}`
          );

          return [];
        }

        /* =================================================
           5. NORMALIZE
        ================================================= */

        const historicalData =
          data
            .map((item): HistoricalData => ({
              time: Number(
                item?.time
              ),

              open: Number(
                item?.open
              ),

              high: Number(
                item?.high
              ),

              low: Number(
                item?.low
              ),

              close: Number(
                item?.close
              ),

              volume: Number(
                item?.volume ?? 0
              ),
            }))
            .filter((item) => {
              return (
                Number.isFinite(
                  item.time
                ) &&
                Number.isFinite(
                  item.open
                ) &&
                Number.isFinite(
                  item.high
                ) &&
                Number.isFinite(
                  item.low
                ) &&
                Number.isFinite(
                  item.close
                ) &&
                Number.isFinite(
                  item.volume
                )
              );
            })
            .sort(
              (a, b) =>
                a.time - b.time
            );

        /* =================================================
           6. PROVIDER PERFORMANCE
        ================================================= */

        logPerformance(
          "Historical PROVIDER",
          normalizedTicker,
          providerStartTime,
          {
            period:
              normalizedPeriod,

            interval:
              normalizedInterval,

            points:
              historicalData.length,
          }
        );

        /* =================================================
           7. CACHE
        ================================================= */

        setHistoricalCache(
          normalizedTicker,
          normalizedPeriod,
          normalizedInterval,
          historicalData
        );

        console.log(
          "[HistoricalData] Cached:",
          {
            ticker:
              normalizedTicker,

            period:
              normalizedPeriod,

            interval:
              normalizedInterval,

            points:
              historicalData.length,
          }
        );

        return historicalData;
      })
      .finally(() => {
        /* =================================================
           8. REMOVE IN-FLIGHT REQUEST
        ================================================= */

        clearInFlightRequest(
          normalizedTicker,
          normalizedPeriod,
          normalizedInterval
        );

        logPerformance(
          "Historical TOTAL",
          normalizedTicker,
          startTime,
          {
            period:
              normalizedPeriod,

            interval:
              normalizedInterval,
          }
        );
      });

  /* =======================================================
     9. STORE IN-FLIGHT REQUEST
  ======================================================= */

  setInFlightRequest(
    normalizedTicker,
    normalizedPeriod,
    normalizedInterval,
    request
  );

  return request;
}

/* =========================================================
   FINANCIAL STATEMENTS
========================================================= */

export async function getFinancialStatements(
  ticker: string
): Promise<FinancialStatements | null> {
  const normalizedTicker =
    normalizeTicker(ticker);

  const startTime =
    startTimer();

  try {
    const provider =
      getMarketDataProvider();

    const result =
      await provider.getFinancialStatements(
        normalizedTicker
      );

    logPerformance(
      "Financial Statements",
      normalizedTicker,
      startTime
    );

    return result;
  } catch (error) {
    logPerformance(
      "Financial Statements FAILED",
      normalizedTicker,
      startTime
    );

    console.error(
      `getFinancialStatements failed for ${normalizedTicker}:`,
      error
    );

    return null;
  }
}

/* =========================================================
   SHAREHOLDING
========================================================= */

export async function getShareholding(
  ticker: string
): Promise<Shareholding | null> {
  const normalizedTicker =
    normalizeTicker(ticker);

  const startTime =
    startTimer();

  try {
    const provider =
      getMarketDataProvider();

    const result =
      await provider.getShareholding(
        normalizedTicker
      );

    logPerformance(
      "Shareholding",
      normalizedTicker,
      startTime
    );

    return result;
  } catch (error) {
    logPerformance(
      "Shareholding FAILED",
      normalizedTicker,
      startTime
    );

    console.error(
      `getShareholding failed for ${normalizedTicker}:`,
      error
    );

    return null;
  }
}

/* =========================================================
   STOCK PAGE DATA
   PARALLEL API FETCH
========================================================= */

export async function getStockPageData(
  ticker: string
) {
  const normalizedTicker =
    normalizeTicker(ticker);

  const startTime =
    startTimer();

  const provider =
    getMarketDataProvider();

  console.log(
    "[Performance] Stock page parallel fetch START:",
    normalizedTicker
  );

  const [
    quote,
    fundamentals,
    financialStatements,
    shareholding,
  ] = await Promise.all([
    provider
      .getQuote(normalizedTicker)
      .catch((error) => {
        console.error(
          `Quote failed for ${normalizedTicker}:`,
          error
        );

        return null;
      }),

    provider
      .getFundamentals(
        normalizedTicker
      )
      .catch((error) => {
        console.error(
          `Fundamentals failed for ${normalizedTicker}:`,
          error
        );

        return null;
      }),

    provider
      .getFinancialStatements(
        normalizedTicker
      )
      .catch((error) => {
        console.error(
          `Financial statements failed for ${normalizedTicker}:`,
          error
        );

        return null;
      }),

    provider
      .getShareholding(
        normalizedTicker
      )
      .catch((error) => {
        console.error(
          `Shareholding failed for ${normalizedTicker}:`,
          error
        );

        return null;
      }),
  ]);

  logPerformance(
    "Stock Page Parallel APIs TOTAL",
    normalizedTicker,
    startTime
  );

  return {
    quote,
    fundamentals,
    financialStatements,
    shareholding,
  };
}

/* =========================================================
   TICKER NORMALIZATION
========================================================= */

function normalizeTicker(
  ticker: string
): string {
  const normalizedTicker =
    ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error(
      "Ticker is required"
    );
  }

  return normalizedTicker;
}