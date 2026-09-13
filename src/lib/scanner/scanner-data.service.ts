import { mapWithConcurrency } from "../market/market-batch.service";

import type {
  ScannerCandle,
  ScannerStockData,
  ScannerStockFetchResult,
} from "./scanner.types";

/**
 * Base URL of the existing FastAPI market-data service.
 *
 * Example:
 * NEXT_PUBLIC_MARKET_DATA_SERVICE_URL=http://127.0.0.1:8000
 */
const MARKET_DATA_SERVICE_URL =
  process.env.MARKET_DATA_SERVICE_URL ??
  process.env.NEXT_PUBLIC_MARKET_DATA_SERVICE_URL ??
  "http://127.0.0.1:8000";

/* =========================================================
   TYPES
   ========================================================= */

interface HistoricalApiCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function normalizeCandle(
  candle: HistoricalApiCandle
): ScannerCandle {
  return {
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  };
}

/* =========================================================
   SINGLE STOCK
   ========================================================= */

/**
 * Fetch one stock's historical OHLCV data from the existing
 * FastAPI market-data service.
 *
 * This intentionally uses the existing endpoint:
 *
 * GET /api/historical/{ticker}?period=1y&interval=1d
 *
 * No direct Yahoo Finance calls are made from Next.js.
 */
export async function fetchScannerStockData(
  ticker: string
): Promise<ScannerStockData> {
  const normalizedTicker = normalizeTicker(ticker);

  if (!normalizedTicker) {
    throw new Error("Ticker is required.");
  }

  const url = new URL(
    `/api/historical/${encodeURIComponent(normalizedTicker)}`,
    MARKET_DATA_SERVICE_URL
  );

  url.searchParams.set("period", "1y");
  url.searchParams.set("interval", "1d");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `Historical data request failed with status ${response.status}.`;

    try {
      const errorBody: unknown = await response.json();

      if (
        typeof errorBody === "object" &&
        errorBody !== null &&
        "detail" in errorBody &&
        typeof errorBody.detail === "string"
      ) {
        detail = errorBody.detail;
      }
    } catch {
      // Keep the default error message when the response
      // does not contain readable JSON.
    }

    throw new Error(
      `${normalizedTicker}: ${detail}`
    );
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error(
      `${normalizedTicker}: Invalid historical data response.`
    );
  }

  const candles: ScannerCandle[] = [];

  for (const item of payload) {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      continue;
    }

    const candle = item as Partial<HistoricalApiCandle>;

    if (
      typeof candle.time !== "number" ||
      typeof candle.open !== "number" ||
      typeof candle.high !== "number" ||
      typeof candle.low !== "number" ||
      typeof candle.close !== "number" ||
      typeof candle.volume !== "number"
    ) {
      continue;
    }

    if (
      !Number.isFinite(candle.time) ||
      !Number.isFinite(candle.open) ||
      !Number.isFinite(candle.high) ||
      !Number.isFinite(candle.low) ||
      !Number.isFinite(candle.close) ||
      !Number.isFinite(candle.volume)
    ) {
      continue;
    }

    candles.push(
      normalizeCandle(candle as HistoricalApiCandle)
    );
  }

  if (candles.length === 0) {
    throw new Error(
      `${normalizedTicker}: No valid historical data returned.`
    );
  }

  candles.sort(
    (a, b) => a.time - b.time
  );

  return {
    ticker: normalizedTicker,
    candles,
  };
}

/* =========================================================
   MULTIPLE STOCKS
   ========================================================= */

/**
 * Fetch scanner data for multiple stocks.
 *
 * Concurrency is deliberately limited because the underlying
 * provider is Yahoo Finance and the scanner may request many
 * stocks during one sector scan.
 *
 * Individual ticker failures are captured instead of causing
 * the complete sector scan to fail.
 */
export async function fetchScannerStocksData(
  tickers: string[],
  concurrency = 4
): Promise<ScannerStockFetchResult[]> {
  const normalizedTickers = Array.from(
    new Set(
      tickers
        .map(normalizeTicker)
        .filter(Boolean)
    )
  );

  if (normalizedTickers.length === 0) {
    return [];
  }

  return mapWithConcurrency(
    normalizedTickers,
    concurrency,
    async (
      ticker
    ): Promise<ScannerStockFetchResult> => {
      try {
        const data =
          await fetchScannerStockData(ticker);

        return {
          ticker,
          success: true,
          data,
          error: null,
        };
      } catch (error) {
        return {
          ticker,
          success: false,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Unknown scanner data error.",
        };
      }
    }
  );
}