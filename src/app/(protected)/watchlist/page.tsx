import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

import DashboardShell from "../../../components/dashboard/DashboardShell";
import WatchlistClient from "../../../components/watchlist/Watchlist";

export default async function WatchlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // <DashboardShell>
      <WatchlistClient />
    // </DashboardShell>
  );
}