import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { verifyPinWithRateLimit } from "../../../../lib/security/verify-pin";

const PIN_ATTEMPT_COOKIE_NAME = "pin_attempts";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /*
     * --------------------------------------------------
     * AUTHENTICATE USER
     * --------------------------------------------------
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * READ REQUEST BODY
     * --------------------------------------------------
     */

    const body = await request.json();

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const verificationMethod =
      typeof body.verificationMethod === "string"
        ? body.verificationMethod
        : "";

    const pin =
      typeof body.pin === "string"
        ? body.pin.trim()
        : "";

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    /*
     * --------------------------------------------------
     * PASSWORD VALIDATION
     * --------------------------------------------------
     */

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (!verificationMethod) {
      return NextResponse.json(
        {
          error:
            "A verification method is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * PIN VERIFICATION
     * ==================================================
     */

    if (verificationMethod === "pin") {
      if (!/^\d{6}$/.test(pin)) {
        return NextResponse.json(
          {
            error:
              "PIN must contain exactly 6 digits.",
          },
          { status: 400 }
        );
      }

      /*
       * Get the stored PIN hash.
       */

      const {
        data: securityRecord,
        error: securityError,
      } = await supabase
        .from("user_security")
        .select("pin_hash")
        .eq("user_id", user.id)
        .maybeSingle();

      if (securityError) {
        console.error(
          "PIN security lookup failed:",
          securityError
        );

        return NextResponse.json(
          {
            error:
              "Unable to verify PIN. Please try again.",
          },
          { status: 500 }
        );
      }

      if (!securityRecord?.pin_hash) {
        return NextResponse.json(
          {
            error:
              "PIN security is not configured.",
          },
          { status: 400 }
        );
      }

      /*
       * Read the signed attempt-tracking cookie.
       */

      const cookieHeader =
        request.headers.get("cookie") ?? "";

      const attemptCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) =>
          cookie.startsWith(
            `${PIN_ATTEMPT_COOKIE_NAME}=`
          )
        );

      const attemptCookieValue =
        attemptCookie
          ?.split("=")
          .slice(1)
          .join("=") || undefined;

      /*
       * Verify PIN with brute-force protection.
       */

      const pinResult =
        verifyPinWithRateLimit(
          pin,
          securityRecord.pin_hash,
          user.id,
          attemptCookieValue
        );

      /*
       * --------------------------------------------------
       * LOCKED
       * --------------------------------------------------
       */

      if (
        !pinResult.success &&
        pinResult.reason === "locked"
      ) {
        const response = NextResponse.json(
          {
            error:
              "Too many incorrect PIN attempts. Please try again in 10 minutes.",
            lockedUntil:
              pinResult.lockedUntil,
          },
          { status: 429 }
        );

        response.cookies.set(
          PIN_ATTEMPT_COOKIE_NAME,
          pinResult.attemptToken,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 10 * 60,
          }
        );

        return response;
      }

      /*
       * --------------------------------------------------
       * INCORRECT PIN
       * --------------------------------------------------
       */

      if (!pinResult.success) {
        const response = NextResponse.json(
          {
            error: "Incorrect PIN.",
            attemptsRemaining:
              5 - pinResult.attempts,
          },
          { status: 401 }
        );

        response.cookies.set(
          PIN_ATTEMPT_COOKIE_NAME,
          pinResult.attemptToken,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 10 * 60,
          }
        );

        return response;
      }

      /*
       * --------------------------------------------------
       * PIN CORRECT
       * --------------------------------------------------
       */

      const {
        error: passwordError,
      } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        console.error(
          "Password update failed:",
          passwordError
        );

        return NextResponse.json(
          {
            error:
              "Unable to update password. Please try again.",
          },
          { status: 500 }
        );
      }

      /*
       * Clear failed-attempt tracking after success.
       */

      const response = NextResponse.json({
        success: true,
        message: "Password changed successfully.",
      });

      response.cookies.set(
        PIN_ATTEMPT_COOKIE_NAME,
        "",
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        }
      );

      return response;
    }

    /*
     * ==================================================
     * EMAIL OTP VERIFICATION
     * ==================================================
     */

    if (verificationMethod === "otp") {
      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          {
            error:
              "Verification code must contain 6 digits.",
          },
          { status: 400 }
        );
      }

      const {
        data: otpData,
        error: otpError,
      } = await supabase.auth.verifyOtp({
        email: user.email,
        token: otp,
        type: "email",
      });

      if (otpError || !otpData.user) {
        return NextResponse.json(
          {
            error:
              "Invalid or expired verification code.",
          },
          { status: 401 }
        );
      }

      /*
       * Update password after successful OTP.
       */

      const {
        error: passwordError,
      } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        console.error(
          "Password update after OTP failed:",
          passwordError
        );

        return NextResponse.json(
          {
            error:
              "Unable to update password. Please try again.",
          },
          { status: 500 }
        );
      }

      /*
       * Sign out the temporary OTP-authenticated session.
       */

      await supabase.auth.signOut();

      /*
       * Also clear failed PIN attempts.
       */

      const response = NextResponse.json({
        success: true,
        message: "Password changed successfully.",
      });

      response.cookies.set(
        PIN_ATTEMPT_COOKIE_NAME,
        "",
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        }
      );

      return response;
    }

    /*
     * --------------------------------------------------
     * INVALID METHOD
     * --------------------------------------------------
     */

    return NextResponse.json(
      {
        error:
          "Invalid verification method.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Password security API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
