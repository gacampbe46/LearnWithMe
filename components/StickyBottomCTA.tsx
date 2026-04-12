type StickyBottomCTAProps = {
  children: React.ReactNode;
  className?: string;
};

export function StickyBottomCTA({
  children,
  className = "",
}: StickyBottomCTAProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/90 bg-white/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg supports-[backdrop-filter]:bg-white/75 dark:border-zinc-800/90 dark:bg-zinc-950/85 dark:supports-[backdrop-filter]:bg-zinc-950/70 ${className}`.trim()}
    >
      <div className="mx-auto flex max-w-lg justify-center">{children}</div>
    </div>
  );
}
