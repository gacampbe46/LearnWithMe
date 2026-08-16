/**
 * Create creator/program Gumlet folders and move existing session videos into them.
 *
 * Usage:
 *   npm run organize:gumlet-folders
 *
 * Requires GUMLET_API_KEY, GUMLET_WORKSPACE_ID, and SUPABASE_SERVICE_ROLE_KEY
 * in .env.local. Run the gumlet_folder_id migration first.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { organizeExistingGumletAssets } from "../lib/gumlet/organize-existing-assets";

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const result = await organizeExistingGumletAssets();
  console.log(
    `Programs with videos: ${result.programsConsidered}. Folders updated: ${result.programsUpdated}. Assets moved: ${result.assetsMoved}.`,
  );
  for (const error of result.errors) {
    console.warn(error);
  }
  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
