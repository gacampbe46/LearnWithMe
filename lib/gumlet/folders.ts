import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";

const GUMLET_FOLDER_ID_RE = /^[a-f0-9]{24}$/i;
const FOLDER_NAME_MAX = 120;

export type GumletFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function gumletErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  const nested = payload.error;
  if (isRecord(nested) && typeof nested.message === "string" && nested.message.trim()) {
    return nested.message.trim();
  }
  const message = payload.message ?? payload.error;
  if (typeof message === "string" && message.trim()) return message.trim();
  return fallback;
}

function requireGumletConfig(): { apiKey: string; workspaceId: string } {
  const apiKey = getGumletApiKey();
  const workspaceId = getGumletWorkspaceId();
  if (!apiKey || !workspaceId) {
    throw new Error(
      "Gumlet is not configured. Set GUMLET_API_KEY and GUMLET_WORKSPACE_ID.",
    );
  }
  return { apiKey, workspaceId };
}

export function parseGumletFolderId(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!GUMLET_FOLDER_ID_RE.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

export function sanitizeGumletFolderName(raw: string, fallback: string): string {
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, FOLDER_NAME_MAX)
    .trim();
  if (cleaned) return cleaned;
  const safeFallback = fallback
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, FOLDER_NAME_MAX)
    .trim();
  return safeFallback || "untitled";
}

function parseFolder(payload: unknown): GumletFolder | null {
  if (!isRecord(payload)) return null;
  const id = parseGumletFolderId(
    typeof payload.id === "string" ? payload.id : null,
  );
  if (!id) return null;
  const name = typeof payload.name === "string" ? payload.name : "";
  const parentId = parseGumletFolderId(
    typeof payload.parent_id === "string" ? payload.parent_id : null,
  );
  return { id, name, parentId };
}

function foldersUrl(workspaceId: string, folderId?: string): string {
  const base = `https://api.gumlet.com/v1/video/workspaces/${workspaceId}/folders`;
  return folderId ? `${base}/${folderId}` : base;
}

async function gumletJson(
  url: string,
  init: RequestInit,
  fallback: string,
): Promise<{ ok: boolean; status: number; payload: unknown }> {
  const response = await fetch(url, init);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok && response.status !== 404) {
    throw new Error(gumletErrorMessage(payload, `${fallback} (${response.status}).`));
  }
  return { ok: response.ok, status: response.status, payload };
}

export async function createGumletFolder(options: {
  name: string;
  parentId?: string | null;
}): Promise<GumletFolder> {
  const { apiKey, workspaceId } = requireGumletConfig();
  const name = sanitizeGumletFolderName(options.name, "");
  if (!name) {
    throw new Error("Gumlet folder name is required.");
  }

  const body: Record<string, unknown> = { name };
  const parentId = parseGumletFolderId(options.parentId);
  if (parentId) body.parent_id = parentId;

  const { ok, payload } = await gumletJson(
    foldersUrl(workspaceId),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "Gumlet create folder failed",
  );

  const folder = parseFolder(payload);
  if (!ok || !folder) {
    throw new Error(gumletErrorMessage(payload, "Gumlet did not return a folder."));
  }
  return folder;
}

export async function getGumletFolder(
  folderId: string,
): Promise<GumletFolder | null> {
  const parsed = parseGumletFolderId(folderId);
  if (!parsed) return null;

  const { apiKey, workspaceId } = requireGumletConfig();
  const { ok, status, payload } = await gumletJson(
    foldersUrl(workspaceId, parsed),
    { headers: { Authorization: `Bearer ${apiKey}` } },
    "Gumlet get folder failed",
  );

  if (status === 404 || !ok) return null;
  return parseFolder(payload);
}

export async function listGumletFolders(
  parentId: string | null,
): Promise<GumletFolder[]> {
  const { apiKey, workspaceId } = requireGumletConfig();
  const url = new URL(foldersUrl(workspaceId));
  const parsedParent = parseGumletFolderId(parentId);
  url.searchParams.set("parent_id", parsedParent ?? "null");

  const { ok, payload } = await gumletJson(
    url.toString(),
    { headers: { Authorization: `Bearer ${apiKey}` } },
    "Gumlet list folders failed",
  );
  if (!ok) return [];

  const rows = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.folders)
      ? payload.folders
      : isRecord(payload) && Array.isArray(payload.data)
        ? payload.data
        : [];

  return rows
    .map((row) => parseFolder(row))
    .filter((folder): folder is GumletFolder => folder !== null);
}

export async function updateGumletFolder(
  folderId: string,
  patch: { name?: string; assetIds?: string[] },
): Promise<void> {
  const parsed = parseGumletFolderId(folderId);
  if (!parsed) {
    throw new Error("Invalid Gumlet folder id.");
  }

  const { apiKey, workspaceId } = requireGumletConfig();
  const body: Record<string, unknown> = {};
  if (typeof patch.name === "string") {
    body.name = sanitizeGumletFolderName(patch.name, patch.name);
  }
  if (patch.assetIds && patch.assetIds.length > 0) {
    body.asset_ids = patch.assetIds;
  }
  if (Object.keys(body).length === 0) return;

  const { ok, payload } = await gumletJson(
    foldersUrl(workspaceId, parsed),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "Gumlet update folder failed",
  );

  if (!ok) {
    throw new Error(gumletErrorMessage(payload, "Gumlet could not update the folder."));
  }
}

export async function renameGumletFolderBestEffort(
  folderId: string | null | undefined,
  name: string,
): Promise<void> {
  const parsed = parseGumletFolderId(folderId);
  if (!parsed) return;

  try {
    await updateGumletFolder(parsed, { name });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[gumlet] failed to rename folder", parsed, err);
    }
  }
}
