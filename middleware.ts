import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/portfolio",
    "/scanner",
    "/signals",
    "/settings",
  ];

  const isProtectedRoute =
    protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

  if (isProtectedRoute && !user) {
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

  if (
    user &&
    (pathname === "/login" ||
      pathname === "/signup")
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/scanner/:path*",
    "/signals/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};