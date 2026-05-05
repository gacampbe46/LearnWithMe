import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export type UpdateSessionResult = {
  response: NextResponse;
  supabase: ReturnType<typeof createServerClient> | null;
  user: User | null;
};

/**
 * Refreshes the Supabase session from cookies and returns the current user.
 * Used by the root `proxy` (session + onboarding gate).
 */
export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return {
      response: NextResponse.next({ request }),
      supabase: null,
      user: null,
    };
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}
