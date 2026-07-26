type Props = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

/**
 * Circular profile photo for the full profile header.
 * Outer box owns width/aspect (so grid/flex can’t collapse it); clip lives on the inner.
 */
export function ProfilePortrait({
  name,
  imageUrl,
  className = "",
}: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const src = imageUrl?.trim() || null;

  return (
    <div
      className={`relative aspect-square shrink-0 self-start ${className}`.trim()}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full border border-editorial-border bg-stone-200 dark:bg-stone-800">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote OAuth / storage URLs
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-serif-display text-4xl font-semibold text-stone-500 dark:text-stone-400 sm:text-5xl lg:text-6xl"
            aria-hidden
          >
            {initial}
          </div>
        )}
      </div>
    </div>
  );
}
