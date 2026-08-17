import { NextResponse } from "next/server";

import {
  getStockQuote,
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

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    // ========================================
    // TICKER
    // ========================================

    const { ticker } = await params;

    const normalizedTicker =
      ticker.toUpperCase();

    // ========================================
    // STOCK QUOTE
    // ========================================

    const stock =
      await getStockQuote(
        normalizedTicker
      );

    // ========================================
    // HISTORICAL DATA
    // ========================================

    const historicalData =
      await getHistoricalData(
        normalizedTicker,
        "1y",
        "1d"
      );

    // ========================================
    // TECHNICAL ANALYSIS
    // ========================================

    const technical =
      calculateTechnicalSignal(
        historicalData
      );

    // ========================================
    // AI ANALYSIS
    // ========================================

    const aiInput = {
      ticker: normalizedTicker,

      price:
        stock.price ?? null,

      changePercent:
        stock.changePercent ?? null,

      signal:
        technical.signal,

      score:
        technical.score,

      rsi:
        technical.rsi ?? null,

      macd:
        technical.macd ?? null,

      macdSignal:
        technical.macdSignal ?? null,

      macdHistogram:
        technical.macdHistogram ?? null,

      reasons:
        technical.reasons ?? [],
    };

    const ai =
      await generateAIAnalysis(
        aiInput
      );

    // ========================================
    // FINAL RESPONSE
    // ========================================

    return NextResponse.json({
      ticker: normalizedTicker,

      technical: {
        signal:
          technical.signal,

        score:
          technical.score,

        reasons:
          technical.reasons,

        rsi:
          technical.rsi ?? null,

        macd:
          technical.macd ?? null,

        macdSignal:
          technical.macdSignal ?? null,

        macdHistogram:
          technical.macdHistogram ?? null,
      },

      ai,
    });

  } catch (error) {
    console.error(
      "Analysis API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate stock analysis",
      },
      {
        status: 500,
      }
    );
  }
}