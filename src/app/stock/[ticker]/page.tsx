import AIAnalysis from "../../../components/analysis/AIAnalysis";

import TechnicalSignal from "../../../components/analysis/TechnicalSignal";
import StockChartContainer from "../../../components/charts/StockChartContainer";

import { getStockQuote } from "../../../lib/services/stock.service";

interface StockPageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function StockPage({
  params,
}: StockPageProps) {

  const { ticker } = await params;

  const normalizedTicker =
    ticker.toUpperCase();

  // --------------------------------
  // Stock Quote
  // --------------------------------

  const stock =
    await getStockQuote(
      normalizedTicker
    );

  // --------------------------------
  // Technical Analysis
  // --------------------------------

  const analysisResponse =
    await fetch(
      `http://localhost:3000/api/analysis/${normalizedTicker}`,
      {
        cache: "no-store",
      }
    );

  if (!analysisResponse.ok) {

    const errorText =
      await analysisResponse.text();

    console.error(
      "Analysis API failed:",
      errorText
    );

    throw new Error(
      "Failed to fetch technical analysis"
    );
  }

  const analysis =
    await analysisResponse.json();

  // --------------------------------
  // Safety check
  // --------------------------------

  const technical =
    analysis?.technical ?? {
      signal: "NEUTRAL",
      score: 0,
      reasons: [
        "Technical analysis unavailable",
      ],
      rsi: null,
      macd: null,
      macdSignal: null,
    };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-7xl mx-auto">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-8">

          <p className="text-slate-400 text-sm">
            Stock Analysis
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {stock.companyName}
          </h1>

          <p className="text-slate-400 mt-2">
            {stock.ticker}
          </p>

        </div>


        {/* ========================= */}
        {/* STOCK STATS */}
        {/* ========================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Current Price */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-slate-400 text-sm">
              Current Price
            </p>

            <p className="text-3xl font-bold mt-2">

              {stock.currency === "INR"
                ? "₹"
                : "$"}

              {stock.price ?? "N/A"}

            </p>

          </div>


          {/* Volume */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-slate-400 text-sm">
              Volume
            </p>

            <p className="text-2xl font-semibold mt-2">

              {stock.volume?.toLocaleString() ??
                "N/A"}

            </p>

          </div>


          {/* Market Cap */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-slate-400 text-sm">
              Market Cap
            </p>

            <p className="text-2xl font-semibold mt-2">

              {stock.marketCap?.toLocaleString() ??
                "N/A"}

            </p>

          </div>

        </div>


        {/* ========================= */}
        {/* STOCK CHART */}
        {/* ========================= */}

        <div className="mt-8">

          <StockChartContainer
            ticker={normalizedTicker}
          />

        </div>


        {/* ========================= */}
        {/* TECHNICAL SIGNAL */}
        {/* ========================= */}

        <TechnicalSignal
          signal={technical.signal}
          score={technical.score}
          reasons={technical.reasons}
          rsi={technical.rsi}
          macd={technical.macd}
          macdSignal={technical.macdSignal}
        />

        {/* ========================= */}
        {/* AI ANALYSIS */}
        {/* ========================= */}
        
        <AIAnalysis
          summary={analysis.ai.summary}
          outlook={analysis.ai.outlook}
          risk={analysis.ai.risk}
          keyPoints={analysis.ai.keyPoints}
        />


        {/* ========================= */}
        {/* MARKET INFORMATION */}
        {/* ========================= */}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            Market Information
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">

            {/* Ticker */}

            <div>

              <p className="text-slate-400 text-sm">
                Ticker
              </p>

              <p className="font-medium mt-1">
                {stock.ticker}
              </p>

            </div>


            {/* Currency */}

            <div>

              <p className="text-slate-400 text-sm">
                Currency
              </p>

              <p className="font-medium mt-1">
                {stock.currency ?? "N/A"}
              </p>

            </div>


            {/* Change */}

            <div>

              <p className="text-slate-400 text-sm">
                Change
              </p>

              <p className="font-medium mt-1">
                {stock.changePercent ?? 0}%
              </p>

            </div>


            {/* Data Provider */}

            <div>

              <p className="text-slate-400 text-sm">
                Data Provider
              </p>

              <p className="font-medium mt-1">
                Yahoo Finance
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}