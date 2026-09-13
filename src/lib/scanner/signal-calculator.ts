import type {
  RelativeSectorPerformance,
  ScannerCandle,
  ScannerSignals,
  ScannerStockResult,
} from "./scanner.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const TRADING_DAYS_5 = 5;
const TRADING_DAYS_20 = 20;
const TRADING_DAYS_50 = 50;
const TRADING_DAYS_252 = 252;

const EPSILON = 0.000001;

/* =========================================================
   HELPERS
   ========================================================= */

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function percentageChange(
  current: number,
  previous: number
): number | null {
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    Math.abs(previous) < EPSILON
  ) {
    return null;
  }

  return round(((current - previous) / previous) * 100);
}

function getClose(
  candles: ScannerCandle[],
  index: number
): number | null {
  const candle = candles[index];

  if (!candle || !Number.isFinite(candle.close)) {
    return null;
  }

  return candle.close;
}

function average(values: number[]): number | null {
  const validValues = values.filter(Number.isFinite);

  if (validValues.length === 0) {
    return null;
  }

  return (
    validValues.reduce(
      (sum, value) => sum + value,
      0
    ) / validValues.length
  );
}

function standardDeviation(values: number[]): number | null {
  const validValues = values.filter(Number.isFinite);

  if (validValues.length < 2) {
    return null;
  }

  const mean = validValues.reduce(
    (sum, value) => sum + value,
    0
  ) / validValues.length;

  const variance =
    validValues.reduce(
      (sum, value) =>
        sum + (value - mean) ** 2,
      0
    ) / validValues.length;

  return Math.sqrt(variance);
}

/* =========================================================
   MOVING AVERAGE
   ========================================================= */

function calculateMovingAverage(
  candles: ScannerCandle[],
  period: number
): number | null {
  if (candles.length < period) {
    return null;
  }

  const recentCandles = candles.slice(-period);

  const closes = recentCandles
    .map((candle) => candle.close)
    .filter(Number.isFinite);

  if (closes.length < period) {
    return null;
  }

  const result = average(closes);

  return result === null
    ? null
    : round(result);
}

/* =========================================================
   RETURN
   ========================================================= */

function calculateReturn(
  candles: ScannerCandle[],
  tradingDays: number
): number | null {
  if (candles.length <= tradingDays) {
    return null;
  }

  const current = getClose(
    candles,
    candles.length - 1
  );

  const previous = getClose(
    candles,
    candles.length - 1 - tradingDays
  );

  if (
    current === null ||
    previous === null
  ) {
    return null;
  }

  return percentageChange(
    current,
    previous
  );
}

/* =========================================================
   DISTANCE FROM MOVING AVERAGE
   ========================================================= */

function calculateDistanceFromMA(
  currentPrice: number | null,
  movingAverage: number | null
): number | null {
  if (
    currentPrice === null ||
    movingAverage === null ||
    Math.abs(movingAverage) < EPSILON
  ) {
    return null;
  }

  return round(
    ((currentPrice - movingAverage) /
      movingAverage) *
      100
  );
}

/* =========================================================
   VOLUME
   ========================================================= */

function calculateVolumeMetrics(
  candles: ScannerCandle[]
): {
  averageVolume20D: number | null;
  latestVolume: number | null;
  volumeRatio20D: number | null;
} {
  if (candles.length === 0) {
    return {
      averageVolume20D: null,
      latestVolume: null,
      volumeRatio20D: null,
    };
  }

  const latestCandle =
    candles[candles.length - 1];

  const recentCandles = candles.slice(-20);

  const volumes = recentCandles
    .map((candle) => candle.volume)
    .filter(Number.isFinite);

  const averageVolume20D =
    average(volumes);

  const latestVolume =
    Number.isFinite(latestCandle.volume)
      ? latestCandle.volume
      : null;

  let volumeRatio20D: number | null = null;

  if (
    latestVolume !== null &&
    averageVolume20D !== null &&
    averageVolume20D > EPSILON
  ) {
    volumeRatio20D = round(
      latestVolume / averageVolume20D,
      2
    );
  }

  return {
    averageVolume20D:
      averageVolume20D === null
        ? null
        : Math.round(averageVolume20D),

    latestVolume,

    volumeRatio20D,
  };
}

/* =========================================================
   VOLATILITY
   ========================================================= */

/**
 * Calculates standard deviation of daily percentage returns
 * over the latest 20 trading sessions.
 */
function calculateVolatility20D(
  candles: ScannerCandle[]
): number | null {
  if (candles.length < 21) {
    return null;
  }

  const recentCandles =
    candles.slice(-21);

  const dailyReturns: number[] = [];

  for (let index = 1; index < recentCandles.length; index++) {
    const previous =
      recentCandles[index - 1].close;

    const current =
      recentCandles[index].close;

    if (
      !Number.isFinite(previous) ||
      !Number.isFinite(current) ||
      Math.abs(previous) < EPSILON
    ) {
      continue;
    }

    dailyReturns.push(
      ((current - previous) / previous) *
        100
    );
  }

  const volatility =
    standardDeviation(dailyReturns);

  return volatility === null
    ? null
    : round(volatility);
}

/* =========================================================
   52-WEEK POSITION
   ========================================================= */

function calculate52WeekPosition(
  candles: ScannerCandle[]
): {
  position: number | null;
  distanceFromHigh: number | null;
} {
  if (candles.length === 0) {
    return {
      position: null,
      distanceFromHigh: null,
    };
  }

  const recentCandles =
    candles.slice(-TRADING_DAYS_252);

  const closes = recentCandles
    .map((candle) => candle.close)
    .filter(Number.isFinite);

  if (closes.length === 0) {
    return {
      position: null,
      distanceFromHigh: null,
    };
  }

  const currentPrice =
    closes[closes.length - 1];

  const low = Math.min(...closes);
  const high = Math.max(...closes);

  let position: number | null = null;

  if (high - low > EPSILON) {
    position = round(
      ((currentPrice - low) /
        (high - low)) *
        100
    );

    position = Math.max(
      0,
      Math.min(100, position)
    );
  }

  const distanceFromHigh =
    high > EPSILON
      ? round(
          ((currentPrice - high) /
            high) *
            100
        )
      : null;

  return {
    position,
    distanceFromHigh,
  };
}

/* =========================================================
   SIGNAL CALCULATOR
   ========================================================= */

export function calculateScannerSignals(
  candles: ScannerCandle[]
): ScannerSignals {
  if (candles.length === 0) {
    return {
      return1D: null,
      return5D: null,
      return20D: null,
      return50D: null,

      movingAverage20D: null,
      movingAverage50D: null,

      distanceFromMA20: null,
      distanceFromMA50: null,

      averageVolume20D: null,
      latestVolume: null,
      volumeRatio20D: null,

      volatility20D: null,

      fiftyTwoWeekPosition: null,
      distanceFrom52WeekHigh: null,
    };
  }

  const latestPrice =
    getClose(
      candles,
      candles.length - 1
    );

  const movingAverage20D =
    calculateMovingAverage(
      candles,
      TRADING_DAYS_20
    );

  const movingAverage50D =
    calculateMovingAverage(
      candles,
      TRADING_DAYS_50
    );

  const volumeMetrics =
    calculateVolumeMetrics(candles);

  const weekMetrics =
    calculate52WeekPosition(candles);

  return {
    return1D:
      calculateReturn(candles, 1),

    return5D:
      calculateReturn(
        candles,
        TRADING_DAYS_5
      ),

    return20D:
      calculateReturn(
        candles,
        TRADING_DAYS_20
      ),

    return50D:
      calculateReturn(
        candles,
        TRADING_DAYS_50
      ),

    movingAverage20D,

    movingAverage50D,

    distanceFromMA20:
      calculateDistanceFromMA(
        latestPrice,
        movingAverage20D
      ),

    distanceFromMA50:
      calculateDistanceFromMA(
        latestPrice,
        movingAverage50D
      ),

    averageVolume20D:
      volumeMetrics.averageVolume20D,

    latestVolume:
      volumeMetrics.latestVolume,

    volumeRatio20D:
      volumeMetrics.volumeRatio20D,

    volatility20D:
      calculateVolatility20D(candles),

    fiftyTwoWeekPosition:
      weekMetrics.position,

    distanceFrom52WeekHigh:
      weekMetrics.distanceFromHigh,
  };
}

/* =========================================================
   RELATIVE SECTOR PERFORMANCE
   ========================================================= */

export function calculateRelativeSectorPerformance(
  stockReturn20D: number | null,
  sectorAverageReturn20D: number | null
): RelativeSectorPerformance {
  let relativePerformance20D: number | null =
    null;

  if (
    stockReturn20D !== null &&
    sectorAverageReturn20D !== null
  ) {
    relativePerformance20D = round(
      stockReturn20D -
        sectorAverageReturn20D
    );
  }

  return {
    stockReturn20D,
    sectorAverageReturn20D,
    relativePerformance20D,
  };
}

/* =========================================================
   SCANNER SCORE
   ========================================================= */

/**
 * Produces a ranking score from quantitative signals.
 *
 * This score is ONLY used to rank stocks for investigation.
 * It is not a BUY / SELL / HOLD signal.
 */
export function calculateScannerScore(
  signals: ScannerSignals,
  relativePerformance: RelativeSectorPerformance
): number {
  let score = 0;

  /* -------------------------
     Momentum
     ------------------------- */

  if (
    signals.return5D !== null
  ) {
    if (signals.return5D >= 5) {
      score += 15;
    } else if (signals.return5D >= 3) {
      score += 10;
    } else if (signals.return5D >= 1) {
      score += 5;
    } else if (signals.return5D <= -5) {
      score += 12;
    } else if (signals.return5D <= -3) {
      score += 8;
    }
  }

  if (
    signals.return20D !== null
  ) {
    if (signals.return20D >= 10) {
      score += 20;
    } else if (signals.return20D >= 5) {
      score += 12;
    } else if (signals.return20D >= 2) {
      score += 6;
    } else if (signals.return20D <= -10) {
      score += 16;
    } else if (signals.return20D <= -5) {
      score += 10;
    }
  }

  /* -------------------------
     Volume anomaly
     ------------------------- */

  if (
    signals.volumeRatio20D !== null
  ) {
    if (
      signals.volumeRatio20D >= 3
    ) {
      score += 20;
    } else if (
      signals.volumeRatio20D >= 2
    ) {
      score += 14;
    } else if (
      signals.volumeRatio20D >= 1.5
    ) {
      score += 8;
    }
  }

  /* -------------------------
     Trend
     ------------------------- */

  if (
    signals.distanceFromMA20 !== null
  ) {
    if (
      Math.abs(
        signals.distanceFromMA20
      ) >= 8
    ) {
      score += 8;
    } else if (
      Math.abs(
        signals.distanceFromMA20
      ) >= 4
    ) {
      score += 4;
    }
  }

  if (
    signals.distanceFromMA50 !== null
  ) {
    if (
      Math.abs(
        signals.distanceFromMA50
      ) >= 10
    ) {
      score += 8;
    } else if (
      Math.abs(
        signals.distanceFromMA50
      ) >= 5
    ) {
      score += 4;
    }
  }

  /* -------------------------
     Relative performance
     ------------------------- */

  if (
    relativePerformance.relativePerformance20D !==
    null
  ) {
    const relative =
      Math.abs(
        relativePerformance.relativePerformance20D
      );

    if (relative >= 10) {
      score += 20;
    } else if (relative >= 5) {
      score += 12;
    } else if (relative >= 2) {
      score += 6;
    }
  }

  /* -------------------------
     Volatility anomaly
     ------------------------- */

  if (
    signals.volatility20D !== null
  ) {
    if (
      signals.volatility20D >= 5
    ) {
      score += 12;
    } else if (
      signals.volatility20D >= 3
    ) {
      score += 7;
    }
  }

  return Math.min(
    100,
    Math.max(0, score)
  );
}

/* =========================================================
   OBSERVATIONS
   ========================================================= */

export function buildScannerObservations(
  signals: ScannerSignals,
  relativePerformance: RelativeSectorPerformance
): string[] {
  const observations: string[] = [];

  if (
    signals.return5D !== null &&
    Math.abs(signals.return5D) >= 5
  ) {
    observations.push(
      `Unusual 5D price movement of ${signals.return5D}%.`
    );
  }

  if (
    signals.return20D !== null &&
    Math.abs(signals.return20D) >= 10
  ) {
    observations.push(
      `Strong 20D price movement of ${signals.return20D}%.`
    );
  }

  if (
    signals.volumeRatio20D !== null &&
    signals.volumeRatio20D >= 2
  ) {
    observations.push(
      `Latest volume is ${signals.volumeRatio20D}x the 20D average.`
    );
  }

  if (
    relativePerformance.relativePerformance20D !==
      null &&
    Math.abs(
      relativePerformance.relativePerformance20D
    ) >= 5
  ) {
    observations.push(
      `20D performance differs from the sector average by ${relativePerformance.relativePerformance20D} percentage points.`
    );
  }

  if (
    signals.distanceFromMA20 !== null &&
    Math.abs(
      signals.distanceFromMA20
    ) >= 8
  ) {
    observations.push(
      `Price is ${Math.abs(signals.distanceFromMA20)}% ${signals.distanceFromMA20 >= 0 ? "above" : "below"} the 20D moving average.`
    );
  }

  if (
    signals.distanceFromMA50 !== null &&
    Math.abs(
      signals.distanceFromMA50
    ) >= 10
  ) {
    observations.push(
      `Price is ${Math.abs(signals.distanceFromMA50)}% ${signals.distanceFromMA50 >= 0 ? "above" : "below"} the 50D moving average.`
    );
  }

  if (
    signals.distanceFrom52WeekHigh !== null &&
    signals.distanceFrom52WeekHigh >= -5
  ) {
    observations.push(
      "Price is close to its highest closing level in the available 1-year data."
    );
  }

  if (
    signals.volatility20D !== null &&
    signals.volatility20D >= 3
  ) {
    observations.push(
      `Elevated 20D daily volatility of ${signals.volatility20D}%.`
    );
  }

  return observations;
}

/* =========================================================
   COMPLETE STOCK RESULT
   ========================================================= */

export function buildScannerStockResult(
  ticker: string,
  candles: ScannerCandle[],
  sectorAverageReturn20D: number | null
): ScannerStockResult {
  const signals =
    calculateScannerSignals(candles);

  const relativePerformance =
    calculateRelativeSectorPerformance(
      signals.return20D,
      sectorAverageReturn20D
    );

  const scannerScore =
    calculateScannerScore(
      signals,
      relativePerformance
    );

  const observations =
    buildScannerObservations(
      signals,
      relativePerformance
    );

  return {
    ticker,
    signals,
    relativePerformance,
    scannerScore,
    observations,
  };
}