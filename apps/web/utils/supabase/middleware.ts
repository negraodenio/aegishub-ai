import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh the session if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // Protect internal routes
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isInternalPage = !isAuthPage && (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/rh") ||
    request.nextUrl.pathname.startsWith("/assessment") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/sos")
  );

  if (isInternalPage && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/assessment", request.url));
  }

  return response;
};
