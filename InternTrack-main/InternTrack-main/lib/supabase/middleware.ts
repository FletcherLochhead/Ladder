import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/types";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/auth",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/api/gmail/callback",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo / preview mode: no Supabase credentials wired up. Let the request
  // through unmodified so public marketing pages still render. Protected
  // routes will redirect via the per-page session checks (which also fall
  // back to the login page when env is missing).
  if (!url || !anon) {
    const isPublic = PUBLIC_PATHS.some(
      (p) => path === p || path.startsWith(p + "/"),
    );
    if (!isPublic) {
      if (isApiPath(path)) return unauthorizedJson();
      const next = request.nextUrl.clone();
      next.pathname = "/login";
      next.searchParams.set("next", path);
      return NextResponse.redirect(next);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    url,
    anon,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(p + "/"),
  );

  if (!user && !isPublic) {
    if (isApiPath(path)) return unauthorizedJson();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

function isApiPath(path: string) {
  return path === "/api" || path.startsWith("/api/");
}

function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
