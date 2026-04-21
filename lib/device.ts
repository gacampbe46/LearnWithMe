import { headers } from "next/headers";

/**
 * Best-effort mobile detection from request headers (no client JS, no URL changes).
 * Prefer Sec-CH-UA-Mobile when present; fall back to User-Agent patterns.
 */
export async function getIsMobileVisitor(): Promise<boolean> {
  const h = await headers();
  const secChMobile = h.get("sec-ch-ua-mobile");
  if (secChMobile === "?1") return true;
  if (secChMobile === "?0") return false;

  const ua = h.get("user-agent") ?? "";
  return /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
}
