import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { syncStripeAccountToProfile } from "@/lib/stripe/connect-db";
import { getStripeWebhookSecret } from "@/lib/stripe/env";
import { fulfillPaidCheckoutSession } from "@/lib/stripe/fulfill-checkout";

export const runtime = "nodejs";

async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  await syncStripeAccountToProfile(account);
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
      case "checkout.session.async_payment_succeeded":
        await fulfillPaidCheckoutSession(
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
