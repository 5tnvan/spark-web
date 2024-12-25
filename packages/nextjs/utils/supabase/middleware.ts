import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
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
        setAll(cookies) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          try {
            cookies.forEach(cookie => {
              request.cookies.set(cookie.name, cookie.value);
              response.cookies.set(cookie.name, cookie.value, cookie.options);
            });
          } catch (error) {
            console.log("middleware error", error)
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}