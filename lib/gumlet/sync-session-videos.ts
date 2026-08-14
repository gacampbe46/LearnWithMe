import {
  parseGumletAssetId,
  parseVideoStatus,
} from "@/lib/gumlet/asset-id";
import { fetchGumletAssetPlayback } from "@/lib/gumlet/client";
import { getGumletApiKey } from "@/lib/gumlet/env";
import type { EmbeddedProgramRow } from "@/lib/member/load-member-profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

/**
 * When the Gumlet webhook cannot reach this app (typical on localhost),
 * pull ready/errored status and thumbnails from the API so the player and cards update.
 */
export async function syncEmbeddedProgramVideos(
  row: EmbeddedProgramRow,
): Promise<EmbeddedProgramRow> {
  if (!getGumletApiKey()) return row;
  const sessions = row.sessions;
  if (!sessions?.length) return row;

  const pending = sessions.filter((session) => {
    if (!parseGumletAssetId(session.content_url)) return false;
    const status = parseVideoStatus(session.video_status);
    const hasThumb =
      typeof session.thumbnail_url === "string" &&
      session.thumbnail_url.startsWith("https://");
    return status !== "ready" || !hasThumb;
  });
  if (pending.length === 0) return row;

  let supabase: ReturnType<typeof createSupabaseServiceClient>;
  try {
    supabase = createSupabaseServiceClient();
  } catch {
    return row;
  }

  await Promise.all(
    pending.map(async (session) => {
      const assetId = parseGumletAssetId(session.content_url);
      if (!assetId) return;
      try {
        const details = await fetchGumletAssetPlayback(assetId);
        if (!details) return;
        const patch: { video_status: string; thumbnail_url?: string } = {
          video_status: details.status,
        };
        if (details.thumbnailUrl) patch.thumbnail_url = details.thumbnailUrl;
        await supabase.from("sessions").update(patch).eq("id", session.id);
        session.video_status = details.status;
        if (details.thumbnailUrl) session.thumbnail_url = details.thumbnailUrl;
      } catch {
        // Leave stored status; the session page still embeds by asset ID.
      }
    }),
  );

  return row;
}
