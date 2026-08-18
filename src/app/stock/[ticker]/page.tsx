
import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const AIAnalysis = dynamic(
  () => import("../../../components/analysis/AIAnalysis"),
  {
    loading: () => (
      <div className="h-48 animate-pulse rounded-2xl bg-slate-800/40" />
    ),
  }
);

const TechnicalSignal = dynamic(
  () => import("../../../components/analysis/TechnicalSignal"),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-slate-800/40" />
    ),
  }
);
const StockChartContainer = dynamic(
  () => import("../../../components/charts/StockChartContainer"),
  {
    loading: () => (
      <div className="h-[500px] animate-pulse rounded-xl bg-slate-800/40" />
    ),
  }
);

import FundamentalsCard from "../../../components/fundamentals/FundamentalsCard";
import ShareholdingChart from "../../../components/shareholding/ShareholdingChart";

import {
  getStockQuote,
  getStockFundamentals,
  getFinancialStatements,
  getShareholding,
} from "../../../lib/services/stock.service";

/* =========================================================
   TYPES
========================================================= */

type StockQuoteData = Awaited<
  ReturnType<typeof getStockQuote>
>;

type FundamentalsData = Awaited<
  ReturnType<typeof getStockFundamentals>
>;

type FinancialStatementsData = Awaited<
  ReturnType<typeof getFinancialStatements>
>;

type ShareholdingData = Awaited<
  ReturnType<typeof getShareholding>
>;

/*
 * IMPORTANT:
 *
 * The promises can resolve to null because the preload
 * requests have .catch(() => null).
 */

type StockQuotePromise = Promise<
  StockQuoteData | null
>;

type FundamentalsPromise = Promise<
  FundamentalsData | null
>;

type FinancialStatementsPromise = Promise<
  FinancialStatementsData | null
>;

type ShareholdingPromise = Promise<
  ShareholdingData | null
>;

interface StockPageProps {
  params: Promise<{
    ticker: string;
  }>;
}

/* =========================================================
   PAGE
========================================================= */

export default async function StockPage({
  params,
}: StockPageProps) {
  const { ticker } = await params;

  const normalizedTicker = decodeURIComponent(ticker)
    .trim()
    .toUpperCase();

  /*
   * =======================================================
   * PARALLEL DATA PRELOAD
   * =======================================================
   *
   * IMPORTANT:
   *
   * We START all independent requests before awaiting
   * any of them.
   *
   * This prevents:
   *
   * quote -> fundamentals -> financials -> shareholding
   *
   * from becoming sequential.
   *
   * Instead:
   *
   * quote
   * fundamentals
   * financials
   * shareholding
   *
   * all start together.
   */

  const quotePromise: StockQuotePromise =
    getStockQuote(normalizedTicker).catch((error) => {
      console.error(
        `Stock quote preload failed for ${normalizedTicker}:`,
        error
      );

      return null;
    });

  const fundamentalsPromise: FundamentalsPromise =
    getStockFundamentals(normalizedTicker).catch(
      (error) => {
        console.error(
          `Fundamentals preload failed for ${normalizedTicker}:`,
          error
        );

        return null;
      }
    );

  const financialStatementsPromise: FinancialStatementsPromise =
    getFinancialStatements(normalizedTicker).catch(
      (error) => {
        console.error(
          `Financial statements preload failed for ${normalizedTicker}:`,
          error
        );

        return null;
      }
    );

  const shareholdingPromise: ShareholdingPromise =
    getShareholding(normalizedTicker).catch((error) => {
      console.error(
        `Shareholding preload failed for ${normalizedTicker}:`,
        error
      );

      return null;
    });

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to dashboard
          </Link>

          <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-600">
            Market Analysis
          </span>
        </div>

        {/* =================================================
            STOCK OVERVIEW
        ================================================= */}

        <Suspense fallback={<StockHeroSkeleton />}>
          <StockOverview
            ticker={normalizedTicker}
            stockPromise={quotePromise}
          />
        </Suspense>

        {/* =================================================
            PRICE CHART
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">
          <div className="border-b border-white/[0.05] px-6 py-5">
            <p className="text-sm font-bold text-white">
              Price Chart
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Historical price movement
            </p>
          </div>

          <div className="p-3 sm:p-5">
            <StockChartContainer
              ticker={normalizedTicker}
            />
          </div>
        </section>

        {/* =================================================
            FUNDAMENTALS
        ================================================= */}

        <Suspense
          fallback={
            <SectionSkeleton title="Fundamentals" />
          }
        >
          <FundamentalsSection
            ticker={normalizedTicker}
            fundamentalsPromise={fundamentalsPromise}
          />
        </Suspense>

        {/* =================================================
            FINANCIAL STATEMENTS
        ================================================= */}

        <Suspense
          fallback={
            <SectionSkeleton title="Financial Statements" />
          }
        >
          <FinancialStatementsSection
            ticker={normalizedTicker}
            financialStatementsPromise={
              financialStatementsPromise
            }
          />
        </Suspense>

        {/* =================================================
            SHAREHOLDING
        ================================================= */}

        <Suspense
          fallback={
            <SectionSkeleton title="Shareholding Pattern" />
          }
        >
          <ShareholdingSection
            ticker={normalizedTicker}
            shareholdingPromise={shareholdingPromise}
          />
        </Suspense>

        {/* =================================================
            TECHNICAL + AI ANALYSIS
        ================================================= */}

        <Suspense
          fallback={
            <SectionSkeleton title="Stock Analysis" />
          }
        >
          <AnalysisSection
  ticker={normalizedTicker}
  stockPromise={quotePromise}
/>
        </Suspense>

        <div className="h-10" />
      </div>
    </main>
  );
}

/* =========================================================
   STOCK OVERVIEW
========================================================= */

async function StockOverview({
  ticker,
  stockPromise,
}: {
  ticker: string;
  stockPromise: StockQuotePromise;
}) {
  try {
    const stock = await stockPromise;

    if (!stock) {
      return (
        <StockOverviewFallback
          ticker={ticker}
        />
      );
    }

    const change = stock.changePercent ?? null;

    const isPositive =
      change !== null && change > 0;

    const isNegative =
      change !== null && change < 0;

    return (
      <>
        {/* HERO */}

        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101318]">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#ff4d61]/[0.06] blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff4d61]/10 bg-[#ff4d61]/10 text-lg font-black text-[#ff6678]">
                    {getInitials(
                      stock.companyName,
                      ticker
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                      {ticker}
                    </p>

                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                      {stock.companyName ?? ticker}
                    </h1>
                  </div>

                </div>

                {/* PRICE */}

                <div className="mt-7 flex flex-wrap items-end gap-4">

                  <div>
                    <p className="text-xs text-slate-600">
                      Current Price
                    </p>

                    <p className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
                      {stock.currency === "INR"
                        ? "₹"
                        : "$"}

                      {formatPrice(stock.price)}
                    </p>
                  </div>

                  {/* CHANGE */}

                  <div
                    className={`mb-1 rounded-xl px-3 py-2 text-sm font-bold ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isNegative
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/[0.04] text-slate-500"
                    }`}
                  >
                    {change !== null
                      ? `${
                          isPositive ? "+" : ""
                        }${change.toFixed(2)}%`
                      : "N/A"}
                  </div>

                </div>
              </div>

              {/* WATCHLIST */}

              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-[#ff4d61]/20 hover:bg-[#ff4d61]/5 hover:text-[#ff6678]"
              >
                <span className="text-lg">
                  ☆
                </span>

                Add to watchlist
              </button>

            </div>
          </div>
        </section>

        {/* QUICK STATS */}

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <StatCard
              label="Volume"
              value={
                stock.volume != null
                  ? stock.volume.toLocaleString(
                      "en-IN"
                    )
                  : "N/A"
              }
            />

            <StatCard
              label="Market Cap"
              value={
                stock.marketCap != null
                  ? formatLargeNumber(
                      stock.marketCap
                    )
                  : "N/A"
              }
            />

            <StatCard
              label="52W High"
              value={
                stock.fiftyTwoWeekHigh != null
                  ? `${
                      stock.currency === "INR"
                        ? "₹"
                        : "$"
                    }${formatPrice(
                      stock.fiftyTwoWeekHigh
                    )}`
                  : "N/A"
              }
            />

            <StatCard
              label="52W Low"
              value={
                stock.fiftyTwoWeekLow != null
                  ? `${
                      stock.currency === "INR"
                        ? "₹"
                        : "$"
                    }${formatPrice(
                      stock.fiftyTwoWeekLow
                    )}`
                  : "N/A"
              }
            />

          </div>
        </section>

        {/* MARKET INFORMATION */}

        <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-7">

          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Reference
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Market Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

            <InfoItem
              label="Ticker"
              value={stock.ticker}
            />

            <InfoItem
              label="Currency"
              value={stock.currency ?? "N/A"}
            />

            <InfoItem
              label="Change"
              value={
                change !== null
                  ? `${
                      isPositive ? "+" : ""
                    }${change.toFixed(2)}%`
                  : "N/A"
              }
            />

            <InfoItem
              label="Data Provider"
              value="Yahoo Finance"
            />

          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error(
      `Stock overview failed for ${ticker}:`,
      error
    );

    return (
      <StockOverviewFallback
        ticker={ticker}
      />
    );
  }
}

/* =========================================================
   STOCK OVERVIEW FALLBACK
========================================================= */

function StockOverviewFallback({
  ticker,
}: {
  ticker: string;
}) {
  return (
    <>
      <section className="rounded-2xl border border-red-500/10 bg-[#101318] p-6 sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
            {ticker}
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {ticker}
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Stock quote data is currently unavailable.
          </p>

          <p className="mt-2 text-xs text-slate-600">
            The rest of the stock page can continue loading.
          </p>
        </div>
      </section>

      <section className="mt-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl border border-white/[0.06] bg-[#101318]"
              />
            )
          )}
        </div>
      </section>
    </>
  );
}

/* =========================================================
   FUNDAMENTALS
========================================================= */

async function FundamentalsSection({
  ticker,
  fundamentalsPromise,
}: {
  ticker: string;
  fundamentalsPromise: FundamentalsPromise;
}) {
  try {
    const fundamentals =
      await fundamentalsPromise;

    if (!fundamentals) {
      return (
        <SectionError
          title="Fundamentals"
          message="Fundamental data is currently unavailable."
        />
      );
    }

    return (
      <section className="mt-6">
        <FundamentalsCard
          fundamentals={fundamentals}
        />
      </section>
    );
  } catch (error) {
    console.error(
      `Fundamentals failed for ${ticker}:`,
      error
    );

    return (
      <SectionError
        title="Fundamentals"
        message="Fundamental data is currently unavailable."
      />
    );
  }
}

/* =========================================================
   FINANCIAL STATEMENTS
========================================================= */

async function FinancialStatementsSection({
  ticker,
  financialStatementsPromise,
}: {
  ticker: string;
  financialStatementsPromise: FinancialStatementsPromise;
}) {
  try {
    const financialStatements =
      await financialStatementsPromise;

    if (!financialStatements) {
      return (
        <SectionError
          title="Financial Statements"
          message="Financial statement data is currently unavailable."
        />
      );
    }

    return (
      <section className="mt-6">

        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
            Financial Data
          </p>

          <h2 className="mt-1 text-2xl font-black">
            Financial Statements
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Annual and quarterly financial
            performance.
          </p>
        </div>

        {/* ANNUAL */}

        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#101318]">

          <div className="border-b border-white/[0.05] px-6 py-5">
            <h3 className="text-lg font-bold">
              Annual Results
            </h3>
          </div>

          {financialStatements.annual?.length > 0 ? (
            <table className="w-full min-w-[900px] text-sm">

              <thead className="border-b border-white/[0.05]">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-600">

                  <th className="px-6 py-4">
                    Period
                  </th>

                  <th className="px-6 py-4">
                    Revenue
                  </th>

                  <th className="px-6 py-4">
                    Operating Income
                  </th>

                  <th className="px-6 py-4">
                    Net Income
                  </th>

                  <th className="px-6 py-4">
                    EPS
                  </th>

                  <th className="px-6 py-4">
                    Total Assets
                  </th>

                  <th className="px-6 py-4">
                    Total Debt
                  </th>

                </tr>
              </thead>

              <tbody>
                {financialStatements.annual.map(
                  (item, index) => (
                    <tr
                      key={`${item.period}-${index}`}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        {item.period}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.revenue
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.operatingIncome
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.netIncome
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatNumber(item.eps)}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.totalAssets
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.totalDebt
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          ) : (
            <div className="p-6 text-sm text-slate-500">
              Annual financial data is currently
              unavailable.
            </div>
          )}

        </div>

        {/* QUARTERLY */}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#101318]">

          <div className="border-b border-white/[0.05] px-6 py-5">
            <h3 className="text-lg font-bold">
              Quarterly Results
            </h3>
          </div>

          {financialStatements.quarterly?.length > 0 ? (
            <table className="w-full min-w-[900px] text-sm">

              <thead className="border-b border-white/[0.05]">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-600">

                  <th className="px-6 py-4">
                    Period
                  </th>

                  <th className="px-6 py-4">
                    Revenue
                  </th>

                  <th className="px-6 py-4">
                    Operating Income
                  </th>

                  <th className="px-6 py-4">
                    Net Income
                  </th>

                  <th className="px-6 py-4">
                    EPS
                  </th>

                  <th className="px-6 py-4">
                    Operating Cash Flow
                  </th>

                  <th className="px-6 py-4">
                    Free Cash Flow
                  </th>

                </tr>
              </thead>

              <tbody>
                {financialStatements.quarterly.map(
                  (item, index) => (
                    <tr
                      key={`${item.period}-${index}`}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        {item.period}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.revenue
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.operatingIncome
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.netIncome
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatNumber(item.eps)}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.operatingCashFlow
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {formatFinancialValue(
                          item.freeCashFlow
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          ) : (
            <div className="p-6 text-sm text-slate-500">
              Quarterly financial data is currently
              unavailable.
            </div>
          )}

        </div>

      </section>
    );
  } catch (error) {
    console.error(
      `Financial statements failed for ${ticker}:`,
      error
    );

    return (
      <SectionError
        title="Financial Statements"
        message="Financial statement data is currently unavailable."
      />
    );
  }
}

/* =========================================================
   SHAREHOLDING
========================================================= */

async function ShareholdingSection({
  ticker,
  shareholdingPromise,
}: {
  ticker: string;
  shareholdingPromise: ShareholdingPromise;
}) {
  try {
    const shareholding =
      await shareholdingPromise;

    if (!shareholding) {
      return (
        <SectionError
          title="Shareholding Pattern"
          message="Shareholding data is currently unavailable."
        />
      );
    }

    return (
      <section className="mt-6">

        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
            Ownership
          </p>

          <h2 className="mt-1 text-2xl font-black">
            Shareholding Pattern
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Ownership distribution of the company.
          </p>
        </div>

        <ShareholdingChart
          shareholding={shareholding}
        />

      </section>
    );
  } catch (error) {
    console.error(
      `Shareholding failed for ${ticker}:`,
      error
    );

    return (
      <SectionError
        title="Shareholding Pattern"
        message="Shareholding data is currently unavailable."
      />
    );
  }
}

/* =========================================================
   TECHNICAL + AI ANALYSIS
========================================================= */

async function AnalysisSection({
  ticker,
  stockPromise,
}: {
  ticker: string;
  stockPromise: StockQuotePromise;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  try {
    /*
     * =======================================================
     * REUSE EXISTING STOCK QUOTE
     * =======================================================
     *
     * StockPage already started the quote request.
     *
     * We reuse that same promise instead of making
     * another quote request.
     */

    const stock = await stockPromise;

    const price =
      stock?.price ?? null;

    const changePercent =
      stock?.changePercent ?? null;

    /*
     * =======================================================
     * ANALYSIS API URL
     * =======================================================
     */

    const analysisUrl = new URL(
      `/api/analysis/${encodeURIComponent(
        ticker
      )}`,
      baseUrl
    );

    /*
     * =======================================================
     * PASS EXISTING QUOTE DATA
     * =======================================================
     *
     * The analysis API can now use the quote that was
     * already fetched by StockPage.
     *
     * This prevents another quote request.
     */

    if (price !== null) {
      analysisUrl.searchParams.set(
        "price",
        String(price)
      );
    }

    if (changePercent !== null) {
      analysisUrl.searchParams.set(
        "changePercent",
        String(changePercent)
      );
    }

    /*
     * =======================================================
     * CALL ANALYSIS API
     * =======================================================
     */

    const analysisResponse =
      await fetch(
        analysisUrl.toString(),
        {
          cache: "no-store",
        }
      );

    if (!analysisResponse.ok) {
      console.error(
        "Analysis API failed:",
        await analysisResponse.text()
      );

      return <AnalysisFallback />;
    }

    const analysis =
      await analysisResponse.json();

    /*
     * =======================================================
     * TECHNICAL DATA
     * =======================================================
     */

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
        macdHistogram: null,
      };

    /*
     * =======================================================
     * AI DATA
     * =======================================================
     */

    const ai =
      analysis?.ai ?? {
        summary:
          "AI analysis is currently unavailable.",
        outlook: "NEUTRAL",
        risk: "UNKNOWN",
        keyPoints: [],
      };

    /*
     * =======================================================
     * RENDER
     * =======================================================
     */

    return (
      <section className="mt-6">

        <div className="mb-5">

          <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
            Intelligence
          </p>

          <h2 className="mt-1 text-2xl font-black">
            Stock Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Technical indicators and AI-powered
            market interpretation.
          </p>

        </div>

        <div className="space-y-6">

          <TechnicalSignal
            signal={technical.signal}
            score={technical.score}
            reasons={technical.reasons}
            rsi={technical.rsi}
            macd={technical.macd}
            macdSignal={technical.macdSignal}
            macdHistogram={
              technical.macdHistogram
            }
          />

          <AIAnalysis
            summary={ai.summary}
            outlook={ai.outlook}
            risk={ai.risk}
            keyPoints={ai.keyPoints}
          />

        </div>

      </section>
    );
  } catch (error) {
    console.error(
      `Analysis request failed for ${ticker}:`,
      error
    );

    return <AnalysisFallback />;
  }
}

/* =========================================================
   GENERIC ERROR SECTION
========================================================= */

function SectionError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6">

        <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
          {title}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>

      </div>
    </section>
  );
}

/* =========================================================
   ANALYSIS FALLBACK
========================================================= */

function AnalysisFallback() {
  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6">

        <p className="text-sm text-slate-500">
          Technical and AI analysis is
          currently unavailable.
        </p>

      </div>
    </section>
  );
}

/* =========================================================
   SKELETONS
========================================================= */

function StockHeroSkeleton() {
  return (
    <>
      <section className="rounded-2xl border border-white/[0.06] bg-[#101318] p-6 sm:p-8">

        <div className="animate-pulse">

          <div className="flex items-center gap-4">

            <div className="h-14 w-14 rounded-2xl bg-slate-800" />

            <div>
              <div className="h-3 w-20 rounded bg-slate-800" />

              <div className="mt-3 h-8 w-64 rounded bg-slate-800" />
            </div>

          </div>

          <div className="mt-8 h-12 w-48 rounded bg-slate-800" />

        </div>

      </section>

      <section className="mt-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318]"
              />
            )
          )}

        </div>
      </section>
    </>
  );
}

function SectionSkeleton({
  title,
}: {
  title: string;
}) {
  return (
    <section className="mt-6">

      <div className="mb-5">

        <p className="text-xs font-medium uppercase tracking-wider text-[#ff6678]">
          Loading
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {title}
        </h2>

      </div>

      <div className="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-[#101318]" />

    </section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#101318] p-5 transition hover:border-white/[0.1]">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 truncate text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-300">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   PRICE FORMATTER
========================================================= */

function formatPrice(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

/* =========================================================
   LARGE NUMBER FORMATTER
========================================================= */

function formatLargeNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  if (value >= 1_00_00_000) {
    return `${(
      value / 1_00_00_000
    ).toFixed(2)} Cr`;
  }

  if (value >= 1_00_000) {
    return `${(
      value / 1_00_000
    ).toFixed(2)} L`;
  }

  return value.toLocaleString("en-IN");
}

/* =========================================================
   FINANCIAL VALUE FORMATTER
========================================================= */

function formatFinancialValue(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return formatLargeNumber(value);
}

/* =========================================================
   NUMBER FORMATTER
========================================================= */

function formatNumber(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return value.toFixed(2);
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  companyName?: string,
  ticker?: string
) {
  if (!companyName) {
    return ticker?.slice(0, 2) ?? "ST";
  }

  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}