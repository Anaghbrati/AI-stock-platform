import crypto from "crypto";
import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";
import { verifyPinWithRateLimit } from "../../../../lib/security/verify-pin";

const CONFIRMATION_COOKIE = "delete_confirmation";
const PIN_ATTEMPT_COOKIE = "pin_attempts";

const CONFIRMATION_DURATION_SECONDS = 10 * 60;

function generateConfirmationPhrase() {
  const words = [
    "DELETE",
    "ACCOUNT",
    "PERMANENTLY",
    "CONFIRM",
    "REMOVE",
    "PROFILE",
    "FOREVER",
    "ERASE",
  ];

  const selected: string[] = [];

  for (let i = 0; i < 3; i++) {
    const index = crypto.randomInt(0, words.length);
    selected.push(words[index]);
  }

  return selected.join("-");
}

function getConfirmationSecret() {
  const secret = process.env.PIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "PIN_SESSION_SECRET is not configured"
    );
  }

  return secret;
}

function createConfirmationToken(
  userId: string,
  phrase: string
) {
  const expiresAt =
    Math.floor(Date.now() / 1000) +
    CONFIRMATION_DURATION_SECONDS;

  const payload = `${userId}.${expiresAt}.${phrase}`;

  const signature = crypto
    .createHmac(
      "sha256",
      getConfirmationSecret()
    )
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

function verifyConfirmationToken(
  token: string | undefined,
  userId: string
) {
  if (!token) return null;

  const parts = token.split(".");

  if (parts.length !== 4) {
    return null;
  }

  const [
    tokenUserId,
    expiresAtString,
    phrase,
    signature,
  ] = parts;

  if (tokenUserId !== userId) {
    return null;
  }

  const expiresAt = Number(expiresAtString);

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  if (
    Math.floor(Date.now() / 1000) >=
    expiresAt
  ) {
    return null;
  }

  const payload =
    `${tokenUserId}.${expiresAt}.${phrase}`;

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      getConfirmationSecret()
    )
    .update(payload)
    .digest("hex");

  let actual: Buffer;

  try {
    actual = Buffer.from(signature, "hex");
  } catch {
    return null;
  }

  const expected = Buffer.from(
    expectedSignature,
    "hex"
  );

  if (actual.length !== expected.length) {
    return null;
  }

  if (
    !crypto.timingSafeEqual(
      actual,
      expected
    )
  ) {
    return null;
  }

  return {
    phrase,
    expiresAt,
  };
}

/*
 * --------------------------------------------------
 * GET
 *
 * Generate a new confirmation phrase.
 * --------------------------------------------------
 */

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

    const phrase =
      generateConfirmationPhrase();

    const token =
      createConfirmationToken(
        user.id,
        phrase
      );

    const response =
      NextResponse.json({
        success: true,
        phrase,
        expiresIn:
          CONFIRMATION_DURATION_SECONDS,
      });

    response.cookies.set(
      CONFIRMATION_COOKIE,
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          CONFIRMATION_DURATION_SECONDS,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Delete confirmation generation failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start account deletion.",
      },
      { status: 500 }
    );
  }
}

/*
 * --------------------------------------------------
 * POST
 *
 * Verify:
 * 1. Confirmation phrase
 * 2. PIN
 * 3. Email OTP
 *
 * Then permanently delete the account.
 * --------------------------------------------------
 */

export async function POST(
  request: Request
) {
  try {
    const supabase = await createClient();

    /*
     * --------------------------------------------------
     * AUTHENTICATE CURRENT USER
     * --------------------------------------------------
     */

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

    /*
     * --------------------------------------------------
     * READ BODY
     * --------------------------------------------------
     */

    const body = await request.json();

    const confirmationPhrase =
      typeof body.confirmationPhrase ===
      "string"
        ? body.confirmationPhrase.trim()
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
     * CONFIRMATION PHRASE
     * --------------------------------------------------
     */

    const confirmationCookie =
      request.headers
        .get("cookie")
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) =>
          cookie.startsWith(
            `${CONFIRMATION_COOKIE}=`
          )
        );

    const confirmationToken =
      confirmationCookie
        ?.split("=")
        .slice(1)
        .join("=");

    const confirmation =
      verifyConfirmationToken(
        confirmationToken,
        user.id
      );

    if (!confirmation) {
      return NextResponse.json(
        {
          error:
            "The confirmation phrase has expired. Please generate a new one.",
        },
        { status: 400 }
      );
    }

    if (
      confirmationPhrase !==
      confirmation.phrase
    ) {
      return NextResponse.json(
        {
          error:
            "The confirmation phrase does not match.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * PIN VALIDATION
     * --------------------------------------------------
     */

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
     * Get stored PIN hash.
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
        "Delete account PIN lookup failed:",
        securityError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify PIN.",
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
     * --------------------------------------------------
     * PIN ATTEMPT COOKIE
     * --------------------------------------------------
     */

    const attemptCookie =
      request.headers
        .get("cookie")
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) =>
          cookie.startsWith(
            `${PIN_ATTEMPT_COOKIE}=`
          )
        );

    const attemptCookieValue =
      attemptCookie
        ?.split("=")
        .slice(1)
        .join("=");

    /*
     * --------------------------------------------------
     * VERIFY PIN WITH RATE LIMIT
     * --------------------------------------------------
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
     * PIN LOCKED
     * --------------------------------------------------
     */

    if (
      !pinResult.success &&
      pinResult.reason === "locked"
    ) {
      const response =
        NextResponse.json(
          {
            error:
              "Too many incorrect PIN attempts. Please try again in 10 minutes.",
            lockedUntil:
              pinResult.lockedUntil,
          },
          { status: 429 }
        );

      response.cookies.set(
        PIN_ATTEMPT_COOKIE,
        pinResult.attemptToken,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
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
      const response =
        NextResponse.json(
          {
            error: "Incorrect PIN.",
            attemptsRemaining:
              5 - pinResult.attempts,
          },
          { status: 401 }
        );

      response.cookies.set(
        PIN_ATTEMPT_COOKIE,
        pinResult.attemptToken,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          path: "/",
          maxAge: 10 * 60,
        }
      );

      return response;
    }

    /*
     * --------------------------------------------------
     * EMAIL OTP VALIDATION
     * --------------------------------------------------
     */

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          error:
            "Verification code must contain 6 digits.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify the OTP against the authenticated
     * user's email.
     */

    const {
      data: otpData,
      error: otpError,
    } = await supabase.auth.verifyOtp({
      email: user.email,
      token: otp,
      type: "email",
    });

    if (
      otpError ||
      !otpData.user ||
      otpData.user.id !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired verification code.",
        },
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * SERVICE ROLE CLIENT
     * --------------------------------------------------
     */

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing."
      );

      return NextResponse.json(
        {
          error:
            "Account deletion is not configured correctly.",
        },
        { status: 500 }
      );
    }

    const {
      createClient: createAdminClient,
    } = await import(
      "@supabase/supabase-js"
    );

    const adminSupabase =
      createAdminClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

    /*
     * --------------------------------------------------
     * DELETE USER
     * --------------------------------------------------
     */

    const {
      error: deleteError,
    } =
      await adminSupabase.auth.admin.deleteUser(
        user.id
      );

    if (deleteError) {
      console.error(
        "Supabase account deletion failed:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete your account. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * --------------------------------------------------
     * CLEAN UP CURRENT SESSION
     * --------------------------------------------------
     */

    await supabase.auth.signOut();

    const response =
      NextResponse.json({
        success: true,
        message:
          "Your account has been permanently deleted.",
      });

    /*
     * Clear confirmation cookie.
     */

    response.cookies.set(
      CONFIRMATION_COOKIE,
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      }
    );

    /*
     * Clear PIN attempt cookie.
     */

    response.cookies.set(
      PIN_ATTEMPT_COOKIE,
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Delete account API error:",
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
