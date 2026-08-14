import type { SupabaseClient } from "@supabase/supabase-js";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { deleteGumletAsset } from "@/lib/gumlet/client";

/**
 * Delete a Gumlet asset only when no session still points at it.
 * Failures are logged and ignored so replace/delete still succeed.
 */
export async function deleteGumletAssetIfUnused(
  supabase: SupabaseClient,
  assetId: string | null | undefined,
): Promise<void> {
  const parsed = parseGumletAssetId(assetId);
  if (!parsed) return;

  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("content_url", parsed)
    .limit(1)
    .maybeSingle();

  if (error || data) return;

  try {
    await deleteGumletAsset(parsed);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[gumlet] failed to delete unused asset", parsed, err);
    }
  }
}
