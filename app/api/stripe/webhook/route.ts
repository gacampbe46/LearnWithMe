import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import {
  grantProgramEntitlement,
  syncStripeAccountToProfile,
} from "@/lib/stripe/connect-db";
import { getStripeWebhookSecret } from "@/lib/stripe/env";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function metaString(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
): string | null {
  if (!metadata || typeof metadata[key] !== "string") return null;
  const v = metadata[key].trim();
  return v || null;
}

async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  await syncStripeAccountToProfile(account);
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.mode !== "payment") return;
  if (session.payment_status !== "paid") return;

  const programId = metaString(session.metadata, "program_id");
  const buyerUserId =
    metaString(session.metadata, "buyer_user_id") ??
    (typeof session.client_reference_id === "string"
      ? session.client_reference_id.trim()
      : null);
  const amountCentsMeta = metaString(session.metadata, "amount_cents");
  const feeCentsMeta = metaString(session.metadata, "application_fee_cents");

  if (!programId || !buyerUserId) {
    throw new Error("Checkout session missing program_id or buyer_user_id metadata.");
  }

  const amountCents =
    typeof session.amount_total === "number" && session.amount_total >= 0
      ? session.amount_total
      : amountCentsMeta
        ? Number.parseInt(amountCentsMeta, 10)
        : NaN;
  const applicationFeeCents = feeCentsMeta
    ? Number.parseInt(feeCentsMeta, 10)
    : NaN;

  if (!Number.isFinite(amountCents) || amountCents < 0) {
    throw new Error("Checkout session missing valid amount.");
  }
  if (!Number.isFinite(applicationFeeCents) || applicationFeeCents < 0) {
    throw new Error("Checkout session missing application fee metadata.");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : isRecord(session.payment_intent) &&
          typeof session.payment_intent.id === "string"
        ? session.payment_intent.id
        : null;

  const currency =
    typeof session.currency === "string" && session.currency.trim()
      ? session.currency.trim().toLowerCase()
      : "usd";

  await grantProgramEntitlement({
    userId: buyerUserId,
    programId,
    checkoutSessionId: session.id,
    paymentIntentId,
    amountCents,
    applicationFeeCents,
    currency,
  });
}

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 503 },
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

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      default:
        break;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed.";
    console.error("[stripe/webhook]", event.type, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
