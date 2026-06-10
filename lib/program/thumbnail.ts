import { youtubeThumb } from "@/lib/home/media";
import type { Program, ProgramSession } from "@/lib/member";

export function sessionVideoId(session: ProgramSession): string | null {
  const id = session.media[0]?.videoId?.trim() ?? "";
  return id || null;
}

export function sessionThumbnailSrc(session: ProgramSession): string | null {
  const videoId = sessionVideoId(session);
  return videoId ? youtubeThumb(videoId) : null;
}

/** First session with a video preview — used for program listing cards. */
export function programThumbnailSrc(program: Program): string | null {
  for (const session of program.sessions) {
    const src = sessionThumbnailSrc(session);
    if (src) return src;
  }
  return null;
}
