import { NextResponse } from "next/server";

import {
  scanSector,
} from "../../../lib/scanner/sector-scanner.service";

import {
  generateSectorAIAnalysis,
} from "../../../lib/scanner/sector-ai.service";

/* =========================================================
   REQUEST
   ========================================================= */

interface ScanSectorRequest {
  sectorId?: unknown;
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request: Request
) {
  try {
    const body: ScanSectorRequest =
      await request.json();

    if (
      typeof body.sectorId !== "string" ||
      body.sectorId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "sectorId is required.",
        },
        {
          status: 400,
        }
      );
    }

    const sectorId =
      body.sectorId
        .trim()
        .toLowerCase();

    /* -------------------------------------------------------
       1. RUN QUANTITATIVE RADAR
       ------------------------------------------------------- */

    const scanResult =
      await scanSector(
        sectorId
      );

    /* -------------------------------------------------------
       2. RUN ONE SECTOR-LEVEL AI ANALYSIS
       ------------------------------------------------------- */

    const aiResult =
      await generateSectorAIAnalysis(
        scanResult
      );

    /* -------------------------------------------------------
       3. RETURN BOTH RESULTS
       ------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        data: {
          ...scanResult,

          ai: {
            success:
              aiResult.success,

            data:
              aiResult.data,

            error:
              aiResult.error,
          },
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[Scanner] Sector scan failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Sector scan failed.",
      },
      {
        status: 500,
      }
    );
  }
}