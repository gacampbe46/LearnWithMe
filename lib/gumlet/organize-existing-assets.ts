import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { ensureProgramGumletFolder } from "@/lib/gumlet/ensure-program-folder";
import { updateGumletFolder } from "@/lib/gumlet/folders";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const MOVE_BATCH_SIZE = 50;

export type OrganizeGumletFoldersResult = {
  programsConsidered: number;
  programsUpdated: number;
  assetsMoved: number;
  errors: string[];
};

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

export async function organizeExistingGumletAssets(): Promise<OrganizeGumletFoldersResult> {
  const supabase = createSupabaseServiceClient();
  const result: OrganizeGumletFoldersResult = {
    programsConsidered: 0,
    programsUpdated: 0,
    assetsMoved: 0,
    errors: [],
  };

  const { data: programs, error: programsErr } = await supabase
    .from("programs")
    .select("id, title");

  if (programsErr) {
    throw new Error(programsErr.message);
  }

  for (const program of programs ?? []) {
    if (typeof program.id !== "string" || !program.id) continue;

    const { data: sessions, error: sessionsErr } = await supabase
      .from("sessions")
      .select("content_url")
      .eq("program_id", program.id);

    if (sessionsErr) {
      result.errors.push(`${program.id}: ${sessionsErr.message}`);
      continue;
    }

    const assetIds = [
      ...new Set(
        (sessions ?? [])
          .map((row) => parseGumletAssetId(row.content_url))
          .filter((assetId): assetId is string => Boolean(assetId)),
      ),
    ];
    if (assetIds.length === 0) continue;

    result.programsConsidered += 1;
    const label =
      typeof program.title === "string" && program.title.trim()
        ? program.title.trim()
        : program.id;

    try {
      const folderId = await ensureProgramGumletFolder(program.id);
      let moved = 0;
      for (const batch of chunk(assetIds, MOVE_BATCH_SIZE)) {
        try {
          await updateGumletFolder(folderId, { assetIds: batch });
          moved += batch.length;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Move failed.";
          result.errors.push(`${label}: ${message}`);
        }
      }
      if (moved > 0) {
        result.programsUpdated += 1;
        result.assetsMoved += moved;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not ensure folder.";
      result.errors.push(`${label}: ${message}`);
    }
  }

  return result;
}
