import { NextResponse } from "next/server";

import {
  getStockQuote,
  getHistoricalData,
} from "../../../../lib/services/stock.service";

import { calculateTechnicalSignal } from "../../../../lib/services/technical-analysis";

import { generateAIAnalysis } from "../../../../lib/services/ai-analysis.service";

interface RouteContext {
  params: Promise<{
    ticker: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { ticker } = await params;

    const normalizedTicker =
      ticker.toUpperCase();

    console.log(
      `Generating analysis for ${normalizedTicker}`
    );

    /*
     * Fetch quote and historical data
     * simultaneously.
     */
    const [stock, historicalData] =
      await Promise.all([
        getStockQuote(normalizedTicker),

        getHistoricalData(
          normalizedTicker,
          "1y",
          "1d"
        ),
      ]);

    /*
     * Calculate technical indicators.
     * This is local computation, so it is fast.
     */
    const technicalAnalysis =
      calculateTechnicalSignal(
        historicalData
      );

    console.log(
      "Technical analysis:",
      technicalAnalysis
    );

    /*
     * Generate AI analysis.
     *
     * The AI service contains its own
     * fallback handling.
     */
    const aiAnalysis =
      await generateAIAnalysis({
        ticker: normalizedTicker,

        price:
          stock.price ?? null,

        changePercent:
          stock.changePercent ?? null,

        signal:
          technicalAnalysis.signal,

        score:
          technicalAnalysis.score,

        rsi:
          technicalAnalysis.rsi,

        macd:
          technicalAnalysis.macd,

        macdSignal:
          technicalAnalysis.macdSignal,

        macdHistogram:
          technicalAnalysis.macdHistogram,

        reasons:
          technicalAnalysis.reasons,
      });

    return NextResponse.json({
      ticker: normalizedTicker,

      stock,

      technical:
        technicalAnalysis,

      ai:
        aiAnalysis,
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