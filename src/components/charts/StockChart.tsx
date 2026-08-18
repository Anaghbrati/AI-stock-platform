"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

import type {
  HistoricalChartData,
} from "../../types/market-data";

interface StockChartProps {
  data:  HistoricalChartData[];
}

const CHART_HEIGHT = 500;

export default function StockChart({
  data,
}: StockChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const chartRef =
    useRef<IChartApi | null>(null);

  const seriesRef =
    useRef<
      ISeriesApi<"Candlestick"> | null
    >(null);

  // =====================================================
  // CREATE CHART ONCE
  // =====================================================

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container =
      containerRef.current;

    const chart = createChart(
      container,
      {
        layout: {
          background: {
            type: ColorType.Solid,
            color: "#0f172a",
          },

          textColor: "#94a3b8",
        },

        grid: {
          vertLines: {
            color: "#1e293b",
          },

          horzLines: {
            color: "#1e293b",
          },
        },

        width:
          container.clientWidth,

        height: CHART_HEIGHT,

        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },

        rightPriceScale: {
          borderVisible: false,
        },

        leftPriceScale: {
          borderVisible: false,
        },

        crosshair: {
          vertLine: {
            labelVisible: true,
          },

          horzLine: {
            labelVisible: true,
          },
        },
      }
    );

    const candlestickSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#22c55e",

          downColor: "#ef4444",

          borderVisible: false,

          wickUpColor: "#22c55e",

          wickDownColor: "#ef4444",
        }
      );

    chartRef.current =
      chart;

    seriesRef.current =
      candlestickSeries;

    // ===================================================
    // RESPONSIVE RESIZE
    // ===================================================

    let resizeFrame: number | null =
      null;

    const handleResize = () => {
      if (
        resizeFrame !== null
      ) {
        cancelAnimationFrame(
          resizeFrame
        );
      }

      resizeFrame =
        requestAnimationFrame(() => {
          if (
            !containerRef.current
          ) {
            return;
          }

          chart.applyOptions({
            width:
              containerRef.current
                .clientWidth,
          });

          resizeFrame = null;
        });
    };

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      if (
        resizeFrame !== null
      ) {
        cancelAnimationFrame(
          resizeFrame
        );
      }

      chart.remove();

      chartRef.current = null;

      seriesRef.current = null;
    };
  }, []);

  // =====================================================
  // UPDATE DATA ONLY
  // =====================================================

  useEffect(() => {
    if (
      !seriesRef.current ||
      data.length === 0
    ) {
      return;
    }

    const chartData =
      data
        .map((item) => ({
          time:
            item.time as any,

          open:
            item.open,

          high:
            item.high,

          low:
            item.low,

          close:
            item.close,
        }))
        .filter(
          (item) =>
            Number.isFinite(
              item.open
            ) &&
            Number.isFinite(
              item.high
            ) &&
            Number.isFinite(
              item.low
            ) &&
            Number.isFinite(
              item.close
            )
        );

    if (
      chartData.length === 0
    ) {
      return;
    }

    seriesRef.current.setData(
      chartData
    );

    chartRef.current
      ?.timeScale()
      .fitContent();
  }, [data]);

  // =====================================================
  // RESERVED CHART SPACE
  // =====================================================

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        height: CHART_HEIGHT,
        minHeight: CHART_HEIGHT,
      }}
    />
  );
}