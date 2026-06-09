import { pageContainerClass } from "@/lib/ui/page-layout";

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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-editorial-border bg-editorial-card/90 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg supports-[backdrop-filter]:bg-editorial-card/75 dark:supports-[backdrop-filter]:bg-editorial-card/70 ${className}`.trim()}
    >
      <div className={`${pageContainerClass} flex justify-center`}>{children}</div>
    </div>
  );
}
