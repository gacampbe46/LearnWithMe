import { Card } from "@/components/Card";
import { MonthTrendChart } from "@/components/payouts/month-trend-chart";
import type {
  CreatorProgramAnalyticsRow,
  CreatorVideoAnalytics,
} from "@/lib/gumlet/creator-analytics";
import {
  formatCompletion,
  formatWatchTime,
  type ProgramSessionAnalytics,
} from "@/lib/gumlet/program-analytics";
import {
  captionClass,
  subtitleSmClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import Link from "next/link";

const tableClass = "w-full min-w-[36rem] text-left text-sm";
const headRowClass =
  "border-y border-editorial-border text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400";
const thClass = "py-2 pr-4 font-medium";
const thRightClass = `${thClass} text-right`;
const rowClass =
  "border-b border-editorial-border/80 text-stone-800 last:border-b-0 dark:text-stone-200";
const tdClass = "py-3 pr-4 font-medium";
const tdRightClass = "py-3 pr-4 text-right tabular-nums";

function MetricsHead({ first }: { first: string }) {
  return (
    <thead>
      <tr className={headRowClass}>
        <th className={thClass}>{first}</th>
        <th className={thRightClass}>Views</th>
        <th className={thRightClass}>Unique</th>
        <th className={thRightClass}>Watch time</th>
        <th className={`${thClass} text-right`}>Completion</th>
      </tr>
    </thead>
  );
}

function MetricCells({
  views,
  uniqueViews,
  playingTimeHours,
  completion,
}: {
  views: string;
  uniqueViews: string;
  playingTimeHours: string;
  completion: string;
}) {
  return (
    <>
      <td className={tdRightClass}>{views}</td>
      <td className={tdRightClass}>{uniqueViews}</td>
      <td className={tdRightClass}>{playingTimeHours}</td>
      <td className="py-3 text-right tabular-nums">{completion}</td>
    </>
  );
}

type Props = {
  analytics: CreatorVideoAnalytics;
};

export function CreatorAnalyticsPanel({ analytics }: Props) {
  return (
    <div className="space-y-8">
      <p className={`max-w-xl ${subtitleSmClass}`}>
        How people watched your program videos · {analytics.rangeLabel}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Views"
          value={analytics.views.toLocaleString("en-US")}
          hint="Plays across every program"
        />
        <MetricCard
          label="Unique viewers"
          value={analytics.uniqueViews.toLocaleString("en-US")}
          hint="Counted per session"
        />
        <MetricCard
          label="Watch time"
          value={formatWatchTime(analytics.playingTimeHours)}
          hint="Time actually playing, not paused"
        />
        <MetricCard
          label="Avg. completion"
          value={formatCompletion(analytics.completionPercent)}
          hint="How far viewers got, weighted by views"
        />
      </div>

      {analytics.viewsByWeek.some((point) => point.value > 0) ? (
        <MonthTrendChart
          title="Views by week"
          months={analytics.viewsByWeek.map((point) => ({
            key: point.key,
            label: point.label,
            value: point.value,
            display: point.value.toLocaleString("en-US"),
          }))}
        />
      ) : null}

      <Card className="space-y-4 overflow-hidden">
        <div>
          <h2 className={titleSubsectionClass}>Programs</h2>
          <p className={`mt-1 ${captionClass}`}>
            Engagement for each program you teach
          </p>
        </div>
        {analytics.programs.length === 0 ? (
          <p className={subtitleSmClass}>
            When you add a program with videos, watch numbers will show up here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <MetricsHead first="Program" />
              <tbody>
                {analytics.programs.map((program) => (
                  <ProgramMetricsRow key={program.programId} program={program} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {analytics.programs.map((program) =>
        program.sessions.length > 0 ? (
          <Card key={program.programId} className="overflow-hidden">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-lg outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted dark:focus-visible:outline-stone-500">
                <div className="min-w-0">
                  <h2 className={titleSubsectionClass}>{program.title}</h2>
                  <p className={`mt-1 ${captionClass}`}>
                    {program.sessions.length}{" "}
                    {program.sessions.length === 1 ? "session" : "sessions"}
                    {" · "}
                    {program.views.toLocaleString("en-US")} views
                    {" · "}
                    {formatWatchTime(program.playingTimeHours)}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="mt-1 inline-flex shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-180 dark:text-stone-500"
                >
                  ▼
                </span>
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className={tableClass}>
                  <MetricsHead first="Session" />
                  <tbody>
                    {program.sessions.map((session) => (
                      <SessionMetricsRow
                        key={session.sessionId}
                        session={session}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Card>
        ) : null,
      )}
    </div>
  );
}

function ProgramMetricsRow({
  program,
}: {
  program: CreatorProgramAnalyticsRow;
}) {
  return (
    <tr className={rowClass}>
      <td className={tdClass}>
        <Link href={program.href} className="hover:underline">
          {program.title}
        </Link>
      </td>
      <MetricCells
        views={program.views.toLocaleString("en-US")}
        uniqueViews={program.uniqueViews.toLocaleString("en-US")}
        playingTimeHours={formatWatchTime(program.playingTimeHours)}
        completion={
          program.views > 0
            ? formatCompletion(program.completionPercent)
            : "—"
        }
      />
    </tr>
  );
}

function SessionMetricsRow({ session }: { session: ProgramSessionAnalytics }) {
  return (
    <tr className={rowClass}>
      <td className={tdClass}>{session.title}</td>
      <MetricCells
        views={session.hasVideo ? session.views.toLocaleString("en-US") : "—"}
        uniqueViews={
          session.hasVideo ? session.uniqueViews.toLocaleString("en-US") : "—"
        }
        playingTimeHours={
          session.hasVideo ? formatWatchTime(session.playingTimeHours) : "—"
        }
        completion={
          session.hasVideo && session.views > 0
            ? formatCompletion(session.completionPercent)
            : "—"
        }
      />
    </tr>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="space-y-2">
      <p className={captionClass}>{label}</p>
      <p className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
        {value}
      </p>
      <p className={captionClass}>{hint}</p>
    </Card>
  );
}
