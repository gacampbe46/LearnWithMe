export function formatUsdFromCents(cents: number, currency = "usd"): string {
  const amount = (Number.isFinite(cents) ? cents : 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${(amount).toFixed(2)}`;
  }
}

export function formatCompactUsdFromCents(
  cents: number,
  currency = "usd",
): string {
  return formatUsdFromCents(cents, currency).replace(/\.00$/, "");
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatWeekdayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}
