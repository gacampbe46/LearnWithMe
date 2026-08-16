import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { grantProgramEntitlement } from "@/lib/stripe/connect-db";
import { applicationFeeCents as computeApplicationFeeCents } from "@/lib/stripe/fees";

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

function isCheckoutSessionId(value: string): boolean {
  return /^cs_(test|live)_[A-Za-z0-9]+$/.test(value);
}

function buyerUserIdFromSession(session: Stripe.Checkout.Session): string | null {
  return (
    metaString(session.metadata, "buyer_user_id") ??
    (typeof session.client_reference_id === "string"
      ? session.client_reference_id.trim()
      : null)
  );
}

function paymentIntentIdFromSession(
  session: Stripe.Checkout.Session,
): string | null {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }
  if (
    isRecord(session.payment_intent) &&
    typeof session.payment_intent.id === "string"
  ) {
    return session.payment_intent.id;
  }
  return null;
}

/**
 * Grant program access for a paid Checkout Session.
 * Idempotent. Returns false when this session should be ignored.
 */
export async function fulfillPaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  if (session.mode !== "payment") return false;
  if (session.payment_status !== "paid") return false;

  const programId = metaString(session.metadata, "program_id");
  const buyerUserId = buyerUserIdFromSession(session);
  if (!programId || !buyerUserId) return false;

  const amountCentsMeta = metaString(session.metadata, "amount_cents");
  const feeCentsMeta = metaString(session.metadata, "application_fee_cents");

  const amountCents =
    typeof session.amount_total === "number" && session.amount_total >= 0
      ? session.amount_total
      : amountCentsMeta
        ? Number.parseInt(amountCentsMeta, 10)
        : NaN;

  if (!Number.isFinite(amountCents) || amountCents < 0) {
    throw new Error("Checkout session missing valid amount.");
  }

  const parsedFee = feeCentsMeta ? Number.parseInt(feeCentsMeta, 10) : NaN;
  const applicationFeeCents = Number.isFinite(parsedFee)
    ? parsedFee
    : computeApplicationFeeCents(amountCents);

  const currency =
    typeof session.currency === "string" && session.currency.trim()
      ? session.currency.trim().toLowerCase()
      : "usd";

  await grantProgramEntitlement({
    userId: buyerUserId,
    programId,
    checkoutSessionId: session.id,
    paymentIntentId: paymentIntentIdFromSession(session),
    amountCents,
    applicationFeeCents,
    currency,
  });

  return true;
}

async function fulfillPaidCheckoutSessionForBuyer(options: {
  sessionId: string;
  userId: string;
  programId: string;
}): Promise<boolean> {
  if (!isCheckoutSessionId(options.sessionId)) return false;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(options.sessionId);

  const programId = metaString(session.metadata, "program_id");
  const buyerUserId = buyerUserIdFromSession(session);
  if (programId !== options.programId) return false;
  if (buyerUserId !== options.userId) return false;

  return fulfillPaidCheckoutSession(session);
}

/** Recover a paid session when the success URL has no session id (webhook miss). */
async function findAndFulfillPaidCheckoutForBuyer(options: {
  userId: string;
  programId: string;
}): Promise<boolean> {
  const stripe = getStripe();
  const createdGte = Math.floor(Date.now() / 1000) - 60 * 60 * 48;
  const listed = await stripe.checkout.sessions.list({
    status: "complete",
    created: { gte: createdGte },
    limit: 100,
  });

  const match = listed.data.find((session) => {
    const programId = metaString(session.metadata, "program_id");
    const buyerUserId = buyerUserIdFromSession(session);
    return (
      programId === options.programId &&
      buyerUserId === options.userId &&
      session.payment_status === "paid"
    );
  });

  if (!match) return false;
  return fulfillPaidCheckoutSession(match);
}

export async function claimPaidCheckoutForBuyer(options: {
  userId: string;
  programId: string;
  sessionId?: string;
}): Promise<boolean> {
  if (options.sessionId) {
    return fulfillPaidCheckoutSessionForBuyer({
      sessionId: options.sessionId,
      userId: options.userId,
      programId: options.programId,
    });
  }
  return findAndFulfillPaidCheckoutForBuyer({
    userId: options.userId,
    programId: options.programId,
  });
}
