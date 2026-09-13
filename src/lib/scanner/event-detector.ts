import type {
  ScannerSignals,
  ScannerStockResult,
} from "./scanner.types";

/* =========================================================
   TYPES
   ========================================================= */

export type ScannerEventType =
  | "unusual_volume"
  | "strong_momentum"
  | "relative_strength"
  | "relative_weakness"
  | "moving_average_deviation"
  | "volatility_spike"
  | "near_52_week_high"
  | "near_52_week_low";

export type ScannerEventSeverity =
  | "low"
  | "medium"
  | "high";

export interface ScannerEvent {
  ticker: string;
  type: ScannerEventType;
  severity: ScannerEventSeverity;
  title: string;
  description: string;
  value: number | null;
  unit: "%" | "x" | null;
}

/* =========================================================
   HELPERS
   ========================================================= */

function createEvent(
  ticker: string,
  type: ScannerEventType,
  severity: ScannerEventSeverity,
  title: string,
  description: string,
  value: number | null,
  unit: "%" | "x" | null
): ScannerEvent {
  return {
    ticker,
    type,
    severity,
    title,
    description,
    value,
    unit,
  };
}

/* =========================================================
   EVENT DETECTOR
   ========================================================= */

export function detectScannerEvents(
  stock: ScannerStockResult
): ScannerEvent[] {
  const events: ScannerEvent[] = [];

  const {
    ticker,
    signals,
    relativePerformance,
  } = stock;

  /* -------------------------------------------------------
     1. UNUSUAL VOLUME
     ------------------------------------------------------- */

  if (
    signals.volumeRatio20D !== null &&
    signals.volumeRatio20D >= 2
  ) {
    const severity =
      signals.volumeRatio20D >= 3
        ? "high"
        : signals.volumeRatio20D >= 2.5
          ? "medium"
          : "low";

    events.push(
      createEvent(
        ticker,
        "unusual_volume",
        severity,
        "Unusual volume activity",
        `Latest volume is ${signals.volumeRatio20D}x the 20D average.`,
        signals.volumeRatio20D,
        "x"
      )
    );
  }

  /* -------------------------------------------------------
     2. STRONG MOMENTUM
     ------------------------------------------------------- */

  if (
    signals.return20D !== null &&
    Math.abs(signals.return20D) >= 10
  ) {
    const positive =
      signals.return20D > 0;

    events.push(
      createEvent(
        ticker,
        "strong_momentum",
        signals.return20D >= 15 ||
          signals.return20D <= -15
          ? "high"
          : "medium",
        positive
          ? "Strong positive momentum"
          : "Strong negative momentum",
        `The stock moved ${signals.return20D}% over the last 20 trading sessions.`,
        signals.return20D,
        "%"
      )
    );
  }

  /* -------------------------------------------------------
     3. RELATIVE STRENGTH
     ------------------------------------------------------- */

  if (
    relativePerformance.relativePerformance20D !==
      null &&
    relativePerformance.relativePerformance20D >= 5
  ) {
    events.push(
      createEvent(
        ticker,
        "relative_strength",
        relativePerformance.relativePerformance20D >= 10
          ? "high"
          : "medium",
        "Relative strength",
        `The stock outperformed the sector average by ${relativePerformance.relativePerformance20D} percentage points over 20 trading sessions.`,
        relativePerformance.relativePerformance20D,
        "%"
      )
    );
  }

  /* -------------------------------------------------------
     4. RELATIVE WEAKNESS
     ------------------------------------------------------- */

  if (
    relativePerformance.relativePerformance20D !==
      null &&
    relativePerformance.relativePerformance20D <= -5
  ) {
    events.push(
      createEvent(
        ticker,
        "relative_weakness",
        relativePerformance.relativePerformance20D <= -10
          ? "high"
          : "medium",
        "Relative weakness",
        `The stock underperformed the sector average by ${Math.abs(
          relativePerformance.relativePerformance20D
        )} percentage points over 20 trading sessions.`,
        relativePerformance.relativePerformance20D,
        "%"
      )
    );
  }

  /* -------------------------------------------------------
     5. MOVING AVERAGE DEVIATION
     ------------------------------------------------------- */

  const ma20 =
    signals.distanceFromMA20;

  const ma50 =
    signals.distanceFromMA50;

  if (
    ma20 !== null &&
    Math.abs(ma20) >= 8
  ) {
    events.push(
      createEvent(
        ticker,
        "moving_average_deviation",
        Math.abs(ma20) >= 12
          ? "high"
          : "medium",
        ma20 > 0
          ? "Price extended above 20D average"
          : "Price extended below 20D average",
        `Price is ${Math.abs(ma20)}% ${
          ma20 > 0 ? "above" : "below"
        } the 20D moving average.`,
        ma20,
        "%"
      )
    );
  }

  if (
    ma50 !== null &&
    Math.abs(ma50) >= 10
  ) {
    events.push(
      createEvent(
        ticker,
        "moving_average_deviation",
        Math.abs(ma50) >= 15
          ? "high"
          : "medium",
        ma50 > 0
          ? "Price extended above 50D average"
          : "Price extended below 50D average",
        `Price is ${Math.abs(ma50)}% ${
          ma50 > 0 ? "above" : "below"
        } the 50D moving average.`,
        ma50,
        "%"
      )
    );
  }

  /* -------------------------------------------------------
     6. VOLATILITY SPIKE
     ------------------------------------------------------- */

  if (
    signals.volatility20D !== null &&
    signals.volatility20D >= 3
  ) {
    events.push(
      createEvent(
        ticker,
        "volatility_spike",
        signals.volatility20D >= 5
          ? "high"
          : "medium",
        "Elevated volatility",
        `20D daily volatility is ${signals.volatility20D}%.`,
        signals.volatility20D,
        "%"
      )
    );
  }

  /* -------------------------------------------------------
     7. NEAR 52-WEEK HIGH
     ------------------------------------------------------- */

  if (
    signals.distanceFrom52WeekHigh !== null &&
    signals.distanceFrom52WeekHigh >= -5
  ) {
    events.push(
      createEvent(
        ticker,
        "near_52_week_high",
        signals.distanceFrom52WeekHigh >= -2
          ? "high"
          : "medium",
        "Near 52-week high",
        `Price is within ${Math.abs(
          signals.distanceFrom52WeekHigh
        )}% of the highest closing level in the available 1-year data.`,
        signals.distanceFrom52WeekHigh,
        "%"
      )
    );
  }

  /* -------------------------------------------------------
     8. NEAR 52-WEEK LOW
     ------------------------------------------------------- */

  if (
    signals.fiftyTwoWeekPosition !== null &&
    signals.fiftyTwoWeekPosition <= 5
  ) {
    events.push(
      createEvent(
        ticker,
        "near_52_week_low",
        signals.fiftyTwoWeekPosition <= 2
          ? "high"
          : "medium",
        "Near 52-week low",
        `Price is near the lowest closing level in the available 1-year data.`,
        signals.fiftyTwoWeekPosition,
        "%"
      )
    );
  }

  return events;
}

/* =========================================================
   SECTOR EVENT COLLECTION
   ========================================================= */

export interface SectorScannerEvents {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  events: ScannerEvent[];
}

/**
 * Detect events across all stocks returned by a sector scan.
 */
export function detectSectorEvents(
  stocks: ScannerStockResult[]
): SectorScannerEvents {
  const events: ScannerEvent[] = [];

  for (const stock of stocks) {
    events.push(
      ...detectScannerEvents(stock)
    );
  }

  return {
    totalEvents: events.length,

    highSeverityEvents:
      events.filter(
        (event) =>
          event.severity === "high"
      ).length,

    mediumSeverityEvents:
      events.filter(
        (event) =>
          event.severity === "medium"
      ).length,

    lowSeverityEvents:
      events.filter(
        (event) =>
          event.severity === "low"
      ).length,

    events,
  };
}