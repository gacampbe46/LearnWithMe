import {
  createGumletFolder,
  getGumletFolder,
  listGumletFolders,
  parseGumletFolderId,
  sanitizeGumletFolderName,
} from "@/lib/gumlet/folders";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

async function persistFolderId(
  table: "profile" | "programs",
  rowId: string,
  folderId: string,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from(table)
    .update({ gumlet_folder_id: folderId })
    .eq("id", rowId);
  if (error) {
    throw new Error(
      `Could not save Gumlet folder id on ${table}: ${error.message}`,
    );
  }
}

async function ensureFolder(options: {
  storedId: string | null | undefined;
  name: string;
  parentId: string | null;
  persist: (folderId: string) => Promise<void>;
}): Promise<string> {
  const storedId = parseGumletFolderId(options.storedId);
  if (storedId) {
    const existing = await getGumletFolder(storedId);
    if (existing) return existing.id;
  }

  const siblings = await listGumletFolders(options.parentId);
  const match = siblings.find((folder) => folder.name === options.name);
  if (match) {
    await options.persist(match.id);
    return match.id;
  }

  const created = await createGumletFolder({
    name: options.name,
    parentId: options.parentId,
  });
  await options.persist(created.id);
  return created.id;
}

export async function ensureProgramGumletFolder(
  programId: string,
): Promise<string> {
  const id = programId.trim();
  if (!id) {
    throw new Error("Missing program.");
  }

  const supabase = createSupabaseServiceClient();
  const { data: program, error: programErr } = await supabase
    .from("programs")
    .select("id, title, gumlet_folder_id, profile_id")
    .eq("id", id)
    .maybeSingle();

  if (programErr) {
    throw new Error(programErr.message);
  }
  if (!program?.id || !program.profile_id) {
    throw new Error("Program not found.");
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("id, username, gumlet_folder_id")
    .eq("id", program.profile_id)
    .maybeSingle();

  if (profileErr) {
    throw new Error(profileErr.message);
  }

  const username =
    typeof profile?.username === "string" ? profile.username.trim() : "";
  if (!profile?.id || !username) {
    throw new Error("Creator profile is missing a username.");
  }

  const creatorFolderId = await ensureFolder({
    storedId: profile.gumlet_folder_id,
    name: sanitizeGumletFolderName(username, username),
    parentId: null,
    persist: (folderId) => persistFolderId("profile", profile.id, folderId),
  });

  const programName = sanitizeGumletFolderName(
    typeof program.title === "string" ? program.title : "",
    program.id.slice(0, 8),
  );

  return ensureFolder({
    storedId: program.gumlet_folder_id,
    name: programName,
    parentId: creatorFolderId,
    persist: (folderId) => persistFolderId("programs", program.id, folderId),
  });
}
