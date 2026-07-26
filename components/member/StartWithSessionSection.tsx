import { ProfileFeaturedSessionCard } from "@/components/member/ProfileFeaturedSessionCard";
import { SectionHeader } from "@/components/SectionHeader";
import type { FeaturedSessionLink } from "@/lib/member/types";
import { programGridClass } from "@/lib/ui/page-layout";

type Props = {
  sessions: FeaturedSessionLink[];
  creatorName: string;
};

export function StartWithSessionSection({ sessions, creatorName }: Props) {
  if (sessions.length === 0) return null;

  const name = creatorName.trim() || "the creator";

  return (
    <section className="space-y-4" id="featured-sessions">
      <SectionHeader
        title="Featured sessions"
        subtitle={`Recommended by ${name}`}
      />
      <ul className={programGridClass}>
        {sessions.map((session) => (
          <li key={session.sessionId} className="min-w-0">
            <ProfileFeaturedSessionCard session={session} />
          </li>
        ))}
      </ul>
    </section>
  );
}
