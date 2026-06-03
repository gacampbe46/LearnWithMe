/** Shorter label for session cards (DB titles are often long). */
export function sessionDisplayTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "Session";

  const parts = trimmed.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]} — ${parts[1]}`;
  }

  if (trimmed.length > 48) {
    return `${trimmed.slice(0, 45).trim()}…`;
  }

  return trimmed;
}
