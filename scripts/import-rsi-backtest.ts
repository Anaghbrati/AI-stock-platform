
import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

interface BacktestResult {
  horizonDays: 5 | 10 | 20;
  instanceCount: number;
  followThroughCount: number;
  pctFollowedThrough: number | null;
  averageReturn: number | null;
}

interface BacktestOutput {
  signalType: "RSI_RECOVERY";
  universe: string[];
  generatedAt: string;
  results: BacktestResult[];
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

async function main(): Promise<void> {
  const supabaseUrl = getRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_URL"
  );

  const serviceRoleKey = getRequiredEnv(
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  );

  const filePath = path.join(
    process.cwd(),
    "data",
    "backtest",
    "rsi-recovery-backtest.json"
  );

  const raw = await fs.readFile(
    filePath,
    "utf-8"
  );

  const data = JSON.parse(
    raw
  ) as BacktestOutput;

  if (data.signalType !== "RSI_RECOVERY") {
    throw new Error(
      `Unexpected signal type: ${data.signalType}`
    );
  }

  const universeDescription =
    `${data.universe.length} active Indian stocks`;

  /*
   * Remove previous RSI_RECOVERY backtest rows so this
   * import remains idempotent.
   */
  const { error: deleteError } = await supabase
    .from("backtest_results")
    .delete()
    .eq("signal_type", "RSI_RECOVERY");

  if (deleteError) {
    throw new Error(
      `Failed to clear existing results: ${deleteError.message}`
    );
  }

  const rows = data.results.map((result) => ({
    signal_type: "RSI_RECOVERY",
    horizon_days: result.horizonDays,
    instance_count: result.instanceCount,
    pct_followed_through:
      result.pctFollowedThrough,
    avg_pct_change:
      result.averageReturn,
    universe_description:
      universeDescription,
    computed_at:
      data.generatedAt,
  }));

  const { error: insertError } = await supabase
    .from("backtest_results")
    .insert(rows);

  if (insertError) {
    throw new Error(
      `Failed to insert backtest results: ${insertError.message}`
    );
  }

  console.log(
    "\nRSI backtest results imported successfully."
  );

  for (const row of rows) {
    console.log(
      `${row.horizon_days}D | ` +
      `${row.instance_count} instances | ` +
      `${row.pct_followed_through ?? "N/A"}% follow-through | ` +
      `${row.avg_pct_change ?? "N/A"}% average return`
    );
  }
}

main().catch((error) => {
  console.error(
    "\nImport failed:"
  );

  console.error(error);

  process.exit(1);
});
