import type { FeaturedPreviewVideo } from "@/data/member";
import { SectionHeader } from "./SectionHeader";
import { VideoEmbed } from "./VideoEmbed";

type ChannelVideoPreviewProps = {
  videos: FeaturedPreviewVideo[];
  sectionTitle?: string;
  className?: string;
};

export function ChannelVideoPreview({
  videos,
  sectionTitle = "Sample videos",
  className = "",
}: ChannelVideoPreviewProps) {
  return (
    <section className={`space-y-8 ${className}`.trim()}>
      <SectionHeader title={sectionTitle} />
      <div className="space-y-10">
        {videos.map((v) => (
          <div key={v.videoId} className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
              {v.title}
            </p>
            <VideoEmbed videoId={v.videoId} title={v.title} />
          </div>
        ))}
      </div>
    </section>
  );
}
