/** Usernames that would shadow static app routes or auth paths. */
const RESERVED = new Set([
  "about",
  "auth",
  "conduct",
  "login",
  "onboarding",
  "signup",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED.has(username.toLowerCase());
}
