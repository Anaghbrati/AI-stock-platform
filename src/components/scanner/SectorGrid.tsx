"use client";

import type { Sector } from "../../config/sectors";
import type { SectorScanResult } from "../../lib/scanner/scanner.types";
import SectorCard from "./SectorCard";

interface SectorGridProps {
  sectors: Sector[];
  onScanComplete: (
    sectorId: string,
    result: SectorScanResult
  ) => void;
}

export default function SectorGrid({
  sectors,
  onScanComplete,
}: SectorGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sectors.map((sector) => (
        <SectorCard
          key={sector.id}
          sector={sector}
          onScanComplete={onScanComplete}
        />
      ))}
    </div>
  );
}