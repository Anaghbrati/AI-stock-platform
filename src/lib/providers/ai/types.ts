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