"use client";

import { useEffect, useState } from "react";
import StockChart from "./StockChart";


export interface HistoricalData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}


interface StockChartContainerProps {
  ticker: string;
}


interface Range {
  label: string;
  period: string;
  interval: string;
}


const ranges: Range[] = [
  {
    label: "1D",
    period: "1d",
    interval: "5m",
  },
  {
    label: "1W",
    period: "5d",
    interval: "15m",
  },
  {
    label: "1M",
    period: "1mo",
    interval: "1d",
  },
  {
    label: "6M",
    period: "6mo",
    interval: "1d",
  },
  {
    label: "1Y",
    period: "1y",
    interval: "1d",
  },
  {
    label: "5Y",
    period: "5y",
    interval: "1wk",
  },
];


export default function StockChartContainer({
  ticker,
}: StockChartContainerProps) {

  const [data, setData] =
    useState<HistoricalData[]>([]);

  const [selectedRange, setSelectedRange] =
    useState("1Y");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function fetchData(
    range: Range
  ) {

    try {

      setLoading(true);
      setError("");
      setData([]);

      const cleanTicker = decodeURIComponent(
  ticker
);

        const response = await fetch(
          `/api/stock/${encodeURIComponent(
            cleanTicker
          )}/historical?period=${encodeURIComponent(
            range.period
          )}&interval=${encodeURIComponent(
            range.interval
          )}`,
          {
            cache: "no-store",
          }
        );


      const result =
        await response.json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          result?.error ||
            result?.detail ||
            `Historical request failed (${response.status})`
        );
      }


      if (!Array.isArray(result)) {

        throw new Error(
          "Invalid historical data received."
        );
      }


      const normalizedData:
        HistoricalData[] =
        result
          .map(
            (item: any) => {

              const time =
                Number(item?.time);

              const open =
                Number(item?.open);

              const high =
                Number(item?.high);

              const low =
                Number(item?.low);

              const close =
                Number(item?.close);

              const volume =
                Number(item?.volume ?? 0);


              if (
                !Number.isFinite(time) ||
                !Number.isFinite(open) ||
                !Number.isFinite(high) ||
                !Number.isFinite(low) ||
                !Number.isFinite(close)
              ) {
                return null;
              }


              return {
                time,
                open,
                high,
                low,
                close,
                volume:
                  Number.isFinite(
                    volume
                  )
                    ? volume
                    : 0,
              };
            }
          )
          .filter(
            (
              item
            ): item is HistoricalData =>
              item !== null
          );


      normalizedData.sort(
        (a, b) =>
          a.time - b.time
      );


      if (
        normalizedData.length === 0
      ) {

        throw new Error(
          `No historical data available for ${ticker}.`
        );
      }


      setData(
        normalizedData
      );

    } catch (error) {

      console.error(
        "Historical data error:",
        error
      );

      setData([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load chart data."
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    if (!ticker?.trim()) {

      setError(
        "Invalid ticker."
      );

      return;
    }


    const range =
      ranges.find(
        (item) =>
          item.label ===
          selectedRange
      );


    if (range) {
      fetchData(range);
    }

  }, [
    ticker,
    selectedRange,
  ]);


  function handleRetry() {

    const range =
      ranges.find(
        (item) =>
          item.label ===
          selectedRange
      );


    if (range) {
      fetchData(range);
    }
  }


  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-2xl font-semibold text-white">
            Price Chart
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Historical market data for{" "}
            <span className="font-medium text-slate-300">
              {ticker}
            </span>
          </p>

        </div>


        {/* RANGE BUTTONS */}

        <div className="flex flex-wrap gap-2">

          {ranges.map(
            (range) => (

              <button
                key={
                  range.label
                }
                type="button"
                onClick={() =>
                  setSelectedRange(
                    range.label
                  )
                }
                disabled={
                  loading &&
                  selectedRange ===
                    range.label
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedRange ===
                  range.label
                    ? "bg-white text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {range.label}
              </button>

            )
          )}

        </div>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="h-[500px] animate-pulse">
          {/* Chart skeleton */}
          <div className="relative h-full overflow-hidden rounded-lg bg-slate-800/50">

            {/* Fake chart lines */}
            <div className="absolute inset-x-0 top-16 border-t border-slate-700/60" />
            <div className="absolute inset-x-0 top-32 border-t border-slate-700/60" />
            <div className="absolute inset-x-0 top-48 border-t border-slate-700/60" />
            <div className="absolute inset-x-0 top-64 border-t border-slate-700/60" />
            <div className="absolute inset-x-0 top-80 border-t border-slate-700/60" />

            {/* Fake price line */}
            <div className="absolute left-[5%] top-[65%] h-1 w-[12%] rounded bg-slate-600" />
            <div className="absolute left-[17%] top-[58%] h-1 w-[12%] rotate-[-8deg] rounded bg-slate-600" />
            <div className="absolute left-[29%] top-[50%] h-1 w-[12%] rotate-[5deg] rounded bg-slate-600" />
            <div className="absolute left-[41%] top-[55%] h-1 w-[12%] rotate-[-12deg] rounded bg-slate-600" />
            <div className="absolute left-[53%] top-[40%] h-1 w-[12%] rotate-[8deg] rounded bg-slate-600" />
            <div className="absolute left-[65%] top-[45%] h-1 w-[12%] rotate-[-5deg] rounded bg-slate-600" />
            <div className="absolute left-[77%] top-[30%] h-1 w-[12%] rotate-[10deg] rounded bg-slate-600" />

            {/* Loading text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg bg-slate-900/80 px-5 py-3">
                <p className="text-sm text-slate-400">
                  Loading {selectedRange} chart...
                </p>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ERROR */}

      {!loading && error && (

        <div className="flex h-[500px] flex-col items-center justify-center text-center">

          <p className="mb-4 text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={
              handleRetry
            }
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200"
          >
            Try Again
          </button>

        </div>

      )}


      {/* CHART */}

      {!loading &&
        !error &&
        data.length > 0 && (

          <StockChart
            data={data}
          />

        )}


      {/* EMPTY */}

      {!loading &&
        !error &&
        data.length === 0 && (

          <div className="flex h-[500px] items-center justify-center text-slate-400">
            No historical data available.
          </div>

        )}

    </div>
  );
}