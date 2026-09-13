"use client";

import { useState } from "react";

import type { SectorAIAnalysisResult } from "../../lib/providers/ai";
import type { SectorScanResult } from "../../lib/scanner/scanner.types";

import { SECTORS } from "../../config/sectors";

import ScannerHeader from "../../components/scanner/ScannerHeader";
import FreeTrialBanner from "../../components/scanner/FreeTrialBanner";
import SectorGrid from "../../components/scanner/SectorGrid";
import RadarEvents from "../../components/scanner/RadarEvents";
import InterestingStocks from "../../components/scanner/InterestingStocks";
import SectorIntelligence from "../../components/scanner/SectorIntelligence";

interface ScannerPageResult extends SectorScanResult {
  ai: {
    success: boolean;
    data: SectorAIAnalysisResult | null;
    error: string | null;
  };
}

export default function ScannerPage() {
  const [selectedSectorId, setSelectedSectorId] =
    useState<string | null>(null);

  const [scanResult, setScanResult] =
    useState<ScannerPageResult | null>(null);

  function handleScanComplete(
    sectorId: string,
    result: SectorScanResult
  ) {
    setSelectedSectorId(sectorId);
    setScanResult(result as ScannerPageResult);
  }

  const selectedSector = SECTORS.find(
    (sector) => sector.id === selectedSectorId
  );

  const aiAnalysis = scanResult?.ai?.data ?? null;
  const aiError = scanResult?.ai?.error ?? null;

  return (
    <main className="min-h-screen bg-[#07090E] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <ScannerHeader />

        {/* Free Trial */}
        <FreeTrialBanner />

        {/* Sector Scanner */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Workspace
            </p>

            <div className="mt-2 flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-100">
                Market Radar
              </h2>

              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                Scan individual sectors to discover unusual activity,
                relative movement, momentum, volume changes, and other
                quantitative signals worth investigating.
              </p>
            </div>
          </div>

          <SectorGrid
            sectors={SECTORS}
            onScanComplete={handleScanComplete}
          />
        </section>

        {/* Scan Results */}
        {scanResult && (
          <section className="mt-12 border-t border-white/[0.06] pt-10">
            {/* Result Header */}
            <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Latest Scan
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
                  {selectedSector?.displayName ??
                    scanResult.sectorName}
                </h2>

                <p className="mt-1.5 text-xs text-slate-500">
                  Scanned{" "}
                  {new Date(
                    scanResult.scannedAt
                  ).toLocaleString()}
                </p>
              </div>

              {/* Scan Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="min-w-[82px] rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-center">
                  <p className="text-lg font-semibold text-slate-100">
                    {scanResult.totalStocks}
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Stocks
                  </p>
                </div>

                <div className="min-w-[82px] rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-center">
                  <p className="text-lg font-semibold text-emerald-400">
                    {scanResult.successfulStocks}
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Scanned
                  </p>
                </div>

                <div className="min-w-[82px] rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-center">
                  <p className="text-lg font-semibold text-blue-400">
                    {scanResult.events.totalEvents}
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Events
                  </p>
                </div>
              </div>
            </div>

            {/* Sector Performance */}
            <div className="mb-7 rounded-2xl border border-white/[0.06] bg-[#11151F]/75 p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Sector 20D Performance
                  </p>

                  <p
                    className={`mt-2 text-3xl font-semibold tracking-tight ${
                      scanResult.sectorAverageReturn20D !== null &&
                      scanResult.sectorAverageReturn20D >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {scanResult.sectorAverageReturn20D !== null
                      ? `${
                          scanResult.sectorAverageReturn20D >= 0
                            ? "+"
                            : ""
                        }${scanResult.sectorAverageReturn20D.toFixed(
                          2
                        )}%`
                      : "—"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500">
                    Successful / Failed
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {scanResult.successfulStocks}{" "}
                    <span className="text-slate-600">/</span>{" "}
                    {scanResult.failedStocks}
                  </p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-8">
              <RadarEvents events={scanResult.events} />

              <InterestingStocks
                stocks={scanResult.stocks}
              />

              <SectorIntelligence
                analysis={aiAnalysis}
                error={aiError}
              />
            </div>

            {/* Failed Stocks */}
            {scanResult.failedTickers.length > 0 && (
              <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

                  <h3 className="text-sm font-medium text-slate-300">
                    Stocks not scanned
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Some stocks could not be processed during this
                  scan. Other successful results are still shown.
                </p>

                <div className="mt-4 space-y-2">
                  {scanResult.failedTickers.map(
                    (failedStock) => (
                      <div
                        key={failedStock.ticker}
                        className="flex flex-col gap-1 rounded-xl border border-white/[0.04] bg-[#07090E]/70 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-xs font-medium text-slate-400">
                          {failedStock.ticker.replace(
                            ".NS",
                            ""
                          )}
                        </span>

                        <span className="text-xs text-slate-600">
                          {failedStock.error}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}