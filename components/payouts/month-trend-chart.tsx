"use client";

import { Card } from "@/components/Card";
import { titleSubsectionClass } from "@/lib/ui/typography";
import { useState } from "react";

export type MonthPoint = {
  key: string;
  label: string;
  value: number;
  display: string;
};

type ChartMode = "bar" | "line";

const toggleWrap =
  "flex items-center gap-0.5 rounded-lg border border-editorial-border bg-editorial-card p-0.5";
const toggleBtn =
  "inline-flex min-h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium transition";
const toggleOn =
  "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900";
const toggleOff =
  "text-stone-600 hover:bg-stone-900/5 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-100/10 dark:hover:text-stone-100";

type Props = {
  title: string;
  months: MonthPoint[];
};

export function MonthTrendChart({ title, months }: Props) {
  const [mode, setMode] = useState<ChartMode>("bar");
  const max = Math.max(0, ...months.map((month) => month.value));

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={titleSubsectionClass}>{title}</h2>
        <div className={toggleWrap} role="group" aria-label={`${title} chart type`}>
          <button
            type="button"
            className={`${toggleBtn} ${mode === "bar" ? toggleOn : toggleOff}`}
            aria-pressed={mode === "bar"}
            onClick={() => setMode("bar")}
          >
            Bar
          </button>
          <button
            type="button"
            className={`${toggleBtn} ${mode === "line" ? toggleOn : toggleOff}`}
            aria-pressed={mode === "line"}
            onClick={() => setMode("line")}
          >
            Line
          </button>
        </div>
      </div>
      {mode === "line" ? (
        <LineChart months={months} max={max} />
      ) : (
        <BarChart months={months} max={max} />
      )}
    </Card>
  );
}

function BarChart({ months, max }: { months: MonthPoint[]; max: number }) {
  return (
    <div className="flex items-end gap-1.5 sm:gap-2">
      {months.map((month) => {
        const hasValue = month.value > 0 && max > 0;
        const height = hasValue
          ? Math.max(10, Math.round((month.value / max) * 100))
          : 0;
        return (
          <div
            key={month.key}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <div className="flex h-40 w-full flex-col items-center justify-end">
              <span
                className={`mb-1 max-w-full truncate text-[10px] font-medium tabular-nums text-stone-800 dark:text-stone-100 ${
                  hasValue ? "" : "invisible"
                }`}
              >
                {month.display}
              </span>
              <div className="flex min-h-0 w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-md ${
                    hasValue
                      ? "bg-editorial-accent/80 dark:bg-editorial-accent"
                      : "bg-editorial-border"
                  }`}
                  style={{ height: hasValue ? `${height}%` : "3px" }}
                  title={`${month.label}: ${month.display}`}
                />
              </div>
            </div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">
              {month.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ months, max }: { months: MonthPoint[]; max: number }) {
  const width = 240;
  const height = 140;
  const padTop = 22;
  const padBottom = 8;
  const padX = 12;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const last = months.length - 1;
  const points = months.map((month, index) => {
    const x = padX + (last <= 0 ? innerW / 2 : (index / last) * innerW);
    const ratio = max <= 0 ? 0 : month.value / max;
    const y = padTop + innerH * (1 - ratio);
    return { ...month, x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full overflow-visible text-editorial-accent"
        role="img"
        aria-hidden
      >
        <line
          x1={padX}
          y1={height - padBottom}
          x2={width - padX}
          y2={height - padBottom}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
        {points.map((point) => (
          <g key={point.key}>
            <circle cx={point.x} cy={point.y} r="2.5" fill="currentColor" />
            {point.value > 0 ? (
              <text
                x={point.x}
                y={point.y - 8}
                textAnchor="middle"
                className="fill-stone-800 dark:fill-stone-100"
                fontSize="8"
                fontWeight="500"
              >
                {point.display}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <div className="mt-1.5 flex">
        {months.map((month) => (
          <span
            key={month.key}
            className="min-w-0 flex-1 text-center text-[10px] text-stone-500 dark:text-stone-400"
          >
            {month.label}
          </span>
        ))}
      </div>
    </div>
  );
}
