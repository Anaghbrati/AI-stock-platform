import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { hashPin, validatePinFormat } from "../../../../../../lib/security/pin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const newPin =
      typeof body.newPin === "string"
        ? body.newPin.trim()
        : "";

    if (!email || !token || !newPin) {
      return NextResponse.json(
        { error: "Email, verification code and new PIN are required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: "Verification code must contain 6 digits." },
        { status: 400 }
      );
    }

    if (!validatePinFormat(newPin)) {
      return NextResponse.json(
        { error: "PIN must contain exactly 6 digits." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    /*
     * Verify the email OTP.
     *
     * This creates a temporary authenticated
     * Supabase session for the verified email.
     */
    const { data, error: verifyError } =
      await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

    if (verifyError || !data.user) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 401 }
      );
    }

    const userId = data.user.id;

    const pinHash = hashPin(newPin);

    const { error: updateError } = await supabase
      .from("user_security")
      .upsert({
        user_id: userId,
        pin_hash: pinHash,
        pin_updated_at: new Date().toISOString(),
        pin_created_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error("PIN reset database error:", updateError);

      return NextResponse.json(
        { error: "Unable to update your PIN." },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    /*
     * Remove any existing PIN session.
     */
    const response = NextResponse.json({
      success: true,
      message: "PIN changed successfully.",
    });

    response.cookies.set("pin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("PIN reset verification error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}