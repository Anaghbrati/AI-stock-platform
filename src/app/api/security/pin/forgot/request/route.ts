import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("PIN reset OTP error:", error);

      return NextResponse.json(
        {
          error:
            "Unable to send the verification code. Please try again later.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error("PIN reset request error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}