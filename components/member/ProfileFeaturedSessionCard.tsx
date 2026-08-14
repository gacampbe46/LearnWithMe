import { ProgramSessionCard } from "@/components/program/ProgramSessionCard";
import type { FeaturedSessionLink, ProgramSession } from "@/lib/member/types";

type Props = {
  session: FeaturedSessionLink;
};

/** Profile featured tile — same chrome as program session cards. */
export function ProfileFeaturedSessionCard({ session }: Props) {
  const programSession: ProgramSession = {
    id: session.sessionId,
    title: session.title,
    description: session.description,
    media: session.videoId
      ? [
          {
            id: "preview",
            title: session.title,
            videoId: session.videoId,
            videoStatus: "ready",
            thumbnailUrl: session.thumbnailUrl,
            caption: "",
            notes: [],
          },
        ]
      : [],
    storedContentUrl: null,
  };

  return (
    <ProgramSessionCard
      session={programSession}
      href={session.href}
      sessionNumber={session.sessionNumber}
      sessionTotal={session.sessionTotal}
    />
  );
}
