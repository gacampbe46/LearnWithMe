import { NextResponse } from "next/server";
import { resolveAppOrigin } from "@/lib/stripe/app-origin";
import { getStripe } from "@/lib/stripe/client";
import {
  loadCreatorStripeStatus,
  syncStripeAccountToProfile,
} from "@/lib/stripe/connect-db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";

/**
 * Authenticated: ensure Express Connect account exists, return Account Link URL.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to set up payouts." }, { status: 401 });
  }

  const teaching = await getTeachingProfile(supabase, user.id);
  if (!teaching) {
    return NextResponse.json(
      { error: "Finish your profile before setting up payouts." },
      { status: 400 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const status = await loadCreatorStripeStatus(supabase, teaching.id);
  let accountId = status.stripeAccountId;

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          profile_id: teaching.id,
          user_id: user.id,
        },
        ...(typeof user.email === "string" && user.email
          ? { email: user.email }
          : {}),
      });
      accountId = account.id;

      const service = createSupabaseServiceClient();
      const { error: saveErr } = await service
        .from("profile")
        .update({
          stripe_account_id: accountId,
          stripe_charges_enabled: account.charges_enabled === true,
          stripe_details_submitted: account.details_submitted === true,
        })
        .eq("id", teaching.id);

      if (saveErr) {
        return NextResponse.json(
          { error: `Could not save Stripe account: ${saveErr.message}` },
          { status: 500 },
        );
      }
    } else {
      const account = await stripe.accounts.retrieve(accountId);
      await syncStripeAccountToProfile(account);
    }

    const origin = resolveAppOrigin(request);
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/teach/payouts?refresh=1`,
      return_url: `${origin}/teach/payouts?return=1`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start Stripe onboarding.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
