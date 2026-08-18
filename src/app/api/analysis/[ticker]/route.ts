import { NextResponse } from "next/server";

import {
  getHistoricalData,
} from "../../../../lib/services/stock.service";

import {
  calculateTechnicalSignal,
} from "../../../../lib/services/technical-analysis";

import {
  generateAIAnalysis,
} from "../../../../lib/services/ai-analysis.service";

interface RouteContext {
  params: Promise<{
    ticker: string;
  }>;
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    /* =====================================================
       TICKER
    ===================================================== */

    const { ticker } =
      await params;

    const normalizedTicker =
      decodeURIComponent(ticker)
        .trim()
        .toUpperCase();

    if (!normalizedTicker) {
      return NextResponse.json(
        {
          error:
            "Ticker is required",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       EXISTING QUOTE DATA
    ===================================================== */

    const url =
      new URL(request.url);

    const priceParam =
      url.searchParams.get(
        "price"
      );

    const changePercentParam =
      url.searchParams.get(
        "changePercent"
      );

    const parsedPrice =
      priceParam !== null
        ? Number(priceParam)
        : null;

    const parsedChangePercent =
      changePercentParam !== null
        ? Number(
            changePercentParam
          )
        : null;

    const price =
      Number.isFinite(
        parsedPrice
      )
        ? parsedPrice
        : null;

    const changePercent =
      Number.isFinite(
        parsedChangePercent
      )
        ? parsedChangePercent
        : null;

    /* =====================================================
       HISTORICAL DATA
       
       Cache + in-flight deduplication
       happens inside getHistoricalData().
    ===================================================== */

    const historicalData =
      await getHistoricalData(
        normalizedTicker,
        "1y",
        "1d"
      );

    /* =====================================================
       TECHNICAL ANALYSIS
    ===================================================== */

    const technical =
      calculateTechnicalSignal(
        historicalData
      );

    /* =====================================================
       AI INPUT
    ===================================================== */

    const aiInput = {
      ticker:
        normalizedTicker,

      price,

      changePercent,

      signal:
        technical.signal,

      score:
        technical.score,

      rsi:
        technical.rsi,

      macd:
        technical.macd,

      macdSignal:
        technical.macdSignal,

      macdHistogram:
        technical.macdHistogram,

      reasons:
        technical.reasons,
    };

    /* =====================================================
       AI ANALYSIS
    ===================================================== */

    const ai =
      await generateAIAnalysis(
        aiInput
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        ticker:
          normalizedTicker,

        technical: {
          signal:
            technical.signal,

          score:
            technical.score,

          reasons:
            technical.reasons,

          rsi:
            technical.rsi,

          macd:
            technical.macd,

          macdSignal:
            technical.macdSignal,

          macdHistogram:
            technical.macdHistogram,
        },

        ai,
      },
      {
        status: 200,

        headers: {
          /*
           * We deliberately don't cache
           * the complete analysis response
           * because AI output may change.
           *
           * Historical data itself is cached
           * inside stock.service.ts.
           */

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Analysis API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate stock analysis",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}