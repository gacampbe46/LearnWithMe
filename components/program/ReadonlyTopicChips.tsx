import type { ProgramTopicTag } from "@/lib/member";

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
          <span className="inline-flex items-center rounded-full border border-editorial-border px-3 py-1 text-sm text-stone-600 dark:text-stone-400">
            {tag.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
