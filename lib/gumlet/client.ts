import { parseGumletAssetId, parseThumbnailUrl } from "@/lib/gumlet/asset-id";
import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";

const GUMLET_UPLOAD_URL = "https://api.gumlet.com/v1/video/assets/upload";

export type GumletDirectUpload = {
  assetId: string;
  uploadUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function gumletErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  const message = payload.message ?? payload.error;
  if (typeof message === "string" && message.trim()) return message.trim();
  return fallback;
}

export async function createGumletDirectUpload(options?: {
  title?: string;
}): Promise<GumletDirectUpload> {
  const apiKey = getGumletApiKey();
  const workspaceId = getGumletWorkspaceId();

  if (!apiKey || !workspaceId) {
    throw new Error(
      "Gumlet is not configured. Set GUMLET_API_KEY and GUMLET_WORKSPACE_ID.",
    );
  }

  const body: Record<string, unknown> = {
    workspace_id: workspaceId,
    collection_id: workspaceId,
  };
  const title = options?.title?.trim();
  if (title) body.title = title.slice(0, 280);

  const response = await fetch(GUMLET_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      gumletErrorMessage(
        payload,
        `Gumlet upload URL failed (${response.status}).`,
      ),
    );
  }

  if (!isRecord(payload)) {
    throw new Error("Gumlet returned an unexpected upload response.");
  }

  const assetId = parseGumletAssetId(
    typeof payload.asset_id === "string" ? payload.asset_id : null,
  );
  const uploadUrl =
    typeof payload.upload_url === "string" ? payload.upload_url.trim() : "";

  if (!assetId || !uploadUrl.startsWith("https://")) {
    throw new Error("Gumlet did not return an asset ID and upload URL.");
  }

  return { assetId, uploadUrl };
}

export type GumletAssetPlayback = {
  status: "processing" | "ready" | "errored";
  thumbnailUrl: string | null;
};

export async function fetchGumletAssetPlayback(
  assetId: string,
): Promise<GumletAssetPlayback | null> {
  const apiKey = getGumletApiKey();
  if (!apiKey) return null;

  const response = await fetch(
    `https://api.gumlet.com/v1/video/assets/${assetId}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok || !isRecord(payload)) return null;

  const rawStatus =
    typeof payload.status === "string" ? payload.status.toLowerCase() : "";
  const status: GumletAssetPlayback["status"] =
    rawStatus === "ready" || rawStatus === "stream_ready"
      ? "ready"
      : rawStatus === "errored" || rawStatus === "error"
        ? "errored"
        : "processing";

  const thumbnailUrl = isRecord(payload.output)
    ? parseThumbnailUrl(payload.output.thumbnail_url)
    : parseThumbnailUrl(payload.thumbnail_url);

  return { status, thumbnailUrl };
}

export async function deleteGumletAsset(assetId: string): Promise<boolean> {
  const apiKey = getGumletApiKey();
  const parsed = parseGumletAssetId(assetId);
  if (!apiKey || !parsed) return false;

  const response = await fetch(
    `https://api.gumlet.com/v1/video/assets/${parsed}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  return response.ok || response.status === 404;
}
