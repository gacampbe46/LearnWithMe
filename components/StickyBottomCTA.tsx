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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/90 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md supports-[backdrop-filter]:bg-white/80 ${className}`.trim()}
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-3">
        {children}
      </div>
    </div>
  );
}
