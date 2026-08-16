import {
  GroqAIProvider,
  AIProvider,
  AIAnalysisInput,
  AIAnalysisResult,
} from "../providers/ai";

function getAIProvider(): AIProvider {
  const provider =
    process.env.AI_PROVIDER || "groq";

  switch (provider) {
    case "groq":
      return new GroqAIProvider();

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
}

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
      input.reasons,
  };
}

export async function generateAIAnalysis(
  input: AIAnalysisInput
): Promise<AIAnalysisResult> {
  try {
    console.log(
      "AI_PROVIDER:",
      process.env.AI_PROVIDER
    );

    console.log(
      "GROQ_API_KEY exists:",
      Boolean(process.env.GROQ_API_KEY)
    );

    const provider =
      getAIProvider();

    return await provider.generateAnalysis(
      input
    );

  } catch (error) {
    console.error(
      "=============================="
    );

    console.error(
      "AI PROVIDER ERROR:"
    );

    console.error(error);

    console.error(
      "=============================="
    );

    return createFallbackAnalysis(
      input
    );
  }
}