export interface TechnicalSignal {
  signal:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL";

  score: number;

  reasons: string[];

  rsi: number | null;

  macd: number | null;

  macdSignal: number | null;

  macdHistogram: number | null;
}

interface PriceData {
  close: number;
}

/* =========================================================
   EMA
========================================================= */

function calculateEMA(
  values: number[],
  period: number
): number | null {
  if (
    values.length < period ||
    period <= 0
  ) {
    return null;
  }

  let sum = 0;

  for (
    let i = 0;
    i < period;
    i++
  ) {
    sum += values[i];
  }

  let ema =
    sum / period;

  const multiplier =
    2 / (period + 1);

  for (
    let i = period;
    i < values.length;
    i++
  ) {
    ema =
      (values[i] - ema) *
        multiplier +
      ema;
  }

  return Number.isFinite(ema)
    ? ema
    : null;
}

/* =========================================================
   RSI
========================================================= */

function calculateRSI(
  values: number[],
  period: number = 14
): number | null {
  if (
    values.length <= period ||
    period <= 0
  ) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  for (
    let i = 1;
    i <= period;
    i++
  ) {
    const change =
      values[i] -
      values[i - 1];

    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(
        change
      );
    }
  }

  let averageGain =
    gains / period;

  let averageLoss =
    losses / period;

  for (
    let i = period + 1;
    i < values.length;
    i++
  ) {
    const change =
      values[i] -
      values[i - 1];

    const gain =
      change > 0
        ? change
        : 0;

    const loss =
      change < 0
        ? Math.abs(change)
        : 0;

    averageGain =
      (averageGain *
        (period - 1) +
        gain) /
      period;

    averageLoss =
      (averageLoss *
        (period - 1) +
        loss) /
      period;
  }

  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength =
    averageGain /
    averageLoss;

  const rsi =
    100 -
    100 /
      (1 + relativeStrength);

  return Number.isFinite(rsi)
    ? rsi
    : null;
}

/* =========================================================
   MACD
========================================================= */

function calculateMACD(
  values: number[]
): {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
} {
  if (values.length < 35) {
    return {
      macd: null,
      signal: null,
      histogram: null,
    };
  }

  const multiplier12 =
    2 / 13;

  const multiplier26 =
    2 / 27;

  /* =======================================================
     INITIAL EMA 12
  ======================================================= */

  let ema12 = 0;

  for (
    let i = 0;
    i < 12;
    i++
  ) {
    ema12 += values[i];
  }

  ema12 /= 12;

  /* =======================================================
     INITIAL EMA 26
  ======================================================= */

  let ema26 = 0;

  for (
    let i = 0;
    i < 26;
    i++
  ) {
    ema26 += values[i];
  }

  ema26 /= 26;

  /* =======================================================
     MACD VALUES
  ======================================================= */

  const macdValues: number[] = [];

  /*
   * Start from index 26.
   *
   * Both EMA calculations are now
   * available.
   */

  for (
    let i = 26;
    i < values.length;
    i++
  ) {
    ema12 =
      (values[i] - ema12) *
        multiplier12 +
      ema12;

    ema26 =
      (values[i] - ema26) *
        multiplier26 +
      ema26;

    const macd =
      ema12 - ema26;

    if (
      Number.isFinite(macd)
    ) {
      macdValues.push(macd);
    }
  }

  if (
    macdValues.length < 9
  ) {
    return {
      macd: null,
      signal: null,
      histogram: null,
    };
  }

  /* =======================================================
     SIGNAL LINE
  ======================================================= */

  let signal = 0;

  for (
    let i = 0;
    i < 9;
    i++
  ) {
    signal +=
      macdValues[i];
  }

  signal /= 9;

  const signalMultiplier =
    2 / 10;

  for (
    let i = 9;
    i < macdValues.length;
    i++
  ) {
    signal =
      (macdValues[i] -
        signal) *
        signalMultiplier +
      signal;
  }

  const macd =
    macdValues[
      macdValues.length - 1
    ];

  const histogram =
    macd - signal;

  return {
    macd: Number.isFinite(macd)
      ? macd
      : null,

    signal: Number.isFinite(
      signal
    )
      ? signal
      : null,

    histogram:
      Number.isFinite(
        histogram
      )
        ? histogram
        : null,
  };
}

/* =========================================================
   TECHNICAL ANALYSIS
========================================================= */

export function calculateTechnicalSignal(
  data: PriceData[]
): TechnicalSignal {
  if (
    !Array.isArray(data) ||
    data.length < 50
  ) {
    return {
      signal: "NEUTRAL",
      score: 0,
      reasons: [
        "Not enough historical data",
      ],
      rsi: null,
      macd: null,
      macdSignal: null,
      macdHistogram: null,
    };
  }

  /* =======================================================
     CLEAN CLOSE VALUES
  ======================================================= */

  const closes =
    data
      .map((item) =>
        Number(item.close)
      )
      .filter((value) =>
        Number.isFinite(value)
      );

  if (
    closes.length < 50
  ) {
    return {
      signal: "NEUTRAL",
      score: 0,
      reasons: [
        "Not enough valid historical price data",
      ],
      rsi: null,
      macd: null,
      macdSignal: null,
      macdHistogram: null,
    };
  }

  const currentPrice =
    closes[
      closes.length - 1
    ];

  /* =======================================================
     EMA
  ======================================================= */

  const ema20 =
    calculateEMA(
      closes,
      20
    );

  const ema50 =
    calculateEMA(
      closes,
      50
    );

  /* =======================================================
     RSI
  ======================================================= */

  const rsi =
    calculateRSI(
      closes,
      14
    );

  /* =======================================================
     MACD
  ======================================================= */

  const macdData =
    calculateMACD(
      closes
    );

  const macd =
    macdData.macd;

  const macdSignal =
    macdData.signal;

  const macdHistogram =
    macdData.histogram;

  /* =======================================================
     SCORE
  ======================================================= */

  let score = 0;

  const reasons: string[] =
    [];

  /* =======================================================
     EMA 20 VS EMA 50
  ======================================================= */

  if (
    ema20 !== null &&
    ema50 !== null
  ) {
    if (ema20 > ema50) {
      score += 1;

      reasons.push(
        "EMA 20 is above EMA 50"
      );
    } else {
      score -= 1;

      reasons.push(
        "EMA 20 is below EMA 50"
      );
    }
  }

  /* =======================================================
     PRICE VS EMA 20
  ======================================================= */

  if (
    ema20 !== null
  ) {
    if (
      currentPrice >
      ema20
    ) {
      score += 1;

      reasons.push(
        "Price is above EMA 20"
      );
    } else {
      score -= 1;

      reasons.push(
        "Price is below EMA 20"
      );
    }
  }

  /* =======================================================
     PRICE VS EMA 50
  ======================================================= */

  if (
    ema50 !== null
  ) {
    if (
      currentPrice >
      ema50
    ) {
      score += 1;

      reasons.push(
        "Price is above EMA 50"
      );
    } else {
      score -= 1;

      reasons.push(
        "Price is below EMA 50"
      );
    }
  }

  /* =======================================================
     RSI
  ======================================================= */

  if (
    rsi !== null
  ) {
    if (rsi < 30) {
      score += 1;

      reasons.push(
        `RSI is ${rsi.toFixed(
          2
        )} — potentially oversold`
      );
    } else if (
      rsi > 70
    ) {
      score -= 1;

      reasons.push(
        `RSI is ${rsi.toFixed(
          2
        )} — potentially overbought`
      );
    } else {
      reasons.push(
        `RSI is ${rsi.toFixed(
          2
        )} — neutral zone`
      );
    }
  }

  /* =======================================================
     MACD
  ======================================================= */

  if (
    macd !== null &&
    macdSignal !== null
  ) {
    if (
      macd >
      macdSignal
    ) {
      score += 1;

      reasons.push(
        "MACD is above its signal"
      );
    } else if (
      macd <
      macdSignal
    ) {
      score -= 1;

      reasons.push(
        "MACD is below its signal"
      );
    }
  }

  /* =======================================================
     MACD HISTOGRAM
  ======================================================= */

  if (
    macdHistogram !== null
  ) {
    if (
      macdHistogram > 0
    ) {
      reasons.push(
        "MACD histogram is positive"
      );
    } else if (
      macdHistogram < 0
    ) {
      reasons.push(
        "MACD histogram is negative"
      );
    }
  }

  /* =======================================================
     FINAL SIGNAL
  ======================================================= */

  let signal:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL";

  if (score >= 3) {
    signal = "BULLISH";
  } else if (
    score <= -3
  ) {
    signal = "BEARISH";
  } else {
    signal = "NEUTRAL";
  }

  return {
    signal,
    score,
    reasons,
    rsi,
    macd,
    macdSignal,
    macdHistogram,
  };
}