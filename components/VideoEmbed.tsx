import type { ReactNode } from "react";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import type { VideoStatus } from "@/lib/gumlet/asset-id";

const PROGRAM_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type VideoEmbedProps = {
  videoId: string;
  title?: string;
  className?: string;
  status?: VideoStatus | null;
  /** Tagged on the embed so Gumlet Insights can filter plays by program. */
  programId?: string | null;
};

function gumletEmbedSrc(assetId: string, programId?: string | null): string {
  const url = new URL(`https://play.gumlet.io/embed/${assetId}`);
  const taggedProgramId = programId?.trim() ?? "";
  if (PROGRAM_ID_RE.test(taggedProgramId)) {
    url.searchParams.set("gm_custom_data_1", taggedProgramId.toLowerCase());
  }
  return url.toString();
}

function PlayerShell({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`aspect-video w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function PlayerMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-600 dark:text-stone-400">
      {children}
    </div>
  );
}

export function VideoEmbed({
  videoId,
  title = "Video player",
  className = "",
  status = null,
  programId = null,
}: VideoEmbedProps) {
  const assetId = parseGumletAssetId(videoId);

  if (!assetId) {
    return (
      <PlayerShell className={className}>
        <PlayerMessage>No video yet.</PlayerMessage>
      </PlayerShell>
    );
  }

  if (status === "errored") {
    return (
      <PlayerShell className={className}>
        <PlayerMessage>
          This video failed to process. Upload a new file to try again.
        </PlayerMessage>
      </PlayerShell>
    );
  }

  return (
    <PlayerShell className={className}>
      <iframe
        className="h-full w-full"
        src={gumletEmbedSrc(assetId, programId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </PlayerShell>
  );
}
