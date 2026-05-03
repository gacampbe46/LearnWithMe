/** Same-origin path only; blocks open redirects. */
export function safeNextPath(next: string | undefined | null): string {
  if (next == null || typeof next !== "string") {
    return "/";
  }
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }
  return trimmed;
}
