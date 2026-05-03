import { NextResponse, type NextRequest } from "next/server";
import { profileNeedsOnboardingForUserId } from "@/lib/auth/profile-onboarding";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { updateSession } from "@/lib/supabase/update-session";

/** Paths reachable before profile setup (sign-in, OAuth, onboarding, its API). */
function isOnboardingGateExempt(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname === "/login") return true;
  if (pathname.startsWith("/onboarding")) return true;
  if (pathname.startsWith("/api/onboarding/")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);

  if (!supabase || !user || isOnboardingGateExempt(request.nextUrl.pathname)) {
    return response;
  }

  const needsOnboarding = await profileNeedsOnboardingForUserId(supabase, user.id);
  if (!needsOnboarding) {
    return response;
  }

  const returnTo = safeNextPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const url = request.nextUrl.clone();
  url.pathname = "/onboarding";
  url.search = `next=${encodeURIComponent(returnTo)}`;

  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((c) => {
    redirect.cookies.set(c.name, c.value);
  });
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
