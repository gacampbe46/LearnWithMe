import {
  mapEmbeddedProgramRow,
  type EmbeddedProgramRow,
} from "@/lib/member/load-member-profile";
import type { Program } from "@/lib/member/types";
import { fetchCatalogTagLabelMap } from "@/lib/program/catalog-tag-labels";
import {
  PROGRAM_CHILDREN_EMBED_FIELDS,
  PROGRAM_CHILDREN_EMBED_LEGACY_SESSIONS,
} from "@/lib/program/program-embed-select";
import { parseProgramTagsColumn } from "@/lib/program/program-tags-json";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type PurchasedProgramCard = {
  program: Program;
  href: string;
  creatorName: string;
};

function displayName(row: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}): { name: string; slug: string | null } {
  const first = typeof row.first_name === "string" ? row.first_name.trim() : "";
  const last = typeof row.last_name === "string" ? row.last_name.trim() : "";
  const full = `${first} ${last}`.trim();
  const slug =
    typeof row.username === "string" && row.username.trim()
      ? row.username.trim()
      : null;
  return { name: full || (slug ?? "Creator"), slug };
}

/**
 * Programs the signed-in user has an active entitlement for, newest purchase first.
 * Excludes programs they created (those already appear under Programs).
 */
export async function loadPurchasedProgramsForUser(
  userId: string,
): Promise<PurchasedProgramCard[]> {
  let service;
  try {
    service = createSupabaseServiceClient();
  } catch {
    return [];
  }

  const { data: entitlements, error: entErr } = await service
    .from("program_entitlements")
    .select("program_id, created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (entErr || !entitlements?.length) return [];

  const programIds = [
    ...new Set(
      entitlements
        .map((row) => (typeof row.program_id === "string" ? row.program_id : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (programIds.length === 0) return [];

  const primary = await service
    .from("programs")
    .select(PROGRAM_CHILDREN_EMBED_FIELDS)
    .in("id", programIds);

  let rows = (primary.data ?? []) as unknown as EmbeddedProgramRow[];
  if (primary.error) {
    const legacy = await service
      .from("programs")
      .select(PROGRAM_CHILDREN_EMBED_LEGACY_SESSIONS)
      .in("id", programIds);
    if (legacy.error || !legacy.data?.length) return [];
    rows = legacy.data as unknown as EmbeddedProgramRow[];
  }

  const { data: ownProfile } = await service
    .from("profile")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const ownProfileId =
    ownProfile && typeof ownProfile.id === "string" ? ownProfile.id : null;

  const creatorIds = [
    ...new Set(
      rows
        .map((row) =>
          typeof row.profile_id === "string" ? row.profile_id : null,
        )
        .filter((id): id is string => Boolean(id) && id !== ownProfileId),
    ),
  ];
  if (creatorIds.length === 0) return [];

  const { data: creators } = await service
    .from("profile")
    .select("id, username, first_name, last_name")
    .in("id", creatorIds);

  const creatorById = new Map<
    string,
    { name: string; slug: string }
  >();
  for (const creator of creators ?? []) {
    if (typeof creator.id !== "string") continue;
    const { name, slug } = displayName(creator);
    if (!slug) continue;
    creatorById.set(creator.id, { name, slug });
  }

  const tagIds = rows.flatMap((row) => parseProgramTagsColumn(row.tags));
  const catalogLabelById = await fetchCatalogTagLabelMap(service, tagIds);
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const programById = new Map(
    rows.map((row) => [row.id, mapEmbeddedProgramRow(row, catalogLabelById)]),
  );

  const seen = new Set<string>();
  const purchased: PurchasedProgramCard[] = [];
  for (const entitlement of entitlements) {
    const programId =
      typeof entitlement.program_id === "string" ? entitlement.program_id : "";
    if (!programId || seen.has(programId)) continue;
    const row = rowById.get(programId);
    if (!row || typeof row.profile_id !== "string") continue;
    if (row.profile_id === ownProfileId) continue;
    const creator = creatorById.get(row.profile_id);
    const program = programById.get(programId);
    if (!creator || !program) continue;
    seen.add(programId);
    purchased.push({
      program,
      href: `/${creator.slug}/${program.id}`,
      creatorName: creator.name,
    });
  }

  return purchased;
}
