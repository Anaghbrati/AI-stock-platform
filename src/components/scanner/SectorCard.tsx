"use client";

import { useState } from "react";

import type { Sector } from "../../config/sectors";
import type { SectorScanResult } from "../../lib/scanner/scanner.types";

import ScanButton from "./ScanButton";
import ScanProgress from "./ScanProgress";

interface SectorCardProps {
  sector: Sector;

  onScanComplete: (
    sectorId: string,
    result: SectorScanResult
  ) => void;
}

export default function SectorCard({
  sector,
  onScanComplete,
}: SectorCardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
  if (isScanning) return;

  setIsScanning(true);
  setError(null);

  try {
    const response = await fetch("/api/scanner/sector", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sectorId: sector.id,
      }),
    });

    const responseText = await response.text();

    let payload: {
      success?: boolean;
      data?: SectorScanResult;
      error?: string;
    } = {};

    if (responseText.trim()) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Scanner returned an invalid response (${response.status}).`
        );
      }
    }

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(
        payload.error ||
          `Unable to scan this sector (${response.status}).`
      );
    }

    onScanComplete(sector.id, payload.data);
  } catch (scanError) {
    setError(
      scanError instanceof Error
        ? scanError.message
        : "Unable to scan this sector."
    );
  } finally {
    setIsScanning(false);
  }
}

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#11151F]/75 p-5 transition-all duration-200 hover:border-red-500/20 hover:bg-[#121722]">
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-red-500/[0.035] blur-3xl transition-opacity duration-300 group-hover:bg-red-500/[0.07]" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 transition-colors duration-200 group-hover:bg-red-400 group-hover:shadow-[0_0_7px_rgba(248,113,113,0.55)]" />

              <h3 className="text-lg font-semibold tracking-tight text-slate-100">
                {sector.displayName}
              </h3>
            </div>

            <p className="mt-1.5 text-[11px] text-slate-600">
              {sector.stockUniverse.length} stocks in universe
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {sector.category}
          </span>
        </div>

        {/* Description */}
        <p className="min-h-10 text-sm leading-5 text-slate-500">
          {sector.description}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/[0.05] px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 shadow-[0_0_7px_rgba(248,113,113,0.55)]" />

              <p className="text-xs leading-5 text-red-400/90">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Scan Button */}
        <ScanButton
          isScanning={isScanning}
          sectorName={sector.displayName}
          onClick={handleScan}
        />

        {/* Scan Progress */}
        {isScanning && (
          <ScanProgress sectorName={sector.displayName} />
        )}
      </div>
    </div>
  );
}