import {
  getMemberByUsername,
  mapEmbeddedProgramRow,
  type EmbeddedProgramRow,
  memberProgramById,
  type Program,
} from "@/lib/member";
import { fetchCatalogTagLabelMap } from "@/lib/program/catalog-tag-labels";
import {
  PROGRAM_CHILDREN_EMBED_FIELDS,
  PROGRAM_CHILDREN_EMBED_NO_TAGS,
} from "@/lib/program/program-embed-select";
import { parseProgramTagsColumn } from "@/lib/program/program-tags-json";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { currentUserCanManageProgram } from "@/lib/teach/can-manage-program";

export type LoadedProgramDetail = {
  profileSlug: string;
  profileDisplayName: string;
  program: Program;
  /** Signed-in owner of this program. */
  canManage: boolean;
};

async function fetchOwnedProgramRowForManage(
  expectedUsername: string,
  programId: string,
): Promise<{
  row: EmbeddedProgramRow;
  profileSlug: string;
  profileDisplayName: string;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const teaching = await getTeachingProfile(supabase, user.id);
  if (!teaching) return null;

  /** Embeds `sessions` — RLS on `sessions` must allow owner SELECT (see `run-all-owner-policies.sql`) or nested rows are empty when program is inactive. */
  const primary = await supabase
    .from("programs")
    .select(PROGRAM_CHILDREN_EMBED_FIELDS)
    .eq("id", programId)
    .maybeSingle();

  let programRow = primary.data;
  if (primary.error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[fetchOwnedProgramRowForManage] embed with tags failed, retrying without:",
        primary.error.message ?? primary.error,
      );
    }
    const fallback = await supabase
      .from("programs")
      .select(PROGRAM_CHILDREN_EMBED_NO_TAGS)
      .eq("id", programId)
      .maybeSingle();
    programRow = fallback.data;
  }

  const asRow = programRow as EmbeddedProgramRow | null | undefined;

  if (
    !asRow ||
    typeof asRow !== "object" ||
    typeof asRow.profile_id !== "string" ||
    asRow.profile_id !== teaching.id
  ) {
    return null;
  }

  const { data: prof } = await supabase
    .from("profile")
    .select("username, first_name, last_name")
    .eq("id", teaching.id)
    .maybeSingle();

  if (!prof) {
    return null;
  }

  const rawUsername =
    typeof prof.username === "string" ? prof.username.trim() : "";
  if (
    !rawUsername ||
    rawUsername.toLowerCase() !== expectedUsername
  ) {
    return null;
  }

  const firstName =
    typeof prof.first_name === "string" ? prof.first_name.trim() : "";
  const lastName =
    typeof prof.last_name === "string" ? prof.last_name.trim() : "";
  const profileDisplayName =
    `${firstName} ${lastName}`.trim() || rawUsername;

  return {
    row: asRow,
    profileSlug: rawUsername,
    profileDisplayName,
  };
}

/**
 * Public program page + owner draft view. Inactive programs resolve only for the
 * owner (`canManage`); learners get `null` even with a direct URL.
 */
export async function loadProgramDetail(
  username: string,
  programId: string,
): Promise<LoadedProgramDetail | null> {
  const normalizedUser = username.trim().toLowerCase();
  /**
   * Needs DB SELECT RLS so owners can read inactive rows; otherwise `canManage` is false
   * and the member embed path drops inactive programs → manage URL 404s.
   */
  const canManage = await currentUserCanManageProgram(programId);

  let program: Program | undefined;
  let profileSlug = normalizedUser;
  let profileDisplayName = normalizedUser;

  /** Owners need an authenticated Supabase read so tags and is_active match RLS. */
  if (canManage) {
    const owned = await fetchOwnedProgramRowForManage(
      normalizedUser,
      programId,
    );
    if (owned) {
      const tagIds = parseProgramTagsColumn(owned.row.tags);
      const sb = await createSupabaseServerClient();
      const catalogLabelById = await fetchCatalogTagLabelMap(sb, tagIds);
      program = mapEmbeddedProgramRow(owned.row, catalogLabelById);
      profileSlug = owned.profileSlug;
      profileDisplayName = owned.profileDisplayName;
    }
  }

  if (!program) {
    const member = await getMemberByUsername(normalizedUser);
    if (member) {
      program = memberProgramById(member, programId);
      profileSlug = member.slug;
      profileDisplayName = member.name;
    }
  }

  if (!program) {
    return null;
  }

  /** Inactive (`is_active = false`): hide program page from learners; owners still see it for manage/preview. */
  if (!program.isActive && !canManage) {
    return null;
  }

  return {
    profileSlug,
    profileDisplayName,
    program,
    canManage,
  };
}
