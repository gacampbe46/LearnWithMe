import { NextResponse } from "next/server";
import { resolveAppOrigin } from "@/lib/stripe/app-origin";
import { getStripe } from "@/lib/stripe/client";
import {
  applicationFeeCents,
  dollarsToCents,
  isPaidProgramPrice,
} from "@/lib/stripe/fees";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type Body = {
  programId?: unknown;
};

/**
 * Authenticated: create a Checkout Session (destination charge + 10% fee).
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const programId =
    typeof body.programId === "string" ? body.programId.trim().slice(0, 64) : "";
  if (!programId) {
    return NextResponse.json({ error: "Missing program." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to purchase this program." },
      { status: 401 },
    );
  }

  const { data: program, error: programErr } = await supabase
    .from("programs")
    .select("id, title, price, is_active, profile_id")
    .eq("id", programId)
    .maybeSingle();

  if (programErr || !program) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  if (program.is_active !== true) {
    return NextResponse.json(
      { error: "This program is not available for purchase." },
      { status: 400 },
    );
  }

  const priceValue =
    typeof program.price === "number" && Number.isFinite(program.price)
      ? program.price
      : null;

  if (!isPaidProgramPrice(priceValue)) {
    return NextResponse.json(
      { error: "This program is free — no checkout needed." },
      { status: 400 },
    );
  }

  const { data: creator, error: creatorErr } = await supabase
    .from("profile")
    .select("id, username, user_id")
    .eq("id", program.profile_id)
    .maybeSingle();

  if (creatorErr || !creator) {
    return NextResponse.json(
      { error: "Creator profile not found." },
      { status: 404 },
    );
  }

  if (creator.user_id === user.id) {
    return NextResponse.json(
      { error: "You already own this program." },
      { status: 400 },
    );
  }

  const { data: existing } = await supabase
    .from("program_entitlements")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_id", programId)
    .eq("status", "active")
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json(
      { error: "You already have access to this program." },
      { status: 400 },
    );
  }

  /** Stripe Connect fields may not be readable to buyers under profile RLS. */
  const service = createSupabaseServiceClient();
  const { data: stripeRow, error: stripeErr } = await service
    .from("profile")
    .select("stripe_account_id, stripe_charges_enabled")
    .eq("id", creator.id)
    .maybeSingle();

  if (stripeErr || !stripeRow) {
    return NextResponse.json(
      { error: "Could not verify creator payouts status." },
      { status: 500 },
    );
  }

  const stripeAccountId =
    typeof stripeRow.stripe_account_id === "string" &&
    stripeRow.stripe_account_id.trim()
      ? stripeRow.stripe_account_id.trim()
      : null;

  if (!stripeAccountId || stripeRow.stripe_charges_enabled !== true) {
    return NextResponse.json(
      { error: "This creator is not ready to accept payments yet." },
      { status: 400 },
    );
  }

  const username =
    typeof creator.username === "string" ? creator.username.trim() : "";
  if (!username) {
    return NextResponse.json(
      { error: "Creator profile is incomplete." },
      { status: 400 },
    );
  }

  let amountCents: number;
  let feeCents: number;
  try {
    amountCents = dollarsToCents(priceValue!);
    feeCents = applicationFeeCents(amountCents);
  } catch {
    return NextResponse.json({ error: "Invalid program price." }, { status: 400 });
  }

  if (amountCents < 50) {
    return NextResponse.json(
      { error: "Program price must be at least $0.50." },
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

  const origin = resolveAppOrigin(request);
  const title =
    typeof program.title === "string" && program.title.trim()
      ? program.title.trim()
      : "Program";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: title,
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeCents,
        transfer_data: {
          destination: stripeAccountId,
        },
        metadata: {
          program_id: programId,
          buyer_user_id: user.id,
          creator_profile_id: creator.id,
        },
      },
      success_url: `${origin}/${username}/${programId}?checkout=success`,
      cancel_url: `${origin}/${username}/${programId}?checkout=cancel`,
      client_reference_id: user.id,
      ...(typeof user.email === "string" && user.email
        ? { customer_email: user.email }
        : {}),
      metadata: {
        program_id: programId,
        buyer_user_id: user.id,
        creator_profile_id: creator.id,
        amount_cents: String(amountCents),
        application_fee_cents: String(feeCents),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session missing redirect URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
