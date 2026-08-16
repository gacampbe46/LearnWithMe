/** Platform fee taken on each Connect destination charge (percent of amount). */
export const STRIPE_PLATFORM_FEE_PERCENT = 12.5;

export function getStripeSecretKey(): string | undefined {
  const value = process.env.STRIPE_SECRET_KEY?.trim();
  return value || undefined;
}

export function getStripeWebhookSecret(): string | undefined {
  const value = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return value || undefined;
}

/** Optional absolute origin override for Stripe return/success URLs. */
export function getAppOriginFromEnv(): string | undefined {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) return undefined;
  return value.replace(/\/$/, "");
}
