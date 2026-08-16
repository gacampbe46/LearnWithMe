import { STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/stripe/env";

/** Convert a stored program price (USD dollars) to integer cents. */
export function dollarsToCents(priceDollars: number): number {
  if (!Number.isFinite(priceDollars) || priceDollars < 0) {
    throw new Error("Invalid price.");
  }
  return Math.round(priceDollars * 100);
}

/** Platform application fee in cents for a charge amount. */
export function applicationFeeCents(
  amountCents: number,
  feePercent: number = STRIPE_PLATFORM_FEE_PERCENT,
): number {
  if (!Number.isFinite(amountCents) || amountCents < 0) {
    throw new Error("Invalid amount.");
  }
  if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 100) {
    throw new Error("Invalid fee percent.");
  }
  return Math.round(amountCents * (feePercent / 100));
}

export function isPaidProgramPrice(priceValue: number | null | undefined): boolean {
  return typeof priceValue === "number" && Number.isFinite(priceValue) && priceValue > 0;
}
