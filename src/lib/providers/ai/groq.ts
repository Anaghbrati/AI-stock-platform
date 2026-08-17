import Groq from "groq-sdk";
import { z } from "zod";

import {
  AIAnalysisInput,
  AIAnalysisResult,
} from "./types";

import { AIProvider } from "./provider";

const AIAnalysisSchema = z.object({
  summary: z.string(),
  outlook: z.string(),
  risk: z.string(),
  keyPoints: z.array(z.string()),
});

export class GroqAIProvider implements AIProvider {
  private client: Groq;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not configured"
      );
    }

    this.model =
      process.env.GROQ_MODEL ||
      "openai/gpt-oss-20b";

    this.client = new Groq({
      apiKey,
    });
  }

  async generateAnalysis(
    input: AIAnalysisInput
  ): Promise<AIAnalysisResult> {
    const prompt = `
You are a financial market analysis assistant.

Analyze the following stock data and provide a concise,
educational market analysis.

Stock:
Ticker: ${input.ticker}
Price: ${input.price ?? "N/A"}
Change: ${input.changePercent ?? "N/A"}%

Technical Signal: ${input.signal}
Technical Score: ${input.score}

RSI: ${input.rsi ?? "N/A"}
MACD: ${input.macd ?? "N/A"}
MACD Signal: ${input.macdSignal ?? "N/A"}
MACD Histogram: ${input.macdHistogram ?? "N/A"}

Technical Reasons:
${input.reasons
  .map((reason) => `- ${reason}`)
  .join("\n")}

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "short summary",
  "outlook": "BULLISH, BEARISH, or NEUTRAL",
  "risk": "LOW, MEDIUM, or HIGH",
  "keyPoints": [
    "key point 1",
    "key point 2",
    "key point 3"
  ]
}

Rules:
- Do not provide a trading guarantee.
- Do not claim certainty about future prices.
- Do not invent data.
- Keep the analysis concise.
`;

    try {
      console.log(
        "Groq model:",
        this.model
      );

      const completion =
        await this.client.chat.completions.create({
          model: this.model,

          temperature: 0.2,

          messages: [
            {
              role: "system",
              content:
                "You are a careful financial analysis assistant. Return valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

      const content =
        completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error(
          "Groq returned an empty response"
        );
      }

      let cleanContent = content.trim();

      // Remove markdown JSON fences if the model adds them.
      if (
        cleanContent.startsWith("```json")
      ) {
        cleanContent =
          cleanContent
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
      } else if (
        cleanContent.startsWith("```")
      ) {
        cleanContent =
          cleanContent
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "");
      }

      const parsed =
        JSON.parse(cleanContent);

      return AIAnalysisSchema.parse(
        parsed
      );
    } catch (error) {
      console.error(
        "Groq AI generation failed:",
        error
      );

      throw new Error(
        "AI provider failed to generate analysis"
      );
    }
  }
}