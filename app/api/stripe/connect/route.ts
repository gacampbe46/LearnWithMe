import { NextResponse } from "next/server";
import { PAYOUTS_PATH } from "@/lib/app-paths";
import { resolveAppOrigin } from "@/lib/stripe/app-origin";
import { getStripe } from "@/lib/stripe/client";
import {
  loadCreatorStripeStatus,
  syncStripeAccountToProfile,
} from "@/lib/stripe/connect-db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";

type Intent = "onboard" | "update" | "login";

function parseIntent(value: unknown): Intent {
  if (value === "update" || value === "login") return value;
  return "onboard";
}

/**
 * Authenticated: ensure Express Connect account exists, return Account Link
 * or Express Dashboard login URL.
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

  if (!teaching.isInstructor) {
    return NextResponse.json(
      { error: "Payouts are available after you turn on instructor access." },
      { status: 403 },
    );
  }

  let intent: Intent = "onboard";
  try {
    const body = (await request.json()) as { intent?: unknown };
    intent = parseIntent(body.intent);
  } catch {
    intent = "onboard";
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const status = await loadCreatorStripeStatus(teaching.id);
  let accountId = status.stripeAccountId;

  try {
    if (!accountId) {
      if (intent !== "onboard") {
        return NextResponse.json(
          { error: "Connect Stripe before opening your account." },
          { status: 400 },
        );
      }
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

    if (intent === "login") {
      const login = await stripe.accounts.createLoginLink(accountId);
      return NextResponse.json({ url: login.url });
    }

    const origin = resolveAppOrigin(request);
    const payoutsUrl = `${origin}${PAYOUTS_PATH}`;
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${payoutsUrl}?refresh=1`,
      return_url: `${payoutsUrl}?return=1`,
      type: intent === "update" ? "account_update" : "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start Stripe onboarding.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
