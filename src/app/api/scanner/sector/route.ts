import { NextResponse } from "next/server";

import { getSectorById } from "../../../../config/sectors";
import { scanSector } from "../../../../lib/scanner/sector-scanner.service";
import { generateSectorAIAnalysis } from "../../../../lib/scanner/sector-ai.service";

interface ScanSectorRequest {
  sectorId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScanSectorRequest;

    const sectorId = body.sectorId?.trim();

    if (!sectorId) {
      return NextResponse.json(
        {
          success: false,
          error: "Sector ID is required.",
        },
        { status: 400 }
      );
    }

    const sector = getSectorById(sectorId);

    if (!sector) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown scanner sector: ${sectorId}`,
        },
        { status: 404 }
      );
    }

    console.log(
      `[Scanner API] Starting scan: ${sector.displayName}`
    );

    const scanResult = await scanSector(sectorId);

    console.log(
      `[Scanner API] Quantitative scan complete: ${sector.displayName}`
    );

    const aiResult =
      await generateSectorAIAnalysis(scanResult);

    console.log(
      `[Scanner API] AI analysis complete: ${sector.displayName}`
    );

    return NextResponse.json({
      success: true,
      data: {
        ...scanResult,
        ai: aiResult,
      },
    });
  } catch (error) {
    console.error(
      "[Scanner API] Sector scan failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to scan sector.",
      },
      { status: 500 }
    );
  }
}