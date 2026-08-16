import { getAppOriginFromEnv } from "@/lib/stripe/env";

/** Prefer env override, else request origin (local + Vercel). */
export function resolveAppOrigin(request: Request): string {
  const fromEnv = getAppOriginFromEnv();
  if (fromEnv) return fromEnv;
  return new URL(request.url).origin;
}
