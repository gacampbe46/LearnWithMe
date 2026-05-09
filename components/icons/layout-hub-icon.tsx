type Props = {
  className?: string;
};

/** Compact rows — suggests condensed hub layout. */
export function LayoutHubIcon({ className = "" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block size-5 shrink-0 translate-y-px ${className}`.trim()}
    >
      <rect width="18" height="5" x="3" y="4" rx="1" />
      <rect width="18" height="5" x="3" y="14" rx="1" />
    </svg>
  );
}
