import {
  GroqAIProvider,
} from "../providers/ai";

import type {
  SectorAIAnalysisInput,
  SectorAIAnalysisResult,
} from "../providers/ai";

import type {
  SectorScanResult,
} from "./scanner.types";

/* =========================================================
   RESULT
   ========================================================= */

export interface SectorAIServiceResult {
  success: boolean;

  data: SectorAIAnalysisResult | null;

  error: string | null;
}

/* =========================================================
   INPUT BUILDER
   ========================================================= */

/**
 * Convert the deterministic scanner result into a compact
 * evidence payload for the AI layer.
 *
 * Raw candles are intentionally NOT sent to Groq.
 */
function buildSectorAIInput(
  result: SectorScanResult
): SectorAIAnalysisInput {
  return {
    sectorId:
      result.sectorId,

    sectorName:
      result.sectorName,

    scannedAt:
      result.scannedAt,

    totalStocks:
      result.totalStocks,

    successfulStocks:
      result.successfulStocks,

    failedStocks:
      result.failedStocks,

    sectorAverageReturn20D:
      result.sectorAverageReturn20D,

    stocks:
      result.stocks.map(
        (stock) => ({
          ticker:
            stock.ticker,

          scannerScore:
            stock.scannerScore,

          return20D:
            stock.signals.return20D,

          relativePerformance20D:
            stock.relativePerformance
              .relativePerformance20D,

          volumeRatio20D:
            stock.signals
              .volumeRatio20D,

          volatility20D:
            stock.signals
              .volatility20D,

          distanceFromMA20:
            stock.signals
              .distanceFromMA20,

          distanceFromMA50:
            stock.signals
              .distanceFromMA50,

          fiftyTwoWeekPosition:
            stock.signals
              .fiftyTwoWeekPosition,

          distanceFrom52WeekHigh:
            stock.signals
              .distanceFrom52WeekHigh,

          observations:
            stock.observations,
        })
      ),

    events:
      result.events.events.map(
        (event) => ({
          ticker:
            event.ticker,

          type:
            event.type,

          severity:
            event.severity,

          title:
            event.title,

          description:
            event.description,

          value:
            event.value,

          unit:
            event.unit,
        })
      ),
  };
}

/* =========================================================
   GENERATE SECTOR INTELLIGENCE
   ========================================================= */

export async function generateSectorAIAnalysis(
  result: SectorScanResult
): Promise<SectorAIServiceResult> {
  try {
    if (
      result.successfulStocks === 0
    ) {
      return {
        success: false,

        data: null,

        error:
          "No stocks were successfully scanned. AI sector analysis was skipped.",
      };
    }

    const input =
      buildSectorAIInput(
        result
      );

    const provider =
      new GroqAIProvider();

    const analysis =
      await provider.generateSectorAnalysis(
        input
      );

    return {
      success: true,

      data: analysis,

      error: null,
    };
  } catch (error) {
    /**
     * IMPORTANT:
     *
     * AI failure must never destroy the
     * quantitative Radar result.
     */
    console.error(
      "[Scanner] Sector AI analysis failed:",
      error
    );

    return {
      success: false,

      data: null,

      error:
        error instanceof Error
          ? error.message
          : "Sector AI analysis failed.",
    };
  }
}