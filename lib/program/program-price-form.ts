/** Shared client rule for enabling submit — mirrors server price parsing. */
export function priceAllowsSubmit(raw: string): boolean {
  const cleaned = raw.trim().replace(/^\$/, "");
  if (cleaned === "") return false;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0;
}

/** Same rules as create/update program server actions — keep in sync with `priceAllowsSubmit`. */
export function parseProgramPriceFromForm(
  raw: string,
): { ok: true; value: number } | { ok: false; message: string } {
  const cleaned = raw.trim().replace(/^\$/, "");
  if (cleaned === "") {
    return { ok: false, message: "Enter a price (use 0 for free)." };
  }
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, message: "Price must be zero or a positive number." };
  }
  return { ok: true, value: n };
}
