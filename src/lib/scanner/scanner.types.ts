/**
 * Core types used by the AI Market Scanner.
 *
 * The scanner discovers interesting stocks using quantitative evidence.
 * It does not make BUY / SELL / HOLD recommendations.
 */

/* =========================================================
   HISTORICAL MARKET DATA
   ========================================================= */

export interface ScannerCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/* =========================================================
   SCANNER DATA RESULT
   ========================================================= */

export interface ScannerStockData {
  ticker: string;
  candles: ScannerCandle[];
}

/* =========================================================
   FETCH RESULT
   ========================================================= */

export interface ScannerStockFetchResult {
  ticker: string;
  success: boolean;
  data: ScannerStockData | null;
  error: string | null;
}

/* =========================================================
   QUANTITATIVE SIGNALS
   ========================================================= */

export interface ScannerSignals {
  /**
   * Price performance over different periods.
   *
   * Values are percentages.
   */
  return1D: number | null;
  return5D: number | null;
  return20D: number | null;
  return50D: number | null;

  /**
   * Moving averages.
   */
  movingAverage20D: number | null;
  movingAverage50D: number | null;

  /**
   * Current price relative to moving averages.
   *
   * Values are percentages.
   */
  distanceFromMA20: number | null;
  distanceFromMA50: number | null;

  /**
   * Volume behaviour.
   */
  averageVolume20D: number | null;
  latestVolume: number | null;
  volumeRatio20D: number | null;

  /**
   * Volatility measured from daily returns.
   */
  volatility20D: number | null;

  /**
   * Position relative to the recent 52-week range.
   *
   * Value is expressed as a percentage from 0 to 100.
   */
  fiftyTwoWeekPosition: number | null;

  /**
   * Distance from the highest close in the available
   * 1-year dataset.
   *
   * Value is expressed as a percentage.
   */
  distanceFrom52WeekHigh: number | null;
}

/* =========================================================
   RELATIVE SECTOR PERFORMANCE
   ========================================================= */

export interface RelativeSectorPerformance {
  /**
   * Stock's 20-day return.
   */
  stockReturn20D: number | null;

  /**
   * Average 20-day return of successfully scanned
   * stocks in the sector.
   */
  sectorAverageReturn20D: number | null;

  /**
   * Stock return minus sector average return.
   *
   * Positive = outperforming sector.
   * Negative = underperforming sector.
   */
  relativePerformance20D: number | null;
}

/* =========================================================
   STOCK SCAN RESULT
   ========================================================= */

export interface ScannerStockResult {
  ticker: string;

  signals: ScannerSignals;

  relativePerformance: RelativeSectorPerformance;

  /**
   * Numerical score used to rank stocks inside the sector.
   *
   * This is NOT an investment recommendation.
   */
  scannerScore: number;

  /**
   * Human-readable quantitative observations.
   *
   * Example:
   * "20D momentum is significantly above the sector average."
   */
  observations: string[];
}

/* =========================================================
   RADAR EVENTS
   ========================================================= */

/**
 * Quantitative event types detected by the Radar.
 *
 * These events describe unusual or notable market behaviour.
 * They are not investment recommendations.
 */
export type ScannerEventType =
  | "unusual_volume"
  | "strong_momentum"
  | "relative_strength"
  | "relative_weakness"
  | "moving_average_deviation"
  | "volatility_spike"
  | "near_52_week_high"
  | "near_52_week_low";

/**
 * Event severity is based on the strength of the
 * quantitative evidence.
 */
export type ScannerEventSeverity =
  | "low"
  | "medium"
  | "high";

/**
 * A single quantitative Radar event for a stock.
 */
export interface ScannerEvent {
  ticker: string;

  type: ScannerEventType;

  severity: ScannerEventSeverity;

  title: string;

  description: string;

  /**
   * Numerical value associated with the event.
   *
   * Examples:
   * - volume ratio: 2.4
   * - momentum: 12.5
   * - relative performance: 6.8
   */
  value: number | null;

  /**
   * Unit used when displaying the value.
   *
   * "%" = percentage
   * "x" = ratio
   * null = no unit
   */
  unit: "%" | "x" | null;
}

/**
 * Aggregated Radar events for a sector scan.
 */
export interface SectorScannerEvents {
  totalEvents: number;

  highSeverityEvents: number;

  mediumSeverityEvents: number;

  lowSeverityEvents: number;

  events: ScannerEvent[];
}

/* =========================================================
   SECTOR SCAN RESULT
   ========================================================= */

export interface SectorScanResult {
  /**
   * Internal sector identifier.
   *
   * Example:
   * "banking"
   */
  sectorId: string;

  /**
   * Human-readable sector name.
   *
   * Example:
   * "Banking"
   */
  sectorName: string;

  /**
   * ISO timestamp representing when the scan completed.
   */
  scannedAt: string;

  /**
   * Number of stocks configured in the sector universe.
   */
  totalStocks: number;

  /**
   * Number of stocks successfully scanned and processed.
   */
  successfulStocks: number;

  /**
   * Number of stocks that failed during fetching
   * or signal calculation.
   */
  failedStocks: number;

  /**
   * Average 20-day return across all successfully
   * scanned stocks in the sector.
   *
   * This is used as the baseline for relative-strength
   * calculations and sector-level AI interpretation.
   */
  sectorAverageReturn20D: number | null;

  /**
   * Stocks discovered by the quantitative scanner.
   *
   * This array contains the stocks that pass the scanner
   * score threshold used by the sector scanner.
   */
  stocks: ScannerStockResult[];

  /**
   * Quantitative Radar events detected across the sector.
   */
  events: SectorScannerEvents;

  /**
   * Individual ticker failures.
   *
   * A failure for one stock must not fail the entire
   * sector scan.
   */
  failedTickers: Array<{
    ticker: string;
    error: string;
  }>;
}