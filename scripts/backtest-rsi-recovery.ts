
import fs from "node:fs/promises";
import path from "node:path";

import { calculateRSI } from "../src/lib/services/technical-analysis";
import { getMarketDataProvider } from "../src/lib/providers/market-data";
import { INDIAN_STOCK_UNIVERSE } from "../src/lib/market/indian-stock-universe";

const RSI_PERIOD = 14;
const RSI_THRESHOLD = 30;

const HORIZONS = [5, 10, 20] as const;

type Horizon = (typeof HORIZONS)[number];

interface BacktestSignal {
  symbol: string;
  signalDate: string;
  signalPrice: number;
  returns: Partial<Record<Horizon, number>>;
}

interface HorizonResult {
  horizonDays: Horizon;
  instanceCount: number;
  followThroughCount: number;
  pctFollowedThrough: number | null;
  averageReturn: number | null;
}

interface StockBacktestResult {
  symbol: string;
  signalCount: number;
  signals: BacktestSignal[];
  error?: string;
}

interface BacktestOutput {
  signalType: "RSI_RECOVERY";
  rsiPeriod: number;
  threshold: number;
  universe: string[];
  generatedAt: string;
  totalSignals: number;
  results: HorizonResult[];
  stocks: StockBacktestResult[];
}

function calculateHistoricalRSI(
  closes: number[],
  index: number
): number | null {
  if (index <= 0) {
    return null;
  }

  return calculateRSI(
    closes.slice(0, index + 1),
    RSI_PERIOD
  );
}

function calculateReturn(
  signalPrice: number,
  futurePrice: number
): number {
  return ((futurePrice - signalPrice) / signalPrice) * 100;
}

function round(value: number, decimals = 4): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

async function backtestStock(
  symbol: string
): Promise<StockBacktestResult> {
  const provider = getMarketDataProvider();

  try {
    console.log(`\nProcessing ${symbol}...`);

    const historicalData = await provider.getHistoricalData(
      symbol,
      "max",
      "1d"
    );

    if (!historicalData || historicalData.length === 0) {
      return {
        symbol,
        signalCount: 0,
        signals: [],
        error: "No historical data returned",
      };
    }

    const data = [...historicalData]
      .filter(
        (row) =>
          Number.isFinite(row.time) &&
          Number.isFinite(row.close) &&
          row.close > 0
      )
      .sort((a, b) => a.time - b.time);

    const closes = data.map((row) => row.close);

    if (closes.length <= RSI_PERIOD) {
      return {
        symbol,
        signalCount: 0,
        signals: [],
        error: `Not enough historical data. Required more than ${RSI_PERIOD} rows.`,
      };
    }

    const signals: BacktestSignal[] = [];

    for (let index = RSI_PERIOD + 1; index < data.length; index++) {
      const previousRsi = calculateHistoricalRSI(
        closes,
        index - 1
      );

      const currentRsi = calculateHistoricalRSI(
        closes,
        index
      );

      if (
        previousRsi === null ||
        currentRsi === null
      ) {
        continue;
      }

      const isRsiRecovery =
        previousRsi < RSI_THRESHOLD &&
        currentRsi >= RSI_THRESHOLD;

      if (!isRsiRecovery) {
        continue;
      }

      const signalPrice = data[index].close;

      const signalDate = new Date(
        data[index].time * 1000
      )
        .toISOString()
        .slice(0, 10);

      const returns: Partial<Record<Horizon, number>> = {};

      for (const horizon of HORIZONS) {
        const futureIndex = index + horizon;

        if (futureIndex >= data.length) {
          continue;
        }

        const futurePrice = data[futureIndex].close;

        returns[horizon] = calculateReturn(
          signalPrice,
          futurePrice
        );
      }

      signals.push({
        symbol,
        signalDate,
        signalPrice,
        returns,
      });
    }

    console.log(
      `${symbol}: ${signals.length} RSI recovery signals`
    );

    return {
      symbol,
      signalCount: signals.length,
      signals,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `${symbol}: failed - ${message}`
    );

    return {
      symbol,
      signalCount: 0,
      signals: [],
      error: message,
    };
  }
}

function aggregateResults(
  stockResults: StockBacktestResult[]
): HorizonResult[] {
  return HORIZONS.map((horizon) => {
    const returns: number[] = [];

    for (const stock of stockResults) {
      for (const signal of stock.signals) {
        const value = signal.returns[horizon];

        if (typeof value === "number" && Number.isFinite(value)) {
          returns.push(value);
        }
      }
    }

    const instanceCount = returns.length;

    if (instanceCount === 0) {
      return {
        horizonDays: horizon,
        instanceCount: 0,
        followThroughCount: 0,
        pctFollowedThrough: null,
        averageReturn: null,
      };
    }

    const followThroughCount = returns.filter(
      (value) => value > 0
    ).length;

    const pctFollowedThrough =
      (followThroughCount / instanceCount) * 100;

    const averageReturn =
      returns.reduce(
        (sum, value) => sum + value,
        0
      ) / instanceCount;

    return {
      horizonDays: horizon,
      instanceCount,
      followThroughCount,
      pctFollowedThrough: round(
        pctFollowedThrough
      ),
      averageReturn: round(averageReturn),
    };
  });
}

async function main(): Promise<void> {
  console.log(
    "=============================================="
  );
  console.log(
    "RSI RECOVERY BACKTEST"
  );
  console.log(
    "=============================================="
  );

  console.log(
    `Universe: ${INDIAN_STOCK_UNIVERSE.length} stocks`
  );

  console.log(
    `RSI period: ${RSI_PERIOD}`
  );

  console.log(
    `Recovery threshold: ${RSI_THRESHOLD}`
  );

  console.log(
    `Horizons: ${HORIZONS.join(", ")} trading days`
  );

  const stockResults: StockBacktestResult[] = [];

  for (const symbol of INDIAN_STOCK_UNIVERSE) {
    const result = await backtestStock(symbol);
    stockResults.push(result);
  }

  const results = aggregateResults(stockResults);

  const totalSignals = stockResults.reduce(
    (sum, stock) => sum + stock.signalCount,
    0
  );

  const output: BacktestOutput = {
    signalType: "RSI_RECOVERY",
    rsiPeriod: RSI_PERIOD,
    threshold: RSI_THRESHOLD,
    universe: INDIAN_STOCK_UNIVERSE,
    generatedAt: new Date().toISOString(),
    totalSignals,
    results,
    stocks: stockResults,
  };

  const outputDirectory = path.join(
    process.cwd(),
    "data",
    "backtest"
  );

  await fs.mkdir(outputDirectory, {
    recursive: true,
  });

  const outputPath = path.join(
    outputDirectory,
    "rsi-recovery-backtest.json"
  );

  await fs.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    "utf-8"
  );

  console.log("\n==============================================");
  console.log("BACKTEST COMPLETE");
  console.log("==============================================");

  console.log(`Total signals: ${totalSignals}`);

  for (const result of results) {
    console.log(
      `\n${result.horizonDays} trading days:`
    );

    console.log(
      `  Instances: ${result.instanceCount}`
    );

    console.log(
      `  Follow-through: ${
        result.pctFollowedThrough === null
          ? "N/A"
          : `${result.pctFollowedThrough}%`
      }`
    );

    console.log(
      `  Average return: ${
        result.averageReturn === null
          ? "N/A"
          : `${result.averageReturn}%`
      }`
    );
  }

  const failedStocks = stockResults.filter(
    (stock) => stock.error
  );

  if (failedStocks.length > 0) {
    console.log(
      `\nFailed stocks: ${failedStocks.length}`
    );

    for (const stock of failedStocks) {
      console.log(
        `  ${stock.symbol}: ${stock.error}`
      );
    }
  }

  console.log(
    `\nSaved to: ${outputPath}`
  );
}

main().catch((error) => {
  console.error(
    "\nBacktest failed:"
  );

  console.error(error);

  process.exit(1);
});

