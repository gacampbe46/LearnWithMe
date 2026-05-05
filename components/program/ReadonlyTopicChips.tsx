import type { ProgramTopicTag } from "@/lib/member";
import { profileSetupInterestChipClasses } from "./topic-chip-styles";

type Props = {
  tags: ProgramTopicTag[];
  className?: string;
};

export function ReadonlyTopicChips({ tags, className = "" }: Props) {
  if (tags.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {tags.map((tag) => (
        <li key={tag.id}>
          <span className={profileSetupInterestChipClasses}>{tag.name}</span>
        </li>
      ))}
    </ul>
  );
}
