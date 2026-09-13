import { getSectorById } from "../../config/sectors";

import { fetchScannerStocksData } from "./scanner-data.service";

import { buildScannerStockResult } from "./signal-calculator";

import { detectSectorEvents } from "./event-detector";

import type {
  ScannerStockResult,
  SectorScanResult,
} from "./scanner.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const DEFAULT_CONCURRENCY = 4;

/**
 * Discovery threshold.
 *
 * This does NOT mean BUY / SELL / HOLD.
 */
const MIN_SCANNER_SCORE = 15;

/* =========================================================
   SECTOR SCANNER
   ========================================================= */

export async function scanSector(
  sectorId: string,
  concurrency = DEFAULT_CONCURRENCY
): Promise<SectorScanResult> {
  /* -------------------------------------------------------
     1. GET SECTOR CONFIGURATION
     ------------------------------------------------------- */

  const sector = getSectorById(sectorId);

  if (!sector) {
    throw new Error(
      `Unknown scanner sector: ${sectorId}`
    );
  }

  const tickers = sector.stockUniverse;

  if (tickers.length === 0) {
    throw new Error(
      `Sector "${sector.displayName}" has no stocks configured.`
    );
  }

  /* -------------------------------------------------------
     2. FETCH HISTORICAL DATA
     ------------------------------------------------------- */

  const fetchResults =
    await fetchScannerStocksData(
      tickers,
      concurrency
    );

  const successfulResults =
    fetchResults.filter(
      (result) =>
        result.success &&
        result.data !== null
    );

  const failedResults =
    fetchResults.filter(
      (result) =>
        !result.success ||
        result.data === null
    );

  /* -------------------------------------------------------
     3. CALCULATE SECTOR 20D RETURNS
     ------------------------------------------------------- */

  const stockReturns: number[] = [];

  for (const result of successfulResults) {
    if (!result.data) {
      continue;
    }

    const candles =
      result.data.candles;

    if (candles.length <= 20) {
      continue;
    }

    const current =
      candles[candles.length - 1].close;

    const previous =
      candles[
        candles.length - 1 - 20
      ].close;

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(previous) ||
      previous === 0
    ) {
      continue;
    }

    const return20D =
      ((current - previous) /
        previous) *
      100;

    if (Number.isFinite(return20D)) {
      stockReturns.push(return20D);
    }
  }

  /* -------------------------------------------------------
     4. CALCULATE TRUE SECTOR AVERAGE
     ------------------------------------------------------- */

  const sectorAverageReturn20D =
    stockReturns.length > 0
      ? stockReturns.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / stockReturns.length
      : null;

  /* -------------------------------------------------------
     5. BUILD STOCK RESULTS
     ------------------------------------------------------- */

  const stockResults: ScannerStockResult[] =
    [];

  for (const result of successfulResults) {
    if (!result.data) {
      continue;
    }

    try {
      const stockResult =
        buildScannerStockResult(
          result.ticker,
          result.data.candles,
          sectorAverageReturn20D
        );

      stockResults.push(
        stockResult
      );
    } catch (error) {
      failedResults.push({
        ticker: result.ticker,

        success: false,

        data: null,

        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate scanner signals.",
      });
    }
  }

  /* -------------------------------------------------------
     6. RANK STOCKS
     ------------------------------------------------------- */

  stockResults.sort(
    (a, b) =>
      b.scannerScore -
      a.scannerScore
  );

  /* -------------------------------------------------------
     7. DETECT RADAR EVENTS
     ------------------------------------------------------- */

  const sectorEvents =
    detectSectorEvents(
      stockResults
    );

  /* -------------------------------------------------------
     8. RETURN QUANTITATIVE RESULT
     ------------------------------------------------------- */

  return {
    sectorId: sector.id,

    sectorName:
      sector.displayName,

    scannedAt:
      new Date().toISOString(),

    totalStocks:
      tickers.length,

    successfulStocks:
      stockResults.length,

    failedStocks:
      failedResults.length,

    sectorAverageReturn20D,

    /**
     * Only stocks above the discovery threshold
     * are exposed as interesting stocks.
     */
    stocks:
      stockResults.filter(
        (stock) =>
          stock.scannerScore >=
          MIN_SCANNER_SCORE
      ),

    events:
      sectorEvents,

    failedTickers:
      failedResults.map(
        (result) => ({
          ticker:
            result.ticker,

          error:
            result.error ??
            "Unknown scanner error.",
        })
      ),
  };
}