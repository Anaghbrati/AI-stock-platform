import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !user ||
      !user.email
    ) {
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
        "Delete account OTP error:",
        error
      );

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
      message:
        "Verification code sent.",
    });
  } catch (error) {
    console.error(
      "Delete account OTP request error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error.",
      },
      { status: 500 }
    );
  }
}
