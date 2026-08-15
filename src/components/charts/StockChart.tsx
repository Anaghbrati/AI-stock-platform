"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";

interface HistoricalData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: HistoricalData[];
}

function calculateSMA(
  data: HistoricalData[],
  period: number
) {
  const result: {
    time: string;
    value: number;
  }[] = [];

  if (data.length < period) {
    return result;
  }

  for (
    let i = period - 1;
    i < data.length;
    i++
  ) {
    let sum = 0;

    for (
      let j = i - period + 1;
      j <= i;
      j++
    ) {
      sum += Number(data[j].close);
    }

    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }

  return result;
}

function calculateEMA(
  data: HistoricalData[],
  period: number
) {
  const result: {
    time: string;
    value: number;
  }[] = [];

  if (data.length < period) {
    return result;
  }

  let sum = 0;

  for (let i = 0; i < period; i++) {
    sum += Number(data[i].close);
  }

  let previousEMA = sum / period;

  result.push({
    time: data[period - 1].time,
    value: previousEMA,
  });

  const multiplier = 2 / (period + 1);

  for (
    let i = period;
    i < data.length;
    i++
  ) {
    const close = Number(data[i].close);

    const currentEMA =
      (close - previousEMA) *
        multiplier +
      previousEMA;

    result.push({
      time: data[i].time,
      value: currentEMA,
    });

    previousEMA = currentEMA;
  }

  return result;
}

function calculateRSI(
  data: HistoricalData[],
  period: number = 14
) {
  const result: {
    time: string;
    value: number;
  }[] = [];

  if (data.length <= period) {
    return result;
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change =
      Number(data[i].close) -
      Number(data[i - 1].close);

    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let averageGain =
    gains / period;

  let averageLoss =
    losses / period;

  let rsi = 0;

  if (averageLoss === 0) {
    rsi = 100;
  } else {
    const relativeStrength =
      averageGain / averageLoss;

    rsi =
      100 -
      100 /
        (1 + relativeStrength);
  }

  result.push({
    time: data[period].time,
    value: rsi,
  });

  for (
    let i = period + 1;
    i < data.length;
    i++
  ) {
    const change =
      Number(data[i].close) -
      Number(data[i - 1].close);

    const gain =
      change > 0 ? change : 0;

    const loss =
      change < 0
        ? Math.abs(change)
        : 0;

    averageGain =
      (averageGain * (period - 1) +
        gain) /
      period;

    averageLoss =
      (averageLoss * (period - 1) +
        loss) /
      period;

    if (averageLoss === 0) {
      rsi = 100;
    } else {
      const relativeStrength =
        averageGain / averageLoss;

      rsi =
        100 -
        100 /
          (1 + relativeStrength);
    }

    result.push({
      time: data[i].time,
      value: rsi,
    });
  }

  return result;
}

/*
 * MACD
 * 12 EMA - 26 EMA
 * Signal = 9 EMA of MACD
 */
function calculateMACD(
  data: HistoricalData[]
) {
  const closes = data.map((item) =>
    Number(item.close)
  );

  if (closes.length < 35) {
    return {
      macdData: [],
      signalData: [],
      histogramData: [],
    };
  }

  /*
   * EMA calculation for number arrays
   */
  function calculateEMAValues(
    values: number[],
    period: number
  ) {
    const result: number[] = [];

    if (values.length < period) {
      return result;
    }

    let sum = 0;

    for (let i = 0; i < period; i++) {
      sum += values[i];
    }

    let previousEMA = sum / period;

    result.push(previousEMA);

    const multiplier =
      2 / (period + 1);

    for (
      let i = period;
      i < values.length;
      i++
    ) {
      const currentEMA =
        (values[i] - previousEMA) *
          multiplier +
        previousEMA;

      result.push(currentEMA);

      previousEMA = currentEMA;
    }

    return result;
  }

  /*
   * EMA 12 and EMA 26
   */
  const ema12 =
    calculateEMAValues(closes, 12);

  const ema26 =
    calculateEMAValues(closes, 26);

  /*
   * Align EMA 12 with EMA 26.
   *
   * EMA 26 starts at index 25.
   */
  const macdValues: {
    time: string;
    value: number;
  }[] = [];

  for (
    let i = 25;
    i < data.length;
    i++
  ) {
    const ema12Index = i - 11;
    const ema26Index = i - 25;

    if (
      ema12[ema12Index] === undefined ||
      ema26[ema26Index] === undefined
    ) {
      continue;
    }

    macdValues.push({
      time: data[i].time,
      value:
        ema12[ema12Index] -
        ema26[ema26Index],
    });
  }

  /*
   * Signal line = 9 EMA of MACD
   */
  const macdNumbers =
    macdValues.map(
      (item) => item.value
    );

  const signalValues =
    calculateEMAValues(
      macdNumbers,
      9
    );

  const macdData =
    macdValues.map((item) => ({
      time: item.time,
      value: item.value,
    }));

  const signalData: {
    time: string;
    value: number;
  }[] = [];

  const histogramData: {
    time: string;
    value: number;
  }[] = [];

  /*
   * Signal starts after 8 MACD values
   */
  for (
    let i = 8;
    i < macdValues.length;
    i++
  ) {
    const signal =
      signalValues[i - 8];

    if (signal === undefined) {
      continue;
    }

    signalData.push({
      time: macdValues[i].time,
      value: signal,
    });

    histogramData.push({
      time: macdValues[i].time,
      value:
        macdValues[i].value -
        signal,
    });
  }

  return {
    macdData,
    signalData,
    histogramData,
  };
}

export default function StockChart({
  data,
}: StockChartProps) {
  const chartContainerRef =
    useRef<HTMLDivElement>(null);

  const rsiContainerRef =
    useRef<HTMLDivElement>(null);

  const macdContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !chartContainerRef.current ||
      !rsiContainerRef.current ||
      !macdContainerRef.current ||
      data.length === 0
    ) {
      return;
    }

    /*
     * =========================
     * MAIN PRICE CHART
     * =========================
     */

    const chart = createChart(
      chartContainerRef.current,
      {
        width:
          chartContainerRef.current
            .clientWidth,

        height: 500,

        layout: {
          background: {
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

        timeScale: {
          borderColor: "#334155",
        },

        rightPriceScale: {
          borderColor: "#334155",
        },
      }
    );

    /*
     * Candlestick
     */

    const candleSeries =
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

    candleSeries.setData(
      data.map((item) => ({
        time:
          item.time as `${number}-${number}-${number}`,
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
      }))
    );

    /*
     * EMA 20
     */

    const ema20Series =
      chart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#f59e0b",
          title: "EMA 20",
        }
      );

    ema20Series.setData(
      calculateEMA(data, 20).map(
        (item) => ({
          time:
            item.time as `${number}-${number}-${number}`,
          value: item.value,
        })
      )
    );

    /*
     * EMA 50
     */

    const ema50Series =
      chart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#3b82f6",
          title: "EMA 50",
        }
      );

    ema50Series.setData(
      calculateEMA(data, 50).map(
        (item) => ({
          time:
            item.time as `${number}-${number}-${number}`,
          value: item.value,
        })
      )
    );

    /*
     * SMA 200
     */

    const sma200Series =
      chart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#a855f7",
          title: "SMA 200",
        }
      );

    sma200Series.setData(
      calculateSMA(data, 200).map(
        (item) => ({
          time:
            item.time as `${number}-${number}-${number}`,
          value: item.value,
        })
      )
    );

    /*
     * Volume
     */

    const volumeSeries =
      chart.addSeries(
        HistogramSeries,
        {
          priceFormat: {
            type: "volume",
          },

          priceScaleId: "",
        }
      );

    volumeSeries.setData(
      data.map((item) => ({
        time:
          item.time as `${number}-${number}-${number}`,

        value: Number(item.volume),

        color:
          Number(item.close) >=
          Number(item.open)
            ? "#22c55e"
            : "#ef4444",
      }))
    );

    chart
      .priceScale("")
      .applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

    chart
      .timeScale()
      .fitContent();

    /*
     * =========================
     * RSI CHART
     * =========================
     */

    const rsiChart =
      createChart(
        rsiContainerRef.current,
        {
          width:
            rsiContainerRef.current
              .clientWidth,

          height: 180,

          layout: {
            background: {
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

          rightPriceScale: {
            borderColor: "#334155",
          },

          timeScale: {
            borderColor: "#334155",
          },
        }
      );

    const rsiSeries =
      rsiChart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#06b6d4",
          title: "RSI 14",

          autoscaleInfoProvider:
            () => ({
              priceRange: {
                minValue: 0,
                maxValue: 100,
              },
            }),
        }
      );

    rsiSeries.setData(
      calculateRSI(data, 14).map(
        (item) => ({
          time:
            item.time as `${number}-${number}-${number}`,
          value: item.value,
        })
      )
    );

    rsiChart
      .timeScale()
      .fitContent();

    /*
     * =========================
     * MACD CHART
     * =========================
     */

    const macdChart =
      createChart(
        macdContainerRef.current,
        {
          width:
            macdContainerRef.current
              .clientWidth,

          height: 200,

          layout: {
            background: {
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

          rightPriceScale: {
            borderColor: "#334155",
          },

          timeScale: {
            borderColor: "#334155",
          },
        }
      );

    const macdLine =
      macdChart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#22c55e",
          title: "MACD",
        }
      );

    const signalLine =
      macdChart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#f59e0b",
          title: "Signal",
        }
      );

    const histogram =
      macdChart.addSeries(
        HistogramSeries,
        {
          priceFormat: {
            type: "price",
          },
        }
      );

    const {
      macdData,
      signalData,
      histogramData,
    } = calculateMACD(data);

    macdLine.setData(
      macdData.map((item) => ({
        time:
          item.time as `${number}-${number}-${number}`,
        value: item.value,
      }))
    );

    signalLine.setData(
      signalData.map((item) => ({
        time:
          item.time as `${number}-${number}-${number}`,
        value: item.value,
      }))
    );

    histogram.setData(
      histogramData.map(
        (item) => ({
          time:
            item.time as `${number}-${number}-${number}`,
          value: item.value,

          color:
            item.value >= 0
              ? "#22c55e"
              : "#ef4444",
        })
      )
    );

    macdChart
      .timeScale()
      .fitContent();

    /*
     * Responsive Resize
     */

    const resizeObserver =
      new ResizeObserver(() => {
        if (
          chartContainerRef.current
        ) {
          chart.applyOptions({
            width:
              chartContainerRef.current
                .clientWidth,
          });
        }

        if (
          rsiContainerRef.current
        ) {
          rsiChart.applyOptions({
            width:
              rsiContainerRef.current
                .clientWidth,
          });
        }

        if (
          macdContainerRef.current
        ) {
          macdChart.applyOptions({
            width:
              macdContainerRef.current
                .clientWidth,
          });
        }
      });

    resizeObserver.observe(
      chartContainerRef.current
    );

    resizeObserver.observe(
      rsiContainerRef.current
    );

    resizeObserver.observe(
      macdContainerRef.current
    );

    /*
     * Cleanup
     */

    return () => {
      resizeObserver.disconnect();

      chart.remove();

      rsiChart.remove();

      macdChart.remove();
    };
  }, [data]);

  return (
    <div className="w-full">

      {/* Main Price Chart */}

      <div
        ref={chartContainerRef}
        className="w-full"
      />

      {/* RSI */}

      <div className="mt-6 mb-2 px-2">
        <h3 className="text-sm font-semibold text-slate-300">
          RSI (14)
        </h3>

        <p className="text-xs text-slate-500">
          Above 70: Overbought • Below 30: Oversold
        </p>
      </div>

      <div
        ref={rsiContainerRef}
        className="w-full"
      />

      {/* MACD */}

      <div className="mt-6 mb-2 px-2">
        <h3 className="text-sm font-semibold text-slate-300">
          MACD (12, 26, 9)
        </h3>

        <p className="text-xs text-slate-500">
          MACD vs Signal Line
        </p>
      </div>

      <div
        ref={macdContainerRef}
        className="w-full"
      />

    </div>
  );
}