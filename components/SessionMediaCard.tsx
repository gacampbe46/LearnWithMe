import { bodyEmphasisClass, bodyLeadClass } from "@/lib/ui/typography";
import { SectionHeader } from "./SectionHeader";
import { VideoEmbed } from "./VideoEmbed";
import type { SessionMedia } from "@/lib/member";

type SessionMediaCardProps = {
  block: SessionMedia;
  className?: string;
  /**
   * When false, skips the embedded heading—the parent page already shows the lesson title.
   */
  showBlockTitle?: boolean;
};

export function SessionMediaCard({
  block,
  className = "",
  showBlockTitle = true,
}: SessionMediaCardProps) {
  return (
    <article
      className={`space-y-5 scroll-mt-24 ${className}`.trim()}
      id={block.id}
    >
      {showBlockTitle ? <SectionHeader title={block.title} /> : null}
      <VideoEmbed videoId={block.videoId} title={block.title} />
      {block.caption.trim() ? (
        <p className={bodyEmphasisClass}>{block.caption}</p>
      ) : null}
      <ul className={`list-disc space-y-2 pl-5 ${bodyLeadClass}`}>
        {block.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}
