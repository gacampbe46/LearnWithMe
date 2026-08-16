import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import { pageMainClass } from "@/lib/ui/page-layout";
import { captionClass, titleDisplayClass } from "@/lib/ui/typography";

const pulse = "animate-pulse bg-stone-200/80 dark:bg-stone-800/70";

export function AnalyticsPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} space-y-8`}>
        <header className="space-y-2">
          <h1 className={titleDisplayClass}>Analytics</h1>
        </header>
        {children}
      </main>
    </div>
  );
}

export function CreatorAnalyticsFallback() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <p className={`flex items-center gap-2 ${captionClass}`}>
        <span
          className="size-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-editorial-accent dark:border-stone-600 dark:border-t-editorial-accent"
          aria-hidden
        />
        Loading watch data…
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Views", "Unique viewers", "Watch time", "Avg. completion"].map(
          (label) => (
            <Card key={label} className={`h-28 ${pulse}`}>
              <span className="sr-only">Loading {label}</span>
            </Card>
          ),
        )}
      </div>

      <Card className={`h-56 ${pulse}`}>
        <span className="sr-only">Loading views chart</span>
      </Card>

      <Card className={`h-40 ${pulse}`}>
        <span className="sr-only">Loading programs</span>
      </Card>
    </div>
  );
}
