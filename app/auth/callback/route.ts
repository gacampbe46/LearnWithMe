import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { profileNeedsOnboarding } from "@/lib/auth/profile-onboarding";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  let forwardHeaders: Record<string, string> = {};

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
          forwardHeaders = headers;
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    let destination: string;
    if (error) {
      destination = `${origin}/login?error=auth`;
    } else if (await profileNeedsOnboarding(supabase)) {
      destination = `${origin}/onboarding?next=${encodeURIComponent(next)}`;
    } else {
      destination = `${origin}${next}`;
    }
    const response = NextResponse.redirect(destination);
    Object.entries(forwardHeaders).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
