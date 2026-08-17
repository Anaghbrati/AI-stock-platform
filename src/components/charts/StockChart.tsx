"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  createChart,
  ColorType,
  CandlestickSeries,
} from "lightweight-charts";

import type {
  HistoricalData,
} from "./StockChartContainer";


interface StockChartProps {
  data: HistoricalData[];
}


export default function StockChart({
  data,
}: StockChartProps) {

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );


  useEffect(() => {

    if (
      !containerRef.current ||
      data.length === 0
    ) {
      return;
    }


    const chart =
      createChart(
        containerRef.current,
        {
          layout: {
            background: {
              type:
                ColorType.Solid,
              color:
                "#0f172a",
            },
            textColor:
              "#94a3b8",
          },

          grid: {
            vertLines: {
              color:
                "#1e293b",
            },

            horzLines: {
              color:
                "#1e293b",
            },
          },

          width:
            containerRef.current
              .clientWidth,

          height: 500,

          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        }
      );


    const candlestickSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor:
            "#22c55e",

          downColor:
            "#ef4444",

          borderVisible:
            false,

          wickUpColor:
            "#22c55e",

          wickDownColor:
            "#ef4444",
        }
      );


    candlestickSeries.setData(
      data.map((item) => ({
        time: item.time as any,

        open: item.open,

        high: item.high,

        low: item.low,

        close: item.close,
      }))
    );


    chart.timeScale()
      .fitContent();


    const handleResize =
      () => {

        if (
          containerRef.current
        ) {

          chart.applyOptions({
            width:
              containerRef.current
                .clientWidth,
          });
        }
      };


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

      chart.remove();
    };

  }, [data]);


  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        height: 500,
      }}
    />
  );
}