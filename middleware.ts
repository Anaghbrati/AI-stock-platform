
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PIN_COOKIE_NAME = "pin_session";

const protectedRoutes = [
  "/dashboard",
  "/markets",
  "/watchlist",
  "/alerts",
  "/scanner",
  "/signals",
  "/portfolio",
  "/settings",
  "/stock",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}

function hexToUint8Array(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(
      hex.slice(i * 2, i * 2 + 2),
      16
    );
  }

  return bytes;
}

/**
 * Verifies the PIN session token inside the Edge runtime.
 *
 * IMPORTANT:
 * This intentionally does NOT import src/lib/security/pin.ts
 * because that file uses Node's crypto module and cannot run
 * inside Next.js Edge Middleware.
 */
async function verifyPinSessionTokenEdge(
  token: string | undefined,
  userId: string
) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [
    tokenUserId,
    expiresAtString,
    signature,
  ] = parts;

  if (tokenUserId !== userId) {
    return false;
  }

  const expiresAt = Number(expiresAtString);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  if (
    Math.floor(Date.now() / 1000) >=
    expiresAt
  ) {
    return false;
  }

  const secret =
    process.env.PIN_SESSION_SECRET;

  if (!secret) {
    console.error(
      "PIN_SESSION_SECRET is not configured."
    );

    return false;
  }

  const signatureBytes =
    hexToUint8Array(signature);

  if (!signatureBytes) {
    return false;
  }

  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const payload =
      `${tokenUserId}.${expiresAt}`;

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload)
    );
  } catch (error) {
    console.error(
      "Edge PIN session verification failed:",
      error
    );

    return false;
  }
}

export async function middleware(
  request: NextRequest
) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase environment variables."
    );

    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "Supabase middleware auth check failed:",
      error
    );
  }

  const pathname =
    request.nextUrl.pathname;

  /*
   * Authenticated users should not return to
   * login/signup.
   */
  if (
    user &&
    isAuthPage(pathname)
  ) {
    return NextResponse.redirect(
      new URL(
        "/dashboard",
        request.url
      )
    );
  }

  /*
   * /pin must remain accessible to authenticated
   * users even when they don't have a valid PIN
   * session yet.
   */
  if (
    pathname === "/pin" ||
    pathname.startsWith("/pin/")
  ) {
    if (!user) {
      const loginUrl = new URL(
        "/login",
        request.url
      );

      loginUrl.searchParams.set(
        "redirect",
        "/pin"
      );

      return NextResponse.redirect(
        loginUrl
      );
    }

    return response;
  }

  /*
   * Public routes don't need authentication.
   */
  if (!isProtectedRoute(pathname)) {
    return response;
  }

  /*
   * Protected routes require a Supabase session.
   */
  if (!user) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  /*
   * Protected routes also require a valid
   * PIN session.
   */
  const pinToken =
    request.cookies.get(
      PIN_COOKIE_NAME
    )?.value;

  const pinVerified =
    await verifyPinSessionTokenEdge(
      pinToken,
      user.id
    );

  if (pinVerified) {
    return response;
  }

  /*
   * Authenticated but PIN not verified.
   */
  return NextResponse.redirect(
    new URL(
      "/pin",
      request.url
    )
  );
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/markets/:path*",
    "/watchlist/:path*",
    "/alerts/:path*",
    "/scanner/:path*",
    "/signals/:path*",
    "/portfolio/:path*",
    "/settings/:path*",
    "/stock/:path*",
    "/pin/:path*",
    "/login",
    "/signup",
  ],
};
