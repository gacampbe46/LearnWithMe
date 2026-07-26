import { ProgramSessionCard } from "@/components/program/ProgramSessionCard";
import type { FeaturedSessionLink, ProgramSession } from "@/lib/member/types";

type Props = {
  session: FeaturedSessionLink;
};

/** Same card chrome as the program sessions grid. */
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
