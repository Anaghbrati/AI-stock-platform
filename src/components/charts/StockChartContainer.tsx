"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const StockChart = dynamic(
  () => import("./StockChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full animate-pulse rounded-lg bg-slate-800/40" />
    ),
  }
);

import type { HistoricalChartData } from "../../types/market-data";

import {
  getHistoricalCache,
  setHistoricalCache,
  getInFlightRequest,
  setInFlightRequest,
  clearInFlightRequest,
} from "../../lib/cache/historical-cache";

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
  useState<HistoricalChartData[]>([]);

  const [selectedRange, setSelectedRange] =
    useState("1Y");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ========================================================
   * REQUEST ID
   * ========================================================
   *
   * Identifies the latest component request.
   *
   * If an older request finishes after a newer request,
   * it will be ignored and cannot overwrite the chart.
   */
  const requestIdRef = useRef(0);

  /*
   * ========================================================
   * ACTIVE CONTROLLER
   * ========================================================
   *
   * Controls the component's ability to update state.
   *
   * IMPORTANT:
   *
   * The shared fetch itself is NOT aborted because another
   * component/request may still be using the same request.
   */
  const activeControllerRef =
    useRef<AbortController | null>(null);

  /*
   * ========================================================
   * FETCH HISTORICAL DATA
   * ========================================================
   */
  const fetchData = useCallback(
    async (
      range: Range,
      signal: AbortSignal,
      requestId: number
    ) => {
      const cleanTicker =
        decodeURIComponent(ticker)
          .trim()
          .toUpperCase();

      if (!cleanTicker) {
        if (
          !signal.aborted &&
          requestId === requestIdRef.current
        ) {
          setError("Invalid ticker.");
          setLoading(false);
        }

        return;
      }

      const cacheKey = {
        ticker: cleanTicker,

        period:
          range.period
            .trim()
            .toLowerCase(),

        interval:
          range.interval
            .trim()
            .toLowerCase(),
      };

      try {
        /*
         * ==================================================
         * START LOADING
         * ==================================================
         *
         * DO NOT clear existing chart data.
         *
         * The previous chart remains visible while the
         * new range loads.
         */
        if (
          !signal.aborted &&
          requestId === requestIdRef.current
        ) {
          setLoading(true);
          setError("");
        }

        /*
         * ==================================================
         * 1. CHECK CACHE
         * ==================================================
         */
        const cachedData =
          getHistoricalCache(
            cacheKey.ticker,
            cacheKey.period,
            cacheKey.interval
          );

        if (cachedData) {
          if (
            signal.aborted ||
            requestId !== requestIdRef.current
          ) {
            return;
          }

          setData(cachedData);
          setLoading(false);

          return;
        }

        /*
         * ==================================================
         * 2. CHECK IN-FLIGHT REQUEST
         * ==================================================
         */
        const existingRequest =
          getInFlightRequest(
            cacheKey.ticker,
            cacheKey.period,
            cacheKey.interval
          );

        if (existingRequest) {
          const existingData =
            await existingRequest;

          if (
            signal.aborted ||
            requestId !== requestIdRef.current
          ) {
            return;
          }

          setData(existingData);
          setLoading(false);

          return;
        }

        /*
         * ==================================================
         * 3. CREATE SHARED REQUEST
         * ==================================================
         *
         * This fetch intentionally does NOT use the
         * component AbortController.
         *
         * The request belongs to the shared in-flight
         * request cache.
         */
        const request =
          fetch(
            `/api/stock/${encodeURIComponent(
              cacheKey.ticker
            )}/historical?period=${encodeURIComponent(
              cacheKey.period
            )}&interval=${encodeURIComponent(
              cacheKey.interval
            )}`,
            {
              cache: "no-store",
            }
          ).then(async (response) => {
            const result =
              await response
                .json()
                .catch(() => null);

            if (!response.ok) {
              throw new Error(
                result?.error ||
                  result?.detail ||
                  `Historical request failed (${response.status})`
              );
            }

            if (
              !Array.isArray(result)
            ) {
              throw new Error(
                "Invalid historical data received."
              );
            }

            /*
             * ==============================================
             * NORMALIZE
             * ==============================================
             */
            const normalizedData:
               HistoricalChartData[] =
              result
                .map((item: any) => {
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
                    Number(
                      item?.volume ?? 0
                    );

                  if (
                    !Number.isFinite(
                      time
                    ) ||
                    !Number.isFinite(
                      open
                    ) ||
                    !Number.isFinite(
                      high
                    ) ||
                    !Number.isFinite(
                      low
                    ) ||
                    !Number.isFinite(
                      close
                    )
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
                })
                .filter(
                  (
                    item
                  ): item is  HistoricalChartData =>
                    item !== null
                );

            /*
             * ==============================================
             * SORT
             * ==============================================
             */
            normalizedData.sort(
              (a, b) =>
                a.time - b.time
            );

            /*
             * ==============================================
             * EMPTY DATA
             * ==============================================
             */
            if (
              normalizedData.length === 0
            ) {
              throw new Error(
                `No historical data available for ${cleanTicker}.`
              );
            }

            /*
             * ==============================================
             * CACHE SUCCESSFUL RESPONSE
             * ==============================================
             */
            setHistoricalCache(
              cacheKey.ticker,
              cacheKey.period,
              cacheKey.interval,
              normalizedData
            );

            return normalizedData;
          });

        /*
         * ==================================================
         * 4. REGISTER SHARED REQUEST
         * ==================================================
         */
        setInFlightRequest(
          cacheKey.ticker,
          cacheKey.period,
          cacheKey.interval,
          request
        );

        try {
          const historicalData =
            await request;

          /*
           * =================================================
           * IMPORTANT RACE PROTECTION
           * =================================================
           *
           * The request may have started earlier but finished
           * after another range became active.
           *
           * Never allow stale data to overwrite the chart.
           */
          if (
            signal.aborted ||
            requestId !== requestIdRef.current
          ) {
            return;
          }

          /*
           * Replace the chart only after the new range has
           * successfully arrived.
           */
          setData(
            historicalData
          );
        } finally {
          /*
           * Only clear the in-flight entry if this exact
           * request is still registered.
           */
          const currentRequest =
            getInFlightRequest(
              cacheKey.ticker,
              cacheKey.period,
              cacheKey.interval
            );

          if (
            currentRequest === request
          ) {
            clearInFlightRequest(
              cacheKey.ticker,
              cacheKey.period,
              cacheKey.interval
            );
          }
        }
      } catch (error) {
        /*
         * ==================================================
         * IGNORE STALE / ABORTED REQUESTS
         * ==================================================
         */
        if (
          signal.aborted ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        console.error(
          "[StockChart] Historical data error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load chart data."
        );
      } finally {
        /*
         * ==================================================
         * ONLY LATEST REQUEST CAN STOP LOADING
         * ==================================================
         */
        if (
          !signal.aborted &&
          requestId === requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [ticker]
  );

  /*
   * ========================================================
   * LOAD DATA
   * ========================================================
   */
  useEffect(() => {
    /*
     * Every effect execution represents a new request
     * generation.
     */
    const requestId =
      ++requestIdRef.current;

    if (!ticker?.trim()) {
      setError("Invalid ticker.");
      setData([]);
      setLoading(false);

      return;
    }

    const range =
      ranges.find(
        (item) =>
          item.label ===
          selectedRange
      );

    if (!range) {
      return;
    }

    /*
     * Abort the previous component listener.
     *
     * The shared network request remains alive.
     */
    activeControllerRef.current?.abort();

    const controller =
      new AbortController();

    activeControllerRef.current =
      controller;

    void fetchData(
      range,
      controller.signal,
      requestId
    );

    /*
     * Cleanup
     */
    return () => {
      controller.abort();

      if (
        activeControllerRef.current ===
        controller
      ) {
        activeControllerRef.current =
          null;
      }
    };
  }, [
    ticker,
    selectedRange,
    fetchData,
  ]);

  /*
   * ========================================================
   * RETRY
   * ========================================================
   */
  function handleRetry() {
    const range =
      ranges.find(
        (item) =>
          item.label ===
          selectedRange
      );

    if (!range) {
      return;
    }

    /*
     * Generate a new request identity.
     */
    const requestId =
      ++requestIdRef.current;

    /*
     * Cancel previous component listener.
     */
    activeControllerRef.current?.abort();

    const controller =
      new AbortController();

    activeControllerRef.current =
      controller;

    void fetchData(
      range,
      controller.signal,
      requestId
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

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

        {/* ===================================================
            RANGE BUTTONS
        =================================================== */}

        <div className="flex flex-wrap gap-2">

          {ranges.map(
            (range) => (
              <button
                key={range.label}
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
                } ${
                  loading &&
                  selectedRange ===
                    range.label
                    ? "cursor-wait opacity-70"
                    : ""
                }`}
              >
                {range.label}
              </button>
            )
          )}

        </div>

      </div>

      {/* =====================================================
          CHART AREA
      ===================================================== */}

      <div className="relative">

        {/* ===================================================
            EXISTING CHART
        =================================================== */}

        {!error &&
          data.length > 0 && (
            <StockChart
              data={data}
            />
          )}

        {/* ===================================================
            INITIAL LOADING
        =================================================== */}

        {loading &&
          data.length === 0 && (

            <div className="h-[500px] animate-pulse">

              <div className="relative h-full overflow-hidden rounded-lg bg-slate-800/50">

                {/* Fake grid */}

                <div className="absolute inset-x-0 top-16 border-t border-slate-700/60" />

                <div className="absolute inset-x-0 top-32 border-t border-slate-700/60" />

                <div className="absolute inset-x-0 top-48 border-t border-slate-700/60" />

                <div className="absolute inset-x-0 top-64 border-t border-slate-700/60" />

                <div className="absolute inset-x-0 top-80 border-t border-slate-700/60" />

                {/* Fake chart line */}

                <div className="absolute left-[5%] top-[65%] h-1 w-[12%] rounded bg-slate-600" />

                <div className="absolute left-[17%] top-[58%] h-1 w-[12%] rotate-[-8deg] rounded bg-slate-600" />

                <div className="absolute left-[29%] top-[50%] h-1 w-[12%] rotate-[5deg] rounded bg-slate-600" />

                <div className="absolute left-[41%] top-[55%] h-1 w-[12%] rotate-[-12deg] rounded bg-slate-600" />

                <div className="absolute left-[53%] top-[40%] h-1 w-[12%] rotate-[8deg] rounded bg-slate-600" />

                <div className="absolute left-[65%] top-[45%] h-1 w-[12%] rotate-[-5deg] rounded bg-slate-600" />

                <div className="absolute left-[77%] top-[30%] h-1 w-[12%] rotate-[10deg] rounded bg-slate-600" />

                {/* Loading message */}

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="rounded-lg bg-slate-900/80 px-5 py-3">

                    <p className="text-sm text-slate-400">
                      Loading{" "}
                      {selectedRange}{" "}
                      chart...
                    </p>

                  </div>

                </div>

              </div>

            </div>
          )}

        {/* ===================================================
            RANGE CHANGE LOADING
        =================================================== */}

        {loading &&
          data.length > 0 && (

            <div className="pointer-events-none absolute right-4 top-4 z-10">

              <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 shadow-lg backdrop-blur">

                <div className="flex items-center gap-2">

                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-white" />

                  <span className="text-xs text-slate-300">
                    Loading{" "}
                    {selectedRange}
                    ...
                  </span>

                </div>

              </div>

            </div>
          )}

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading &&
        error && (

          <div className="mt-4 flex min-h-[120px] flex-col items-center justify-center text-center">

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

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

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