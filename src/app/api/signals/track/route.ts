import { NextResponse } from "next/server";
import { trackRsiRecoverySignals } from "../../../../lib/services/signal.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
try {
const cronSecret = process.env.CRON_SECRET;

if (!cronSecret) {
  console.error("[signals/track] CRON_SECRET is not configured");

  return NextResponse.json(
    {
      success: false,
      error: "Cron secret is not configured",
    },
    { status: 500 }
  );
}

const authorization = request.headers.get("authorization");

if (authorization !== `Bearer ${cronSecret}`) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
    },
    { status: 401 }
  );
}

const result = await trackRsiRecoverySignals();

return NextResponse.json({
  success: true,
  ...result,
});


} catch (error) {
console.error("[signals/track]", error);


return NextResponse.json(
  {
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "Signal tracking failed",
  },
  { status: 500 }
);


}
}
