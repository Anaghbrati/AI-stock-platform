import type {
  AIAnalysisInput,
  AIAnalysisResult,
  SectorAIAnalysisInput,
  SectorAIAnalysisResult,
} from "./types";

export interface AIProvider {
  generateAnalysis(
    input: AIAnalysisInput
  ): Promise<AIAnalysisResult>;

  generateSectorAnalysis(
    input: SectorAIAnalysisInput
  ): Promise<SectorAIAnalysisResult>;
}