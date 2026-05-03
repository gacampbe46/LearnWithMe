import { NextResponse } from "next/server";
import { parseAndValidateUsername } from "@/lib/onboarding/username";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Body =
  | { status: "invalid"; message: string }
  | { status: "available"; normalized: string }
  | { status: "taken"; normalized: string }
  | { status: "unauthenticated" }
  | { status: "lookup_error"; message: string };

/**
 * GET ?u=rawUsername — format check + profile.username uniqueness (current user may keep their own row).
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("u");
  const parsed = parseAndValidateUsername(raw);
  if (!parsed.ok) {
    return NextResponse.json({
      status: "invalid",
      message: parsed.message,
    } satisfies Body);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { status: "unauthenticated" } satisfies Body,
      { status: 401 },
    );
  }

  const { normalized } = parsed;
  const { data, error } = await supabase
    .from("profile")
    .select("user_id")
    .eq("username", normalized)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { status: "lookup_error", message: error.message } satisfies Body,
      { status: 500 },
    );
  }

  if (data && typeof data.user_id === "string" && data.user_id !== user.id) {
    return NextResponse.json({
      status: "taken",
      normalized,
    } satisfies Body);
  }

  return NextResponse.json({
    status: "available",
    normalized,
  } satisfies Body);
}
