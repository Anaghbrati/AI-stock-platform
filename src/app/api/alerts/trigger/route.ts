import { NextResponse } from "next/server";
import { runAlertTriggerEngine } from "../../../../lib/services/alert-trigger.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await runAlertTriggerEngine();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("GET /api/alerts/trigger error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Alert engine failed",
      },
      { status: 500 }
    );
  }
}
