import { isReservedUsername } from "@/lib/auth/reserved-usernames";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export type UsernameCheck =
  | { ok: true; normalized: string }
  | { ok: false; message: string };

export function parseAndValidateUsername(raw: string | null): UsernameCheck {
  if (raw == null || typeof raw !== "string") {
    return { ok: false, message: "Choose a username." };
  }
  const normalized = raw.trim().toLowerCase().replace(/^@+/, "");
  if (normalized.length < 3) {
    return { ok: false, message: "Username must be at least 3 characters." };
  }
  if (normalized.length > 30) {
    return { ok: false, message: "Username must be at most 30 characters." };
  }
  if (!USERNAME_RE.test(normalized)) {
    return {
      ok: false,
      message: "Use lowercase letters, numbers, and underscores only.",
    };
  }
  if (isReservedUsername(normalized)) {
    return { ok: false, message: "That username is reserved. Try another." };
  }
  return { ok: true, normalized };
}
