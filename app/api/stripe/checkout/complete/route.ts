import { NextResponse } from "next/server";
import { userHasProgramAccess } from "@/lib/stripe/entitlements";
import { claimPaidCheckoutForBuyer } from "@/lib/stripe/fulfill-checkout";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  programId?: unknown;
  sessionId?: unknown;
};

async function accessForUser(
  programId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: program } = await supabase
    .from("programs")
    .select("id, price")
    .eq("id", programId)
    .maybeSingle();

  const priceValue =
    typeof program?.price === "number" && Number.isFinite(program.price)
      ? program.price
      : null;

  return userHasProgramAccess({
    supabase,
    programId,
    priceValue,
    canManage: false,
    userId,
  });
}

/** Authenticated: grant access from a paid Checkout Session, then report entitlement. */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const programId =
    typeof body.programId === "string" ? body.programId.trim().slice(0, 64) : "";
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";

  if (!programId) {
    return NextResponse.json({ error: "Missing program." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    await claimPaidCheckoutForBuyer({
      userId: user.id,
      programId,
      sessionId: sessionId || undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not unlock program.";
    console.error("[stripe/checkout/complete]", message);
  }

  const hasAccess = await accessForUser(programId, user.id);
  return NextResponse.json({ hasAccess });
}

/** Authenticated: whether the current user may open this program. */
export async function GET(request: Request) {
  const programId = new URL(request.url).searchParams.get("programId")?.trim() ?? "";
  if (!programId) {
    return NextResponse.json({ error: "Missing program." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasAccess: false }, { status: 401 });
  }

  const hasAccess = await accessForUser(programId, user.id);
  return NextResponse.json({ hasAccess });
}
