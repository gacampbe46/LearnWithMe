import { NextResponse } from "next/server";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { deleteGumletAssetIfUnused } from "@/lib/gumlet/delete-unused-asset";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentUserCanManageProgram } from "@/lib/teach/can-manage-program";

type Body = { programId?: unknown; assetId?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const programId =
    typeof body.programId === "string" ? body.programId.trim() : "";
  const assetId = parseGumletAssetId(
    typeof body.assetId === "string" ? body.assetId : null,
  );

  if (!programId || !assetId) {
    return NextResponse.json({ error: "Missing video." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to manage videos." }, { status: 401 });
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return NextResponse.json(
      { error: "You can only remove videos from your own programs." },
      { status: 403 },
    );
  }

  await deleteGumletAssetIfUnused(supabase, assetId);
  return NextResponse.json({ ok: true });
}
