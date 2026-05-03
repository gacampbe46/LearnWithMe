type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-16 w-16 text-2xl",
  lg: "h-24 w-24 text-3xl",
};

type Props = {
  name: string;
  imageUrl?: string | null;
  size?: Size;
  className?: string;
};

/** Rounded avatar: remote image when `imageUrl` is set, else first letter of `name`. */
export function ProfileAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const dim = sizeClasses[size];

  if (imageUrl?.trim()) {
    return (
      <span
        className={`inline-block shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${dim} ${className}`.trim()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote OAuth URLs; avoid remotePatterns churn */}
        <img
          src={imageUrl.trim()}
          alt=""
          width={size === "sm" ? 32 : size === "md" ? 64 : 96}
          height={size === "sm" ? 32 : size === "md" ? 64 : 96}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-700 ${dim} ${className}`.trim()}
      aria-hidden
    >
      {initial}
    </div>
  );
}
