import {
  GroqAIProvider,
  AIProvider,
  AIAnalysisInput,
  AIAnalysisResult,
} from "../providers/ai";

/* =========================================================
   AI PROVIDER
========================================================= */

function getAIProvider(): AIProvider {
  const provider =
    process.env.AI_PROVIDER ||
    "groq";

  switch (provider) {
    case "groq":
      return new GroqAIProvider();

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
}

/* =========================================================
   FALLBACK
========================================================= */

function createFallbackAnalysis(
  input: AIAnalysisInput
): AIAnalysisResult {
  return {
    summary:
      "AI analysis is currently unavailable because the AI provider is not configured.",

    outlook:
      `Technical indicators currently show a ${input.signal.toLowerCase()} outlook.`,

    risk:
      "Risk assessment requires additional market and fundamental data.",

    keyPoints:
      input.reasons ?? [],
  };
}

/* =========================================================
   GENERATE AI ANALYSIS
========================================================= */

export async function generateAIAnalysis(
  input: AIAnalysisInput
): Promise<AIAnalysisResult> {
  try {
    const provider =
      getAIProvider();

    return await provider.generateAnalysis(
      input
    );
  } catch (error) {
    console.error(
      "AI provider error:",
      error
    );

    return createFallbackAnalysis(
      input
    );
  }
}