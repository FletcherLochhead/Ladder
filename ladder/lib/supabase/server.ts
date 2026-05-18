import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/types";

/**
 * Server-side Supabase client. Awaits cookies() because Next.js 16 returns a
 * Promise-shaped cookies API. Use this in Server Components, Route Handlers,
 * and Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Setting cookies fails inside RSC, handled by the auth
            // middleware that refreshes the session before the page renders.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses RLS, only use in trusted server-only code
 * (cron, background jobs, admin tasks).
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}
