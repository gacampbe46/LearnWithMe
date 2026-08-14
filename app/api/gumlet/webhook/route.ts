import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  parseGumletAssetId,
  parseThumbnailUrl,
  type VideoStatus,
} from "@/lib/gumlet/asset-id";
import { getGumletWebhookSecret } from "@/lib/gumlet/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function tokenMatches(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function eventType(payload: Record<string, unknown>): string {
  if (typeof payload.type === "string") return payload.type;
  if (typeof payload.event === "string") return payload.event;
  return "";
}

function assetIdFromPayload(payload: Record<string, unknown>): string | null {
  const direct = parseGumletAssetId(
    typeof payload.asset_id === "string" ? payload.asset_id : null,
  );
  if (direct) return direct;

  const nested = payload.asset;
  if (isRecord(nested) && typeof nested.asset_id === "string") {
    return parseGumletAssetId(nested.asset_id);
  }
  if (isRecord(nested) && typeof nested.id === "string") {
    return parseGumletAssetId(nested.id);
  }

  return parseGumletAssetId(
    typeof payload.id === "string" ? payload.id : null,
  );
}

function thumbnailFromPayload(payload: Record<string, unknown>): string | null {
  if (isRecord(payload.output)) {
    const fromOutput = parseThumbnailUrl(payload.output.thumbnail_url);
    if (fromOutput) return fromOutput;
  }
  return parseThumbnailUrl(payload.thumbnail_url);
}

function statusFromEvent(type: string): VideoStatus | null {
  if (
    type === "video.status.ready" ||
    type === "video.status.stream_ready"
  ) {
    return "ready";
  }
  if (type === "video.status.errored") {
    return "errored";
  }
  return null;
}

export async function POST(request: Request) {
  const secret = getGumletWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  }

  const received = request.headers.get("x-gumlet-token");
  if (!tokenMatches(received, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ ok: true });
  }

  const status = statusFromEvent(eventType(payload));
  if (!status) {
    return NextResponse.json({ ok: true });
  }

  const assetId = assetIdFromPayload(payload);
  if (!assetId) {
    return NextResponse.json({ ok: true });
  }

  const patch: { video_status: VideoStatus; thumbnail_url?: string } = {
    video_status: status,
  };
  const thumbnailUrl = thumbnailFromPayload(payload);
  if (thumbnailUrl) {
    patch.thumbnail_url = thumbnailUrl;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update(patch)
    .eq("content_url", assetId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
