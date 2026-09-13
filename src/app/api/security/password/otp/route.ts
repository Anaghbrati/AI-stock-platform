import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { error } =
      await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        },
      });

    if (error) {
      console.error(
        "Password OTP request failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to send verification code. Please try again later.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Verification code sent to your email.",
    });
  } catch (error) {
    console.error(
      "Password OTP API error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}