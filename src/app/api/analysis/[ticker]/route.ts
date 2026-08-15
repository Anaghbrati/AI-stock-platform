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

    const normalizedTicker = ticker.toUpperCase();

    console.log(
      `Generating analysis for ${normalizedTicker}`
    );

    // --------------------------------
    // 1. Stock Quote
    // --------------------------------

    const stock = await getStockQuote(
      normalizedTicker
    );

    // --------------------------------
    // 2. Historical Data
    // --------------------------------

    const historicalData =
      await getHistoricalData(
        normalizedTicker,
        "1y",
        "1d"
      );

    // --------------------------------
    // 3. Technical Analysis
    // --------------------------------

    const technicalAnalysis =
      calculateTechnicalSignal(
        historicalData
      );

    console.log(
      "Technical analysis:",
      technicalAnalysis
    );

    // --------------------------------
    // 4. AI Analysis
    // --------------------------------

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
          technicalAnalysis.macdHistogram ??
          null,

        reasons:
          technicalAnalysis.reasons,
      });

    // --------------------------------
    // 5. Final Response
    // --------------------------------

    return NextResponse.json({
      ticker: normalizedTicker,

      stock: stock,

      technical: technicalAnalysis,

      ai: aiAnalysis,
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

        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}