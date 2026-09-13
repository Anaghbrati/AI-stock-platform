import Groq from "groq-sdk";
import { z } from "zod";

import type {
  AIAnalysisInput,
  AIAnalysisResult,
  SectorAIAnalysisInput,
  SectorAIAnalysisResult,
} from "./types";

import type { AIProvider } from "./provider";

/* =========================================================
   STOCK ANALYSIS SCHEMA
   ========================================================= */

const AIAnalysisSchema = z.object({
  summary: z.string(),
  outlook: z.string(),
  risk: z.string(),
  keyPoints: z.array(z.string()),
});

/* =========================================================
   SECTOR ANALYSIS SCHEMA
   ========================================================= */

const SectorAIAnalysisSchema = z.object({
  summary: z.string(),

  marketObservation: z.string(),

  standoutStocks: z.array(
    z.object({
      ticker: z.string(),
      reason: z.string(),
    })
  ),

  keyEvents: z.array(
    z.object({
      title: z.string(),
      explanation: z.string(),
    })
  ),

  evidence: z.array(z.string()),

  caveats: z.array(z.string()),
});

/* =========================================================
   HELPERS
   ========================================================= */

function cleanJsonResponse(content: string): string {
  let cleanContent = content.trim();

  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");
  }

  return cleanContent.trim();
}

/* =========================================================
   GROQ PROVIDER
   ========================================================= */

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

  /* =======================================================
     EXISTING STOCK ANALYSIS
     ======================================================= */

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
      console.log("Groq model:", this.model);

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

      const parsed = JSON.parse(
        cleanJsonResponse(content)
      );

      return AIAnalysisSchema.parse(parsed);
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

  /* =======================================================
     SECTOR SCANNER AI
     ======================================================= */

  async generateSectorAnalysis(
    input: SectorAIAnalysisInput
  ): Promise<SectorAIAnalysisResult> {
    const stockEvidence = input.stocks
      .map(
        (stock) => `
Ticker: ${stock.ticker}
Scanner Score: ${stock.scannerScore}
20D Return: ${stock.return20D ?? "N/A"}%
Relative Performance: ${
          stock.relativePerformance20D ?? "N/A"
        }%
Volume Ratio: ${stock.volumeRatio20D ?? "N/A"}x
20D Volatility: ${stock.volatility20D ?? "N/A"}%
Distance from MA20: ${
          stock.distanceFromMA20 ?? "N/A"
        }%
Distance from MA50: ${
          stock.distanceFromMA50 ?? "N/A"
        }%
52W Position: ${
          stock.fiftyTwoWeekPosition ?? "N/A"
        }%
Distance from 52W High: ${
          stock.distanceFrom52WeekHigh ?? "N/A"
        }%

Observations:
${stock.observations
  .map((observation) => `- ${observation}`)
  .join("\n")}
`
      )
      .join("\n---\n");

    const eventEvidence = input.events
      .map(
        (event) => `
Ticker: ${event.ticker}
Event: ${event.title}
Type: ${event.type}
Severity: ${event.severity}
Description: ${event.description}
Value: ${event.value ?? "N/A"}${event.unit ?? ""}
`
      )
      .join("\n---\n");

    const prompt = `
You are the AI intelligence layer of a quantitative market scanner.

The scanner has already calculated all numerical market signals.

Your job is NOT to calculate new market metrics.

Your job is to interpret the supplied quantitative evidence and explain
what stands out in the sector.

SECTOR

Sector ID: ${input.sectorId}
Sector Name: ${input.sectorName}
Scan Time: ${input.scannedAt}

Stocks configured: ${input.totalStocks}
Stocks successfully scanned: ${input.successfulStocks}
Stocks failed: ${input.failedStocks}

Sector average 20D return:
${input.sectorAverageReturn20D ?? "N/A"}%

QUANTITATIVE STOCK EVIDENCE

${stockEvidence || "No successful stock evidence available."}

RADAR EVENTS

${eventEvidence || "No Radar events detected."}

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "short explanation of what is happening across the sector",

  "marketObservation": "neutral explanation of the most notable sector behaviour",

  "standoutStocks": [
    {
      "ticker": "TICKER.NS",
      "reason": "why this stock stands out based only on supplied evidence"
    }
  ],

  "keyEvents": [
    {
      "title": "event title",
      "explanation": "explanation based only on supplied evidence"
    }
  ],

  "evidence": [
    "quantitative evidence point",
    "quantitative evidence point"
  ],

  "caveats": [
    "important limitation or uncertainty"
  ]
}

Rules:

- Do NOT say BUY.
- Do NOT say SELL.
- Do NOT say HOLD.
- Do NOT provide price targets.
- Do NOT predict a guaranteed future price.
- Do NOT provide guaranteed returns.
- Do NOT provide personalized investment advice.
- Do NOT invent news, fundamentals, events, or data.
- Do NOT calculate metrics that are not supplied.
- Do NOT imply certainty about future performance.
- Use neutral language such as:
  "Worth investigating",
  "Unusual activity detected",
  "Strong relative movement",
  "Potential anomaly",
  "Historical observation",
  "Quantitative signal",
  "Market observation".
- Explain why a stock or event stands out using the supplied numbers.
- Keep the response concise.
- If evidence is weak, explicitly say so.
`;

    try {
      console.log(
        "Groq sector analysis model:",
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
                "You are a careful quantitative market intelligence assistant. Interpret supplied evidence only. Return valid JSON only.",
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
          "Groq returned an empty sector response"
        );
      }

      const parsed = JSON.parse(
        cleanJsonResponse(content)
      );

      return SectorAIAnalysisSchema.parse(
        parsed
      );
    } catch (error) {
      console.error(
        "Groq sector AI generation failed:",
        error
      );

      throw new Error(
        "AI provider failed to generate sector analysis"
      );
    }
  }
}