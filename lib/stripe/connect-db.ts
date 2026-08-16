import type Stripe from "stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type CreatorStripeStatus = {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
};

export async function loadCreatorStripeStatus(
  profileId: string,
): Promise<CreatorStripeStatus> {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("profile")
    .select("stripe_account_id, stripe_charges_enabled, stripe_details_submitted")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) {
    return {
      stripeAccountId: null,
      chargesEnabled: false,
      detailsSubmitted: false,
    };
  }

  return {
    stripeAccountId:
      typeof data.stripe_account_id === "string" && data.stripe_account_id.trim()
        ? data.stripe_account_id.trim()
        : null,
    chargesEnabled: data.stripe_charges_enabled === true,
    detailsSubmitted: data.stripe_details_submitted === true,
  };
}

export async function syncStripeAccountToProfile(
  account: Stripe.Account,
): Promise<void> {
  const accountId = account.id;
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("profile")
    .update({
      stripe_charges_enabled: account.charges_enabled === true,
      stripe_details_submitted: account.details_submitted === true,
    })
    .eq("stripe_account_id", accountId);

  if (error) {
    throw new Error(`Could not sync Stripe account: ${error.message}`);
  }
}

export async function grantProgramEntitlement(input: {
  userId: string;
  programId: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
  amountCents: number;
  applicationFeeCents: number;
  currency: string;
}): Promise<void> {
  const service = createSupabaseServiceClient();
  const { error } = await service.from("program_entitlements").upsert(
    {
      user_id: input.userId,
      program_id: input.programId,
      stripe_checkout_session_id: input.checkoutSessionId,
      stripe_payment_intent_id: input.paymentIntentId,
      amount_cents: input.amountCents,
      application_fee_cents: input.applicationFeeCents,
      currency: input.currency || "usd",
      status: "active",
    },
    { onConflict: "user_id,program_id" },
  );

  if (error) {
    throw new Error(`Could not grant entitlement: ${error.message}`);
  }
}
