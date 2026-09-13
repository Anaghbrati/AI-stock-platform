import { createAdminClient } from "../supabase/admin";
import { getMarketDataProvider } from "../providers/market-data";
import { calculateRSI } from "./technical-analysis";
import { INDIAN_STOCK_UNIVERSE } from "../market/indian-stock-universe";

const SIGNAL_TYPE = "RSI_RECOVERY";
const RSI_PERIOD = 14;
const RSI_THRESHOLD = 30;
const HORIZONS = [5, 10, 20] as const;

type Horizon = (typeof HORIZONS)[number];

type SignalEvent = {
  symbol: string;
  detectedAt: string;
  price: number;
};

type HistoricalRow = {
  time: number;
  close: number;
};

function toIndianDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function getTrackingStartDate(): string {
  const configured = process.env.SIGNAL_TRACKING_START_DATE?.trim();

  if (configured) {
    return configured;
  }

  return toIndianDate(Date.now() / 1000);
}

function findRecoverySignals(
  symbol: string,
  rows: HistoricalRow[],
  startDate: string
): SignalEvent[] {
  if (rows.length <= RSI_PERIOD + 1) {
    return [];
  }

  const closes = rows.map((row) => row.close);
  const signals: SignalEvent[] = [];

  for (let index = RSI_PERIOD + 1; index < rows.length; index++) {
    const previousRsi = calculateRSI(
      closes.slice(0, index),
      RSI_PERIOD
    );

    const currentRsi = calculateRSI(
      closes.slice(0, index + 1),
      RSI_PERIOD
    );

    if (previousRsi === null || currentRsi === null) {
      continue;
    }

    const detectedAt = toIndianDate(rows[index].time);

    if (detectedAt < startDate) {
      continue;
    }

    if (
      previousRsi < RSI_THRESHOLD &&
      currentRsi >= RSI_THRESHOLD
    ) {
      signals.push({
        symbol,
        detectedAt,
        price: rows[index].close,
      });
    }
  }

  return signals;
}

async function recordSignals(
  supabase: ReturnType<typeof createAdminClient>,
  signals: SignalEvent[]
) {
  if (signals.length === 0) {
    return 0;
  }

  const { error } = await supabase
    .from("signal_log")
    .upsert(
      signals.map((signal) => ({
        symbol: signal.symbol,
        signal_type: SIGNAL_TYPE,
        detected_at: signal.detectedAt,
        price_at_detection: signal.price,
      })),
      {
        onConflict: "symbol,signal_type,detected_at",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to record signals: ${error.message}`
    );
  }

  return signals.length;
}

async function recordOutcomes(
  supabase: ReturnType<typeof createAdminClient>,
  dataBySymbol: Map<string, HistoricalRow[]>
) {
  const { data: signals, error } = await supabase
    .from("signal_log")
    .select(
      "id,symbol,detected_at,price_at_detection"
    )
    .eq("signal_type", SIGNAL_TYPE);

  if (error) {
    throw new Error(
      `Failed to load signal log: ${error.message}`
    );
  }

  if (!signals || signals.length === 0) {
    return 0;
  }

  let recorded = 0;

  for (const signal of signals) {
    const rows = dataBySymbol.get(signal.symbol);

    if (!rows) {
      continue;
    }

    const signalIndex = rows.findIndex(
      (row) =>
        toIndianDate(row.time) === signal.detected_at
    );

    if (signalIndex === -1) {
      continue;
    }

    for (const horizon of HORIZONS) {
      const horizonIndex = signalIndex + horizon;

      if (horizonIndex >= rows.length) {
        continue;
      }

      const { data: existing } = await supabase
        .from("signal_outcomes")
        .select("id")
        .eq("signal_log_id", signal.id)
        .eq("horizon_days", horizon)
        .maybeSingle();

      if (existing) {
        continue;
      }

      const priceAtHorizon = rows[horizonIndex].close;

      if (
        !Number.isFinite(priceAtHorizon) ||
        priceAtHorizon <= 0
      ) {
        continue;
      }

      const pctChange =
        ((priceAtHorizon - signal.price_at_detection) /
          signal.price_at_detection) *
        100;

      const { error: insertError } = await supabase
        .from("signal_outcomes")
        .insert({
          signal_log_id: signal.id,
          horizon_days: horizon,
          price_at_horizon: priceAtHorizon,
          pct_change: pctChange,
          followed_through: pctChange > 0,
        });

      if (insertError && insertError.code !== "23505") {
        throw new Error(
          `Failed to record outcome: ${insertError.message}`
        );
      }

      if (!insertError) {
        recorded++;
      }
    }
  }

  return recorded;
}

export async function trackRsiRecoverySignals() {
  const supabase = createAdminClient();
  const provider = getMarketDataProvider();

  const startDate = getTrackingStartDate();

  const dataBySymbol = new Map<
    string,
    HistoricalRow[]
  >();

  const allSignals: SignalEvent[] = [];

  for (const symbol of INDIAN_STOCK_UNIVERSE) {
    try {
      const historical =
        await provider.getHistoricalData(
          symbol,
          "1y",
          "1d"
        );

      const rows = historical
        .filter(
          (row) =>
            Number.isFinite(row.close) &&
            row.close > 0
        )
        .map((row) => ({
          time: row.time,
          close: row.close,
        }))
        .sort((a, b) => a.time - b.time);

      dataBySymbol.set(symbol, rows);

      const signals = findRecoverySignals(
        symbol,
        rows,
        startDate
      );

      allSignals.push(...signals);
    } catch (error) {
      console.error(
        `[signal-tracker] Failed for ${symbol}:`,
        error
      );
    }
  }

  const detected = await recordSignals(
    supabase,
    allSignals
  );

  const outcomes = await recordOutcomes(
    supabase,
    dataBySymbol
  );

  return {
    signalType: SIGNAL_TYPE,
    trackingStartDate: startDate,
    detectedSignals: detected,
    recordedOutcomes: outcomes,
    processedStocks: dataBySymbol.size,
  };
}