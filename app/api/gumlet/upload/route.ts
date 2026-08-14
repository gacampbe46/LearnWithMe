import { NextResponse } from "next/server";
import { createGumletDirectUpload } from "@/lib/gumlet/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentUserCanManageProgram } from "@/lib/teach/can-manage-program";

type Body = { programId?: unknown; title?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const programId =
    typeof body.programId === "string" ? body.programId.trim() : "";
  if (!programId) {
    return NextResponse.json(
      { error: "Missing program." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to upload a video." }, { status: 401 });
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return NextResponse.json(
      { error: "You can only upload videos for your own programs." },
      { status: 403 },
    );
  }

  const title = typeof body.title === "string" ? body.title : undefined;

  try {
    const { assetId, uploadUrl } = await createGumletDirectUpload({ title });
    return NextResponse.json({ assetId, uploadUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start the video upload.";
    const status = /not configured/i.test(message) ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
