import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("user_security")
      .select("pin_hash")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("PIN status lookup failed:", error);

      return NextResponse.json(
        { error: "Unable to check PIN status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasPin: Boolean(data?.pin_hash),
    });
  } catch (error) {
    console.error("PIN status error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}