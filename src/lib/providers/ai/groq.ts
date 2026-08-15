import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AIAnalysisInput {
  ticker: string;
  price: number | null;
  changePercent: number | null;

  signal: string;
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

export async function generateGroqAnalysis(
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
${input.reasons.map((reason) => `- ${reason}`).join("\n")}

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

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
    return JSON.parse(content);
  } catch {
    throw new Error(
      "Groq returned invalid JSON"
    );
  }
}