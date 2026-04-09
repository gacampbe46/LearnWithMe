type VideoEmbedProps = {
  videoId: string;
  title?: string;
  className?: string;
};

export function VideoEmbed({
  videoId,
  title = "YouTube video player",
  className = "",
}: VideoEmbedProps) {
  return (
    <div
      className={`aspect-video w-full overflow-hidden rounded-xl bg-zinc-800 ${className}`.trim()}
    >
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
