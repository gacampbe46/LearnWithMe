/** Usernames that would shadow static app routes or auth paths. */
const RESERVED = new Set([
  "about",
  "analytics",
  "api",
  "auth",
  "conduct",
  "login",
  "onboarding",
  "payouts",
  "programs",
  "signup",
  "teach",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED.has(username.toLowerCase());
}
