import type { HistoricalData } from "../providers/market-data/types";

interface CacheEntry {
  data: HistoricalData[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

const inFlightRequests = new Map<
  string,
  Promise<HistoricalData[]>
>();

const CACHE_TTL = 5 * 60 * 1000;

/* =========================================================
   CACHE KEY
========================================================= */

function createCacheKey(
  ticker: string,
  period: string,
  interval: string
): string {
  return `${ticker.trim().toUpperCase()}:${period
    .trim()
    .toLowerCase()}:${interval
    .trim()
    .toLowerCase()}`;
}

/* =========================================================
   CACHE
========================================================= */

export function getHistoricalCache(
  ticker: string,
  period: string,
  interval: string
): HistoricalData[] | null {
  const key = createCacheKey(
    ticker,
    period,
    interval
  );

  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  /*
   * Remove expired cache entries.
   */
  if (
    Date.now() - entry.timestamp >
    CACHE_TTL
  ) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/* =========================================================
   SET CACHE
========================================================= */

export function setHistoricalCache(
  ticker: string,
  period: string,
  interval: string,
  data: HistoricalData[]
): void {
  const key = createCacheKey(
    ticker,
    period,
    interval
  );

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/* =========================================================
   CLEAR CACHE
========================================================= */

export function clearHistoricalCache(): void {
  cache.clear();
}

/* =========================================================
   IN-FLIGHT REQUESTS
========================================================= */

export function getInFlightRequest(
  ticker: string,
  period: string,
  interval: string
): Promise<HistoricalData[]> | null {
  const key = createCacheKey(
    ticker,
    period,
    interval
  );

  return (
    inFlightRequests.get(key) ??
    null
  );
}

/* =========================================================
   SET IN-FLIGHT REQUEST
========================================================= */

export function setInFlightRequest(
  ticker: string,
  period: string,
  interval: string,
  request: Promise<HistoricalData[]>
): void {
  const key = createCacheKey(
    ticker,
    period,
    interval
  );

  inFlightRequests.set(
    key,
    request
  );
}

/* =========================================================
   CLEAR IN-FLIGHT REQUEST
========================================================= */

export function clearInFlightRequest(
  ticker: string,
  period: string,
  interval: string
): void {
  const key = createCacheKey(
    ticker,
    period,
    interval
  );

  inFlightRequests.delete(key);
}