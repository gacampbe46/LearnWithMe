import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ProgramHiddenBadge } from "@/components/program/ProgramHiddenBadge";
import { ReadonlyTopicChips } from "@/components/program/ReadonlyTopicChips";
import { ShareProgramButton } from "@/components/program/share-program-button";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { Program } from "@/lib/member";
import {
  bodyEmphasisClass,
  bodyMutedClass,
  bodyStrongClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";

type ProgramListingCardProps = {
  program: Program;
  href: string;
  viewerOwnsProfile?: boolean;
  manageHref?: string;
  /** Hide subtitle when it repeats profile tagline/bio. */
  showSubtitle?: boolean;
  /** Use larger title scale for a lone featured program. */
  featured?: boolean;
};

export function ProgramListingCard({
  program,
  href,
  viewerOwnsProfile = false,
  manageHref,
  showSubtitle = true,
  featured = false,
}: ProgramListingCardProps) {
  const titleClass = featured ? titleSubsectionClass : titleCardClass;
  const priceClass = featured ? bodyEmphasisClass : bodyStrongClass;

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h2 className={`text-left ${titleClass}`}>{program.title}</h2>
            {viewerOwnsProfile && !program.isActive ? (
              <ProgramHiddenBadge />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <ShareProgramButton urlPath={href} title={program.title} />
            {viewerOwnsProfile && manageHref ? (
              <EditProgramIconLink href={manageHref} />
            ) : null}
          </div>
        </div>
        {showSubtitle && program.subtitle.trim() ? (
          <p className={bodyMutedClass}>{program.subtitle}</p>
        ) : null}
      </div>
      <p className={priceClass}>{program.price}</p>
      <ReadonlyTopicChips tags={program.topicTags} className="mt-auto" />
      <Button href={href} className="w-full">
        View program
      </Button>
    </Card>
  );
}
