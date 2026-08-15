// import {
//   generateGroqAnalysis,
//   AIAnalysisInput,
//   AIAnalysisResult,
// } from "../providers/ai/groq";

// export async function generateAIAnalysis(
//   input: AIAnalysisInput
// ): Promise<AIAnalysisResult> {
//   const provider =
//     process.env.AI_PROVIDER || "groq";

//   if (provider === "groq") {
//     return generateGroqAnalysis(input);
//   }

//   throw new Error(
//     `Unsupported AI provider: ${provider}`
//   );
// }



// // interface TechnicalAnalysisInput {
// //   ticker: string;
// //   price: number | null;
// //   changePercent: number | null;

// //   signal: "BULLISH" | "BEARISH" | "NEUTRAL";
// //   score: number;

// //   rsi: number | null;
// //   macd: number | null;
// //   macdSignal: number | null;
// //   macdHistogram: number | null;

// //   reasons: string[];
// // }

// // export interface AIAnalysisResult {
// //   summary: string;
// //   outlook: string;
// //   risk: string;
// //   keyPoints: string[];
// // }

// // export async function generateAIAnalysis(
// //   data: TechnicalAnalysisInput
// // ): Promise<AIAnalysisResult> {
// //   const apiKey = process.env.GROQ_API_KEY;

// //   if (!apiKey) {
// //     return {
// //       summary:
// //         "AI analysis is currently unavailable because the AI provider is not configured.",

// //       outlook:
// //         `Technical indicators currently show a ${data.signal.toLowerCase()} outlook.`,

// //       risk:
// //         "Risk assessment requires additional market and fundamental data.",

// //       keyPoints: data.reasons,
// //     };
// //   }

// //   const prompt = `
// // You are a financial market analysis assistant.

// // Analyze the following stock data.

// // Ticker: ${data.ticker}
// // Current Price: ${data.price ?? "N/A"}
// // Change: ${data.changePercent ?? "N/A"}%

// // Technical Signal: ${data.signal}
// // Technical Score: ${data.score}

// // RSI: ${data.rsi ?? "N/A"}
// // MACD: ${data.macd ?? "N/A"}
// // MACD Signal: ${data.macdSignal ?? "N/A"}
// // MACD Histogram: ${data.macdHistogram ?? "N/A"}

// // Technical Reasons:
// // ${data.reasons.map((reason) => `- ${reason}`).join("\n")}

// // Return a concise analysis containing:

// // 1. summary
// // 2. outlook
// // 3. risk
// // 4. keyPoints

// // Do not guarantee profits.
// // Do not provide personalized financial advice.
// // Clearly mention uncertainty.
// // `;

// //   try {
// //     const response = await fetch(
// //       "https://api.groq.com/openai/v1/chat/completions",
// //       {
// //         method: "POST",

// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${apiKey}`,
// //         },

// //         body: JSON.stringify({
// //           model: "llama-3.3-70b-versatile",

// //           messages: [
// //             {
// //               role: "system",
// //               content:
// //                 "You are a financial analysis assistant.",
// //             },
// //             {
// //               role: "user",
// //               content: prompt,
// //             },
// //           ],

// //           temperature: 0.2,
// //         }),
// //       }
// //     );

// //     if (!response.ok) {
// //       throw new Error(
// //         `AI provider returned ${response.status}`
// //       );
// //     }

// //     const result = await response.json();

// //     const content =
// //       result?.choices?.[0]?.message?.content;

// //     if (!content) {
// //       throw new Error(
// //         "AI provider returned empty response"
// //       );
// //     }

// //     return {
// //       summary: content,
// //       outlook:
// //         `Technical signal: ${data.signal}`,
// //       risk:
// //         "AI-generated analysis should be treated as informational only.",
// //       keyPoints: data.reasons,
// //     };
// //   } catch (error) {
// //     console.error(
// //       "AI analysis error:",
// //       error
// //     );

// //     return {
// //       summary:
// //         "Unable to generate AI analysis at this time.",

// //       outlook:
// //         `Current technical signal: ${data.signal}`,

// //       risk:
// //         "AI analysis is unavailable. Do not make trading decisions based solely on this signal.",

// //       keyPoints: data.reasons,
// //     };
// //   }
// // }



interface TechnicalAnalysisInput {
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

export async function generateAIAnalysis(
  data: TechnicalAnalysisInput
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;

  // --------------------------------
  // 1. AI Provider Not Configured
  // --------------------------------

  if (!apiKey) {
    return {
      summary:
        "AI analysis is currently unavailable because the AI provider is not configured.",

      outlook:
        `Technical indicators currently show a ${data.signal.toLowerCase()} outlook.`,

      risk:
        "Risk assessment requires additional market and fundamental data.",

      keyPoints: data.reasons,
    };
  }

  // --------------------------------
  // 2. Build AI Prompt
  // --------------------------------

  const prompt = `
You are a financial market analysis assistant.

Analyze the following stock's technical data.

Ticker: ${data.ticker}

Current Price:
${data.price ?? "N/A"}

Daily Change:
${data.changePercent ?? "N/A"}%

Technical Signal:
${data.signal}

Technical Score:
${data.score}

RSI:
${data.rsi ?? "N/A"}

MACD:
${data.macd ?? "N/A"}

MACD Signal:
${data.macdSignal ?? "N/A"}

MACD Histogram:
${data.macdHistogram ?? "N/A"}

Technical Reasons:
${data.reasons.map((reason) => `- ${reason}`).join("\n")}

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "summary": "A concise explanation of the current technical situation.",
  "outlook": "A concise description of the possible near-term technical outlook.",
  "risk": "A concise explanation of the major risks and uncertainty.",
  "keyPoints": [
    "Important technical observation",
    "Important technical observation",
    "Important technical observation"
  ]
}

Rules:

- Do not guarantee profits.
- Do not provide personalized financial advice.
- Clearly communicate uncertainty.
- Base the analysis only on the supplied data.
- Do not invent financial data.
- Keep the response concise.
`;

  try {
    // --------------------------------
    // 3. Call Groq
    // --------------------------------

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",

          messages: [
            {
              role: "system",

              content:
                "You are a financial technical analysis assistant. Always return valid JSON when requested.",
            },

            {
              role: "user",

              content: prompt,
            },
          ],

          temperature: 0.2,

          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    // --------------------------------
    // 4. Check Provider Response
    // --------------------------------

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Groq API error ${response.status}: ${errorText}`
      );
    }

    const result = await response.json();

    const content =
      result?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "Groq returned an empty response"
      );
    }

    // --------------------------------
    // 5. Parse JSON
    // --------------------------------

    let parsed: AIAnalysisResult;

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(
        "Groq returned invalid JSON"
      );
    }

    // --------------------------------
    // 6. Validate Response
    // --------------------------------

    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.outlook !== "string" ||
      typeof parsed.risk !== "string" ||
      !Array.isArray(parsed.keyPoints)
    ) {
      throw new Error(
        "Groq response has an invalid structure"
      );
    }

    // --------------------------------
    // 7. Return Structured Result
    // --------------------------------

    return {
      summary: parsed.summary,

      outlook: parsed.outlook,

      risk: parsed.risk,

      keyPoints: parsed.keyPoints,
    };

  } catch (error) {
    console.error(
      "AI analysis error:",
      error
    );

    // --------------------------------
    // 8. Safe Fallback
    // --------------------------------

    return {
      summary:
        "Unable to generate AI analysis at this time.",

      outlook:
        `Current technical signal: ${data.signal}`,

      risk:
        "AI analysis is unavailable. Do not make trading decisions based solely on this signal.",

      keyPoints:
        data.reasons,
    };
  }
}