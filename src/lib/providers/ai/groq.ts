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

export class GroqAIProvider
  implements AIProvider
{
  private client: Groq;

  constructor() {
    const apiKey =
      process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not configured"
      );
    }

    this.client = new Groq({
      apiKey,
    });
  }

  async generateAnalysis(
    input: AIAnalysisInput
  ): Promise<AIAnalysisResult> {
    const prompt = `
You are a financial market analysis assistant.

Analyze the following stock data and provide a concise, educational market analysis.

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

Return ONLY valid JSON in this exact structure:

{
  "summary": "short summary",
  "outlook": "market outlook",
  "risk": "risk assessment",
  "keyPoints": [
    "key point 1",
    "key point 2",
    "key point 3"
  ]
}

Do not provide a trading guarantee.
Do not claim certainty about future prices.
`;

    const completion =
      await this.client.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",

        temperature: 0.2,

        messages: [
          {
            role: "system",
            content:
              "You are a careful financial analysis assistant.",
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

    try {
      const parsed =
        JSON.parse(content);

      const validated =
        AIAnalysisSchema.parse(
          parsed
        );

      return validated;
    } catch (error) {
      console.error(
        "Invalid AI response:",
        error
      );

      throw new Error(
        "AI provider returned an invalid analysis format"
      );
    }
  }
}