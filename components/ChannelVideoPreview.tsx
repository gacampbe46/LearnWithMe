import type { FeaturedPreviewVideo } from "@/lib/member";
import { titleSmallClass } from "@/lib/ui/typography";
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
            <p className={titleSmallClass}>{v.title}</p>
            <VideoEmbed videoId={v.videoId} title={v.title} />
          </div>
        ))}
      </div>
    </section>
  );
}
