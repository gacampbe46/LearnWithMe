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
  sectionTitle = "Free sample sessions",
  className = "",
}: ChannelVideoPreviewProps) {
  return (
    <section className={`space-y-8 ${className}`.trim()}>
      <SectionHeader title={sectionTitle} />
      <div className="space-y-10">
        {videos.map((v) => (
          <div key={v.videoId} className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {v.title}
            </p>
            <VideoEmbed videoId={v.videoId} title={v.title} />
          </div>
        ))}
      </div>
    </section>
  );
}
