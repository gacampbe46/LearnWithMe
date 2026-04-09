"use client";

import { useCallback, useState } from "react";
import { Button } from "./Button";
import { StickyBottomCTA } from "./StickyBottomCTA";

type WorkoutStickyNavProps = {
  exerciseIds: string[];
  finishHref: string;
};

export function WorkoutStickyNav({
  exerciseIds,
  finishHref,
}: WorkoutStickyNavProps) {
  const [index, setIndex] = useState(0);
  const isLast = index >= exerciseIds.length - 1;

  const goNext = useCallback(() => {
    if (isLast) return;
    const nextId = exerciseIds[index + 1];
    const el = document.getElementById(nextId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIndex((i) => i + 1);
  }, [exerciseIds, index, isLast]);

  return (
    <StickyBottomCTA>
      {isLast ? (
        <Button href={finishHref} className="min-h-12 w-full max-w-sm">
          Back to program
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
