import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "User API error:",
      error
    );

    return NextResponse.json(
      { user: null },
      { status: 500 }
    );
  }
}