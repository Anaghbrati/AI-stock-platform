export interface AIAnalysisInput {
  ticker: string;

  price: number | null;
  changePercent: number | null;

  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  score: number;

  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;

  reasons: string[];
}

export interface AIAnalysisResult {
  summary: string;
  outlook: string;
  risk: string;
  keyPoints: string[];
}

/* =========================================================
   SECTOR SCANNER AI
   ========================================================= */

export interface SectorAIAnalysisInput {
  sectorId: string;
  sectorName: string;

  scannedAt: string;

  totalStocks: number;
  successfulStocks: number;
  failedStocks: number;

  sectorAverageReturn20D: number | null;

  stocks: Array<{
    ticker: string;
    scannerScore: number;

    return20D: number | null;
    relativePerformance20D: number | null;

    volumeRatio20D: number | null;
    volatility20D: number | null;

    distanceFromMA20: number | null;
    distanceFromMA50: number | null;

    fiftyTwoWeekPosition: number | null;
    distanceFrom52WeekHigh: number | null;

    observations: string[];
  }>;

  events: Array<{
    ticker: string;
    type: string;
    severity: "low" | "medium" | "high";
    title: string;
    description: string;
    value: number | null;
    unit: "%" | "x" | null;
  }>;
}

export interface SectorAIAnalysisResult {
  summary: string;

  marketObservation: string;

  standoutStocks: Array<{
    ticker: string;
    reason: string;
  }>;

  keyEvents: Array<{
    title: string;
    explanation: string;
  }>;

  evidence: string[];

  caveats: string[];
}