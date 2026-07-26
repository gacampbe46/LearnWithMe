type Props = {
  bannerUrl: string | null;
  className?: string;
};

/** 1024×169 banner; full-bleed below `lg`, content-aligned on large screens. */
export function ProfileBanner({ bannerUrl, className = "" }: Props) {
  const src = bannerUrl?.trim() || null;
  if (!src) return null;

  return (
    <div
      className={`relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden lg:left-auto lg:w-full lg:max-w-none lg:translate-x-0 ${className}`.trim()}
      aria-hidden
    >
      <div className="relative aspect-[1024/169] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- storage URLs */}
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
