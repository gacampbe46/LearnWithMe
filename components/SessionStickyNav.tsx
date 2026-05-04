"use client";

import { useCallback, useState } from "react";
import { Button } from "./Button";
import { StickyBottomCTA } from "./StickyBottomCTA";

type SessionStickyNavProps = {
  mediaAnchorIds: string[];
  /** Program page — used when there is no following session. */
  finishHref: string;
  /** Following session in program order; when set, final CTA continues the path. */
  nextSessionHref?: string | null;
};

export function SessionStickyNav({
  mediaAnchorIds,
  finishHref,
  nextSessionHref,
}: SessionStickyNavProps) {
  const [index, setIndex] = useState(0);
  const isLast = index >= mediaAnchorIds.length - 1;

  const goNext = useCallback(() => {
    if (isLast) return;
    const nextId = mediaAnchorIds[index + 1];
    const el = document.getElementById(nextId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIndex((i) => i + 1);
  }, [mediaAnchorIds, index, isLast]);

  return (
    <StickyBottomCTA>
      {isLast ? (
        <Button
          href={nextSessionHref ?? finishHref}
          className="min-h-12 w-full max-w-sm"
        >
          {nextSessionHref ? "Complete & next session" : "Return to program"}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          className="min-h-12 w-full max-w-sm"
          onClick={goNext}
        >
          Continue
        </Button>
      )}
    </StickyBottomCTA>
  );
}
