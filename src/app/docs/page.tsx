
"use client";

import Navbar from "../../components/landing/Navbar";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  LineChart,
  Menu,
  ScanSearch,
  ShieldCheck,
  Signal,
  Sparkles,
  X,
} from "lucide-react";

const sections = [
  {
    title: "Introduction",
    items: [
      { id: "overview", label: "Overview" },
      { id: "how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Platform",
    items: [
      { id: "market-data", label: "Market Data" },
      { id: "stock-intelligence", label: "Stock Intelligence" },
      { id: "technical-analysis", label: "Technical Analysis" },
      { id: "ai-analysis", label: "AI Analysis" },
      { id: "ai-scanner", label: "AI Scanner" },
      { id: "signals", label: "Signals" },
      { id: "watchlists-alerts", label: "Watchlists & Alerts" },
      { id: "portfolio", label: "Portfolio" },
    ],
  },
  {
    title: "Methodology",
    items: [
      { id: "methodology", label: "Our Methodology" },
      { id: "backtesting", label: "Backtesting" },
    ],
  },
  {
    title: "Responsible Use",
    items: [
      { id: "responsible-use", label: "Responsible Use" },
      { id: "regulatory", label: "Regulatory Position" },
      { id: "limitations", label: "Limitations & Risk" },
    ],
  },
];

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function DocsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections
        .flatMap((section) => section.items)
        .map((item) => {
          const element = document.getElementById(item.id);

          if (!element) return null;

          return {
            id: item.id,
            top: Math.abs(element.getBoundingClientRect().top - 150),
          };
        })
        .filter(Boolean) as { id: string; top: number }[];

      if (!offsets.length) return;

      offsets.sort((a, b) => a.top - b.top);

      setActiveSection(offsets[0].id);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMobileOpen(false);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090E] text-white">

    <Navbar />
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[15%] top-[-15%] h-[500px] w-[500px] rounded-full bg-[#ff4d61]/[0.035] blur-[130px]" />
        <div className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] rounded-full bg-purple-500/[0.025] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      



        

      {/* Hero */}
      <section className="border-b border-white/[0.06] px-5 pb-20 pt-36 lg:px-8 lg:pb-24 lg:pt-44">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff4d61]/20 bg-[#ff4d61]/[0.05] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff6577]">
              <BookOpen className="h-3.5 w-3.5" />
              Documentation
            </div>
          </Reveal>

          <Reveal className="delay-75">
            <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Understand the system
              <br />
              <span className="text-slate-500">
                behind the insights.
              </span>
            </h1>
          </Reveal>

          <Reveal className="delay-150">
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Learn how market data, technical analysis, AI reasoning,
              scanning and signals work — and understand exactly what
              the platform does and does not provide.
            </p>
          </Reveal>

          <Reveal className="delay-200">
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => scrollToSection("overview")}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200"
              >
                Start reading
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => scrollToSection("responsible-use")}
                className="inline-flex items-center gap-2 rounded-full border border-[#ff4d61]/25 bg-[#ff4d61]/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#ff4d61]/50 hover:bg-[#ff4d61]/[0.09]"
              >
                <ShieldCheck className="h-4 w-4 text-[#ff4d61]" />
                Responsible use
              </button>
            </div>
          </Reveal>

          {/* Hero stats */}
          <Reveal className="delay-300">
            <div className="mt-16 grid max-w-4xl gap-3 sm:grid-cols-3">
              <MiniStat
                icon={<Database className="h-4 w-4" />}
                label="Market data"
                value="Normalized"
              />
              <MiniStat
                icon={<BrainCircuit className="h-4 w-4" />}
                label="AI reasoning"
                value="Assisted"
              />
              <MiniStat
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Decision"
                value="Always yours"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Documentation body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_180px]">
        {/* Sidebar */}
        <aside className="hidden border-r border-white/[0.06] lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10 pr-6">
            {sections.map((section) => (
              <div key={section.title} className="mb-8">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {section.title}
                </p>

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                          active
                            ? "bg-[#ff4d61]/[0.07] font-medium text-[#ff6577]"
                            : "text-slate-500 hover:bg-white/[0.025] hover:text-slate-200"
                        }`}
                      >
                        <span>{item.label}</span>

                        {active && (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <article className="min-w-0 px-5 py-16 sm:px-8 lg:px-16 lg:py-20">
          {/* Overview */}
          <DocSection id="overview" number="01" title="Overview">
            <p>
              AI Stock Platform is designed as a market intelligence
              workspace that brings market data, technical analysis,
              quantitative signals and AI-assisted interpretation into
              one interface.
            </p>

            <p>
              Instead of presenting isolated numbers, the platform is
              designed to help users understand what the available data
              may be indicating and why certain observations matter.
            </p>

            <InfoGrid
              items={[
                {
                  icon: <BarChart3 />,
                  title: "Market intelligence",
                  text: "Market and stock-level information in one workspace.",
                },
                {
                  icon: <LineChart />,
                  title: "Technical analysis",
                  text: "Indicators and signals help describe market structure.",
                },
                {
                  icon: <BrainCircuit />,
                  title: "AI-assisted insights",
                  text: "AI helps interpret available information and context.",
                },
              ]}
            />
          </DocSection>

          {/* How it works */}
          <DocSection
            id="how-it-works"
            number="02"
            title="How the platform works"
          >
            <p>
              The platform follows a layered workflow. Raw market
              information is collected and normalized before being
              processed by analytical components.
            </p>

            <Pipeline />

            <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-sm leading-7 text-slate-400">
                The final output is intended to provide context and
                analytical information. The platform does not make the
                investment decision for the user.
              </p>
            </div>
          </DocSection>

          {/* Market Data */}
          <DocSection
            id="market-data"
            number="03"
            title="Market Data"
          >
            <p>
              Market data provides the foundation for the platform.
              Prices, volume, market capitalization and other available
              information are normalized before being used by downstream
              services.
            </p>

            <InfoGrid
              items={[
                {
                  icon: <Database />,
                  title: "Normalized data",
                  text: "Provider-specific responses are transformed into consistent application-level structures.",
                },
                {
                  icon: <BarChart3 />,
                  title: "Market context",
                  text: "Indices, sectors and individual securities can be analyzed within a broader market context.",
                },
                {
                  icon: <Sparkles />,
                  title: "AI-ready inputs",
                  text: "Relevant market information can be supplied to the AI analysis layer.",
                },
              ]}
            />
          </DocSection>

          {/* Stock Intelligence */}
          <DocSection
            id="stock-intelligence"
            number="04"
            title="Stock Intelligence"
          >
            <p>
              Stock Intelligence brings multiple dimensions of a
              security into one view rather than focusing only on its
              latest price.
            </p>

            <FeatureList
              items={[
                "Price and performance information",
                "Market capitalization",
                "52-week range",
                "Valuation metrics such as P/E and P/B",
                "Profitability and financial metrics where available",
                "Shareholding and ownership information",
                "Technical indicators and market signals",
              ]}
            />
          </DocSection>

          {/* Technical Analysis */}
          <DocSection
            id="technical-analysis"
            number="05"
            title="Technical Analysis"
          >
            <p>
              Technical analysis describes price and momentum behavior
              using predefined indicators. These indicators are
              analytical tools and should not be interpreted as
              guaranteed future outcomes.
            </p>

            <IndicatorCards />
          </DocSection>

          {/* AI Analysis */}
          <DocSection
            id="ai-analysis"
            number="06"
            title="AI Analysis"
          >
            <p>
              The AI layer is designed to help translate structured
              market information into understandable observations.
            </p>

            <div className="rounded-2xl border border-[#ff4d61]/15 bg-[#ff4d61]/[0.035] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ff4d61]/20 bg-[#ff4d61]/[0.07]">
                  <BrainCircuit className="h-5 w-5 text-[#ff4d61]" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    AI interprets inputs — it does not control the decision.
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    AI-generated insights can summarize trends,
                    identify supporting factors, highlight risks and
                    explain relationships between available metrics.
                    They may be incomplete or incorrect and should be
                    independently evaluated.
                  </p>
                </div>
              </div>
            </div>
          </DocSection>

          {/* AI Scanner */}
          <DocSection
            id="ai-scanner"
            number="07"
            title="AI Scanner"
          >
            <p>
              The AI Scanner is designed to reduce the amount of manual
              searching required to discover potentially interesting
              market situations.
            </p>

            <ScannerPipeline />

            <p className="mt-6 text-sm leading-7 text-slate-500">
              Scanner results represent the output of the platform's
              analytical methodology. They should not be interpreted as
              personalized investment recommendations.
            </p>
          </DocSection>

          {/* Signals */}
          <DocSection
            id="signals"
            number="08"
            title="Signals"
          >
            <p>
              Signals are generated from predefined quantitative
              conditions. They are intended to identify a particular
              market pattern or condition, not to predict the future
              with certainty.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["5D", "Short horizon"],
                ["10D", "Medium horizon"],
                ["20D", "Longer horizon"],
              ].map(([period, label]) => (
                <div
                  key={period}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5"
                >
                  <Signal className="mb-4 h-4 w-4 text-[#ff4d61]" />
                  <p className="text-xl font-bold text-white">
                    {period}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </DocSection>

          {/* Watchlists */}
          <DocSection
            id="watchlists-alerts"
            number="09"
            title="Watchlists & Alerts"
          >
            <p>
              Watchlists allow users to maintain a focused set of
              securities. Alerts can help users notice changes in
              predefined conditions without continuously monitoring the
              market.
            </p>

            <InfoGrid
              items={[
                {
                  icon: <CheckCircle2 />,
                  title: "Watchlists",
                  text: "Keep selected securities organized in one place.",
                },
                {
                  icon: <Bell />,
                  title: "Alerts",
                  text: "Get notified when configured conditions are triggered.",
                },
              ]}
            />
          </DocSection>

          {/* Portfolio */}
          <DocSection
            id="portfolio"
            number="10"
            title="Portfolio"
          >
            <p>
              Portfolio functionality is designed to provide a unified
              view of a user's investments and related market
              information.
            </p>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#ff4d61] shadow-[0_0_12px_rgba(255,77,97,0.7)]" />
                <span className="text-sm font-semibold text-white">
                  Coming soon
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Portfolio intelligence is currently under development.
              </p>
            </div>
          </DocSection>

          {/* Methodology */}
          <DocSection
            id="methodology"
            number="11"
            title="Our Methodology"
          >
            <p>
              The platform combines multiple analytical layers rather
              than relying on a single metric.
            </p>

            <div className="space-y-3">
              {[
                [
                  "01",
                  "Market context",
                  "Understand broader market and sector conditions.",
                ],
                [
                  "02",
                  "Quantitative analysis",
                  "Calculate predefined metrics and technical conditions.",
                ],
                [
                  "03",
                  "Stock-level analysis",
                  "Evaluate individual securities using available information.",
                ],
                [
                  "04",
                  "AI reasoning",
                  "Generate structured explanations from relevant inputs.",
                ],
                [
                  "05",
                  "User interpretation",
                  "The user evaluates the information and makes their own decision.",
                ],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5"
                >
                  <span className="font-mono text-xs text-[#ff4d61]">
                    {number}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DocSection>

          {/* Backtesting */}
          <DocSection
            id="backtesting"
            number="12"
            title="Backtesting"
          >
            <p>
              Historical testing can be used to evaluate how a
              predefined signal behaved against historical market data.
            </p>

            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.025] p-6">
              <div className="flex gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                <div>
                  <h3 className="font-semibold text-white">
                    Historical performance is not future performance.
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Backtests depend on the dataset, methodology,
                    assumptions and historical conditions used. They
                    should not be treated as proof that a signal will
                    perform similarly in the future.
                  </p>
                </div>
              </div>
            </div>
          </DocSection>

          {/* Responsible Use */}
          <DocSection
            id="responsible-use"
            number="13"
            title="Responsible Use"
            highlight
          >
            <div className="rounded-2xl border border-[#ff4d61]/25 bg-gradient-to-br from-[#ff4d61]/[0.08] via-[#ff4d61]/[0.025] to-transparent p-7 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ff4d61]/25 bg-[#ff4d61]/[0.08]">
                <ShieldCheck className="h-5 w-5 text-[#ff6577]" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Information should support your thinking,
                <br className="hidden sm:block" />
                not replace it.
              </h3>

              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  The platform is designed to provide market
                  information, analytical tools, technical indicators,
                  AI-assisted explanations and educational insights.
                </p>

                <p>
                  The information provided by the platform should not be
                  interpreted as personalized investment advice or as a
                  recommendation to buy, sell or hold any security.
                </p>

                <p>
                  Users should conduct their own research, consider
                  their individual circumstances and, where appropriate,
                  consult a qualified financial professional before
                  making investment decisions.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ResponsibleCard
                good
                title="What the platform does"
                items={[
                  "Provides market information",
                  "Calculates analytical indicators",
                  "Explains quantitative observations",
                  "Provides AI-assisted analysis",
                ]}
              />

              <ResponsibleCard
                title="What the platform does not promise"
                items={[
                  "Guaranteed returns",
                  "Guaranteed predictions",
                  "Personalized investment advice",
                  "Risk-free investment decisions",
                ]}
              />
            </div>
          </DocSection>

          {/* Regulatory */}
          <DocSection
            id="regulatory"
            number="14"
            title="Regulatory Position"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#ff4d61]" />
                <span className="text-sm font-semibold text-white">
                  Important information
                </span>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-400">
                <p>
                  AI Stock Platform is intended to function as an
                  information, research and analytical technology
                  platform.
                </p>

                <p>
                  The platform does not represent itself as providing
                  personalized investment advice, portfolio management
                  or trade execution services.
                </p>

                <p>
                  The platform does not instruct users to buy or sell a
                  particular security. Any signals, rankings,
                  classifications or AI-generated observations are
                  analytical outputs based on the methodology and data
                  available to the system.
                </p>

                <p>
                  Regulatory requirements may depend on the nature of
                  the service, the manner in which information is
                  presented, the user's circumstances and applicable
                  Indian securities regulations. The platform's final
                  legal and regulatory position should be determined
                  through appropriate professional legal advice.
                </p>
              </div>
            </div>
          </DocSection>

          {/* Limitations */}
          <DocSection
            id="limitations"
            number="15"
            title="Limitations & Risk"
          >
            <p>
              Financial markets are inherently uncertain. No analytical
              system can eliminate investment risk.
            </p>

            <FeatureList
              items={[
                "Market data may be delayed, unavailable or inaccurate.",
                "Third-party data providers may change or discontinue their services.",
                "Technical indicators are derived from historical price and volume information.",
                "AI-generated analysis can contain factual or reasoning errors.",
                "Backtested results do not guarantee future performance.",
                "Signals can fail and may produce false or misleading indications.",
                "Market conditions can change rapidly.",
                "Users remain responsible for their own investment decisions.",
              ]}
            />
          </DocSection>

          {/* Final CTA */}
          <Reveal>
            <section className="mt-28 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12">
              <div className="absolute" />

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d61]">
                Ready to explore?
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Understand the market.
                <br />
                Make your own decisions.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Explore the platform and see how market data, technical
                analysis and AI-assisted intelligence come together.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/features"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200"
                >
                  Explore features
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/[0.18] hover:text-white"
                >
                  Open dashboard
                </Link>
              </div>
            </section>
          </Reveal>
        </article>

        {/* Right table of contents */}
        <aside className="hidden border-l border-white/[0.06] xl:block">
          <div className="sticky top-20 px-6 py-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              On this page
            </p>

            <div className="mt-4 space-y-2">
              {[
                ["overview", "Overview"],
                ["how-it-works", "How it works"],
                ["ai-analysis", "AI Analysis"],
                ["ai-scanner", "AI Scanner"],
                ["responsible-use", "Responsible Use"],
                ["regulatory", "Regulatory"],
                ["limitations", "Limitations"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`block text-left text-xs transition ${
                    activeSection === id
                      ? "text-[#ff6577]"
                      : "text-slate-600 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              AI Stock Platform
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Market intelligence. Human decisions.
            </p>
          </div>

          <p className="max-w-xl text-xs leading-6 text-slate-600 sm:text-right">
            For informational and educational purposes only. Market
            information and AI-generated analysis may be incomplete or
            inaccurate. This platform does not guarantee investment
            outcomes.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        #overview,
        #how-it-works,
        #market-data,
        #stock-intelligence,
        #technical-analysis,
        #ai-analysis,
        #ai-scanner,
        #signals,
        #watchlists-alerts,
        #portfolio,
        #methodology,
        #backtesting,
        #responsible-use,
        #regulatory,
        #limitations {
          scroll-margin-top: 100px;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                  */
/* -------------------------------------------------------------------------- */

function DocSection({
  id,
  number,
  title,
  children,
  highlight = false,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Reveal>
      <section
        id={id}
        className={`border-b border-white/[0.06] py-16 first:pt-0 sm:py-20 ${
          highlight ? "relative" : ""
        }`}
      >
        <div className="mb-7 flex items-center gap-3">
          <span className="font-mono text-[11px] text-[#ff4d61]">
            {number}
          </span>

          <div className="h-px w-8 bg-white/[0.08]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Documentation
          </span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>

        <div className="mt-7 max-w-3xl space-y-5 text-[15px] leading-8 text-slate-400">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <div className="text-[#ff4d61]">{icon}</div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoGrid({
  items,
}: {
  items: {
    icon: React.ReactNode;
    title: string;
    text: string;
  }[];
}) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#ff4d61]/20 hover:bg-white/[0.03]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#ff4d61]">
            {item.icon}
          </div>

          <h3 className="mt-5 text-sm font-semibold text-white">
            {item.title}
          </h3>

          <p className="mt-2 text-xs leading-6 text-slate-600">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <div className="mt-8 grid gap-2">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4d61]" />

          <span className="text-sm text-slate-400">{item}</span>
        </div>
      ))}
    </div>
  );
}

function Pipeline() {
  const steps = [
    "Market Data",
    "Quantitative Analysis",
    "Stock Analysis",
    "AI Reasoning",
    "User Decision",
  ];

  return (
    <div className="mt-8 overflow-x-auto">
      <div className="flex min-w-[720px] items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs font-semibold text-slate-300">
              {step}
            </div>

            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-slate-700" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScannerPipeline() {
  const steps = [
    ["01", "MARKET"],
    ["02", "SECTORS"],
    ["03", "STOCKS"],
    ["04", "QUANT"],
    ["05", "AI REASONING"],
    ["06", "RANKED"],
  ];

  return (
    <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0B0E14] p-5">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map(([number, label], index) => (
          <div key={label} className="relative">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="font-mono text-[10px] text-[#ff4d61]">
                {number}
              </span>

              <p className="mt-3 text-[10px] font-bold tracking-[0.1em] text-slate-300">
                {label}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div className="absolute right-[-7px] top-1/2 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-white/[0.1] lg:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IndicatorCards() {
  const indicators = [
    ["RSI", "Momentum"],
    ["MACD", "Trend / Momentum"],
    ["EMA", "Trend"],
    ["Volume", "Participation"],
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {indicators.map(([name, type]) => (
        <div
          key={name}
          className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5"
        >
          <LineChart className="h-4 w-4 text-[#ff4d61]" />

          <p className="mt-5 text-lg font-bold text-white">
            {name}
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-600">
            {type}
          </p>
        </div>
      ))}
    </div>
  );
}

function ResponsibleCard({
  title,
  items,
  good = false,
}: {
  title: string;
  items: string[];
  good?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        good
          ? "border-emerald-500/15 bg-emerald-500/[0.025]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-2">
        {good ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <CircleAlert className="h-4 w-4 text-slate-500" />
        )}

        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 text-xs leading-5 text-slate-500"
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
