import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ProgramSessionGrid } from "@/components/program/program-session-grid";
import { BeginProgramCta } from "@/components/program/begin-program-cta";
import { CheckoutAccessSync } from "@/components/program/checkout-access-sync";
import { ShareProgramButton } from "@/components/program/share-program-button";
import { ReadonlyTopicChips } from "@/components/program/ReadonlyTopicChips";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { userHasProgramAccess } from "@/lib/stripe/entitlements";
import { claimPaidCheckoutForBuyer } from "@/lib/stripe/fulfill-checkout";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  bodyEmphasisClass,
  bodyLeadClass,
  navLinkClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import { pageMainStickyClass } from "@/lib/ui/page-layout";

type PageProps = {
  params: Promise<{ username: string; programId: string }>;
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);
  if (!loaded) {
    return { title: "Program" };
  }
  return {
    title: `${loaded.program.title} — ${loaded.profileDisplayName}`,
    description: loaded.program.subtitle,
  };
}

/** Learner-facing program page — owners edit from `/manage`. */
export default async function ProgramPage({ params, searchParams }: PageProps) {
  const { username, programId } = await params;
  const { checkout, session_id: sessionIdRaw } = await searchParams;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded) {
    notFound();
  }

  const { profileSlug, profileDisplayName, program: p, canManage } = loaded;
  const sessions = p.sessions;
  const hasSessions = sessions.length > 0;
  const sessionId =
    typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  const returningFromCheckout =
    checkout === "success" || Boolean(sessionId);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (returningFromCheckout && user && !canManage) {
    let granted = false;
    try {
      granted = await claimPaidCheckoutForBuyer({
        userId: user.id,
        programId: p.id,
        sessionId: sessionId || undefined,
      });
    } catch (error) {
      console.error("[program/checkout]", error);
    }
    if (granted) {
      redirect(`/${profileSlug}/${programId}`);
    }
  }

  const hasAccess = await userHasProgramAccess({
    supabase,
    programId: p.id,
    priceValue: p.priceValue,
    canManage,
    userId: user?.id ?? null,
  });

  if (hasAccess && returningFromCheckout) {
    redirect(`/${profileSlug}/${programId}`);
  }

  const checkoutPending = returningFromCheckout && !hasAccess && !canManage;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainStickyClass} space-y-10`}>
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${profileSlug}`} className={navLinkClass}>
            ← {profileDisplayName}
          </Link>
          <div className="flex items-center gap-0.5">
            <ShareProgramButton
              urlPath={`/${profileSlug}/${programId}`}
              title={p.title}
            />
            {canManage ? (
              <EditProgramIconLink
                href={`/${profileSlug}/${programId}/manage`}
              />
            ) : null}
          </div>
        </nav>

        <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10 lg:space-y-0">
          <div className="space-y-6">
            <div className="space-y-3">
              <SectionHeader
                eyebrow="Program"
                title={p.title}
                subtitle={p.subtitle}
              />
            </div>

            {canManage && !p.isActive ? (
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                Only you can see this preview — users won&apos;t find this listing
                until visibility is on.{" "}
                <Link
                  href={`/${profileSlug}/${programId}/manage`}
                  className="font-semibold underline decoration-amber-600 underline-offset-2 dark:decoration-amber-400"
                >
                  Manage visibility
                </Link>
              </p>
            ) : null}
          </div>

          <div className="space-y-3 lg:pt-1">
            <p className={bodyEmphasisClass}>{p.price}</p>
            <ReadonlyTopicChips tags={p.topicTags} />
            {hasSessions ? (
              <p className={bodyLeadClass}>
                {sessions.length} session{sessions.length === 1 ? "" : "s"} —
                pick any tile below to start, or begin from the first session.
              </p>
            ) : null}
          </div>
        </div>

        <section className="space-y-5">
          <h2 className={titleSubsectionClass}>Sessions</h2>
          {hasSessions ? (
            <ProgramSessionGrid
              programId={p.id}
              profileSlug={profileSlug}
              sessions={sessions}
              revealProgress={hasAccess}
            />
          ) : canManage ? (
            <div className="max-w-xl space-y-4">
              <p className={bodyLeadClass}>
                No sessions yet. Add your first session so this program has
                something for people to open.
              </p>
              <Button
                href={`/${profileSlug}/${programId}/manage#sessions`}
                variant="outline"
                className="w-full min-h-10 justify-center px-5 text-sm font-medium sm:w-auto"
              >
                Add session
              </Button>
            </div>
          ) : (
            <p className={bodyLeadClass}>
              No sessions are published for this program yet.
            </p>
          )}
        </section>
      </main>

      {hasSessions && (p.isActive || canManage) ? (
        <BeginProgramCta
          profileSlug={profileSlug}
          programId={p.id}
          sessionIds={sessions.map((s) => s.id)}
          hasAccess={hasAccess}
          priceLabel={p.price}
          isSignedIn={Boolean(user)}
          checkoutPending={checkoutPending}
        />
      ) : null}
      {checkoutPending ? (
        <CheckoutAccessSync programId={p.id} sessionId={sessionId || undefined} />
      ) : null}
    </div>
  );
}
