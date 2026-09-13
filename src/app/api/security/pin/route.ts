import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import {
  createPinSessionToken,
  createPinAttemptToken,
  hashPin,
  validatePinFormat,
  verifyPin,
  verifyPinAttemptToken,
} from "../../../../lib/security/pin";

const PIN_COOKIE_NAME = "pin_session";
const PIN_ATTEMPT_COOKIE_NAME = "pin_attempts";

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 10 * 60; // 10 minutes

export async function POST(request: Request) {
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

    const body = await request.json();

    const pin =
      typeof body.pin === "string"
        ? body.pin.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? body.action
        : "create";

    if (!validatePinFormat(pin)) {
      return NextResponse.json(
        { error: "PIN must contain exactly 6 digits." },
        { status: 400 }
      );
    }

    const {
      data: securityRecord,
      error: fetchError,
    } = await supabase
      .from("user_security")
      .select("pin_hash")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("PIN record lookup failed:", fetchError);

      return NextResponse.json(
        { error: "Unable to access security settings." },
        { status: 500 }
      );
    }

    /*
     * CREATE PIN
     */
    if (action === "create") {
      if (securityRecord?.pin_hash) {
        return NextResponse.json(
          { error: "A PIN already exists." },
          { status: 409 }
        );
      }

      const pinHash = hashPin(pin);

      const { error: insertError } = await supabase
        .from("user_security")
        .insert({
          user_id: user.id,
          pin_hash: pinHash,
          pin_created_at: new Date().toISOString(),
          pin_updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("PIN creation failed:", insertError);

        return NextResponse.json(
          { error: "Unable to create PIN." },
          { status: 500 }
        );
      }

      const sessionToken = createPinSessionToken(user.id);

      const response = NextResponse.json({
        success: true,
        message: "PIN created successfully.",
      });

      response.cookies.set(PIN_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });

      // Clear any previous failed-attempt state.
      response.cookies.set(PIN_ATTEMPT_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    /*
     * VERIFY PIN
     */
    if (action === "verify") {
      if (!securityRecord?.pin_hash) {
        return NextResponse.json(
          { error: "PIN has not been created yet." },
          { status: 404 }
        );
      }

      /*
       * Check whether the user is currently locked out.
       */
      const attemptCookie = request.headers
        .get("cookie")
        ?.split(";")
        .map((item) => item.trim())
        .find((item) =>
          item.startsWith(`${PIN_ATTEMPT_COOKIE_NAME}=`)
        )
        ?.split("=")
        .slice(1)
        .join("=");

      const attemptState = verifyPinAttemptToken(
        attemptCookie,
        user.id
      );

      if (attemptState?.lockedUntil) {
        const remainingSeconds = Math.max(
          1,
          attemptState.lockedUntil -
            Math.floor(Date.now() / 1000)
        );

        const remainingMinutes = Math.ceil(
          remainingSeconds / 60
        );

        return NextResponse.json(
          {
            error: `Too many incorrect attempts. Try again in ${remainingMinutes} minute${
              remainingMinutes === 1 ? "" : "s"
            }.`,
          },
          { status: 429 }
        );
      }

      const valid = verifyPin(
        pin,
        securityRecord.pin_hash
      );

      /*
       * Incorrect PIN
       */
      if (!valid) {
        const currentAttempts =
          attemptState?.attempts ?? 0;

        const nextAttempts = currentAttempts + 1;

        /*
         * Lock the user after 5 failed attempts.
         */
        if (nextAttempts >= MAX_PIN_ATTEMPTS) {
          const lockedUntil =
            Math.floor(Date.now() / 1000) +
            LOCKOUT_SECONDS;

          const lockToken = createPinAttemptToken(
            user.id,
            nextAttempts,
            lockedUntil
          );

          const response = NextResponse.json(
            {
              error:
                "Too many incorrect attempts. PIN verification is locked for 10 minutes.",
            },
            { status: 429 }
          );

          response.cookies.set(
            PIN_ATTEMPT_COOKIE_NAME,
            lockToken,
            {
              httpOnly: true,
              secure:
                process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: LOCKOUT_SECONDS,
            }
          );

          return response;
        }

        /*
         * Store the failed attempt count.
         */
        const attemptToken = createPinAttemptToken(
          user.id,
          nextAttempts,
          0
        );

        const remainingAttempts =
          MAX_PIN_ATTEMPTS - nextAttempts;

        const response = NextResponse.json(
          {
            error: `Incorrect PIN. ${remainingAttempts} attempt${
              remainingAttempts === 1 ? "" : "s"
            } remaining.`,
          },
          { status: 401 }
        );

        response.cookies.set(
          PIN_ATTEMPT_COOKIE_NAME,
          attemptToken,
          {
            httpOnly: true,
            secure:
              process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: LOCKOUT_SECONDS,
          }
        );

        return response;
      }

      /*
       * Correct PIN
       */
      const sessionToken = createPinSessionToken(
        user.id
      );

      const response = NextResponse.json({
        success: true,
        message: "PIN verified successfully.",
      });

      response.cookies.set(
        PIN_COOKIE_NAME,
        sessionToken,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60,
        }
      );

      /*
       * Reset failed attempts after successful login.
       */
      response.cookies.set(
        PIN_ATTEMPT_COOKIE_NAME,
        "",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        }
      );

      return response;
    }

    return NextResponse.json(
      { error: "Invalid security action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("PIN API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}