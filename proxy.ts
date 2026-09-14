import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./src/lib/supabase/proxy";
import { verifyPinSessionToken } from "./src/lib/security/pin";

const PIN_COOKIE_NAME = "pin_session";

const protectedPaths = [
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

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) =>
      pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return response;
  }

  const supabase = await getSupabaseFromRequest(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return response;
  }

  /*
   * The PIN page itself must never redirect back to itself.
   */
  if (pathname === "/pin" || pathname.startsWith("/pin/")) {
    return response;
  }

  /*
   * Check whether the account has a PIN.
   */
  const { data: securityRecord, error } = await supabase
    .from("user_security")
    .select("pin_hash")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("PIN security lookup failed:", error);
    return response;
  }

  /*
   * Existing users who haven't created a PIN yet
   * are sent to the PIN setup page.
   */
  if (!securityRecord?.pin_hash) {
    return NextResponse.redirect(
      new URL("/pin", request.url)
    );
  }

  /*
   * Check the short-lived HttpOnly PIN session.
   */
  const pinToken = request.cookies.get(PIN_COOKIE_NAME)?.value;

  const pinVerified = verifyPinSessionToken(
    pinToken,
    user.id
  );

  if (pinVerified) {
    return response;
  }

  return NextResponse.redirect(
    new URL("/pin", request.url)
  );
}

async function getSupabaseFromRequest(request: NextRequest) {
  const { createServerClient } = await import("@supabase/ssr");

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          /*
           * Session refresh is already handled by updateSession().
           * We don't modify cookies here.
           */
        },
      },
    }
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};