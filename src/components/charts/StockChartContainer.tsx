"use client";

import { useEffect, useState } from "react";
import StockChart from "./StockChart";

interface HistoricalData {
  time: string;
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

const ranges = [
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
  const [data, setData] = useState<HistoricalData[]>([]);

  const [selectedRange, setSelectedRange] = useState("1Y");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchData = async (
    period: string,
    interval: string
  ) => {
    try {
      setLoading(true);
      setError("");

      const baseUrl =
        process.env.NEXT_PUBLIC_MARKET_DATA_API_URL ||
        "http://localhost:8000";

      const response = await fetch(
        `${baseUrl}/api/historical/${ticker}?period=${period}&interval=${interval}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch historical data: ${response.status}`
        );
      }

      const result: HistoricalData[] = await response.json();

      setData(result);
    } catch (err) {
      console.error("Historical data error:", err);

      setError("Unable to load chart data");

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const range = ranges.find(
      (item) => item.label === selectedRange
    );

    if (!range) {
      return;
    }

    fetchData(
      range.period,
      range.interval
    );
  }, [ticker, selectedRange]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        {/* Title */}

        <div>
          <h2 className="text-2xl font-semibold text-white">
            Price Chart
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Historical market data
          </p>
        </div>

        {/* Time Range Buttons */}

        <div className="flex flex-wrap gap-2">

          {ranges.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() =>
                setSelectedRange(range.label)
              }
              disabled={
                loading &&
                selectedRange === range.label
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRange === range.label
                  ? "bg-white text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              } ${
                loading &&
                selectedRange === range.label
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {range.label}
            </button>
          ))}

        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="h-[500px] flex flex-col items-center justify-center text-slate-400">

          <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mb-4" />

          <p>
            Loading {selectedRange} chart...
          </p>

        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="h-[500px] flex flex-col items-center justify-center">

          <p className="text-red-400 mb-4">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              const range = ranges.find(
                (item) =>
                  item.label === selectedRange
              );

              if (range) {
                fetchData(
                  range.period,
                  range.interval
                );
              }
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
          >
            Try Again
          </button>

        </div>
      )}

      {/* Chart */}

      {!loading &&
        !error &&
        data.length > 0 && (
          <StockChart data={data} />
        )}

      {/* No Data */}

      {!loading &&
        !error &&
        data.length === 0 && (
          <div className="h-[500px] flex items-center justify-center text-slate-400">
            No historical data available
          </div>
        )}

    </div>
  );
}