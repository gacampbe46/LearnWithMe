"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PCAP_COHORT_PATH,
  PCAP_COHORT_SLUG,
  PCAP_QUIZ_ID,
  isPcapChoiceId,
  pcapQuestionById,
  pcapQuiz,
  type PcapChoiceId,
} from "@/lib/pcap-cohort-1/quiz-data";

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

function trimField(v: string | null, max: number): string {
  return (v ?? "").trim().slice(0, max);
}

function cohortLoginPath(): string {
  return `/login?next=${encodeURIComponent(PCAP_COHORT_PATH)}`;
}

function returnToResults(questionId?: string): string {
  const anchor = questionId ? `#${questionId}` : "";
  return `${PCAP_COHORT_PATH}?view=results${anchor}`;
}

async function requireCurrentMember() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(cohortLoginPath());
  }

  const { data: membership } = await supabase
    .from("cohort_members")
    .select("id")
    .eq("cohort_slug", PCAP_COHORT_SLUG)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(`${PCAP_COHORT_PATH}?error=join-first`);
  }

  return { supabase, user };
}

export async function joinPcapCohort() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(cohortLoginPath());
  }

  const { error } = await supabase.from("cohort_members").upsert(
    {
      cohort_slug: PCAP_COHORT_SLUG,
      user_id: user.id,
    },
    { onConflict: "cohort_slug,user_id" },
  );

  if (error) {
    redirect(`${PCAP_COHORT_PATH}?error=join`);
  }

  revalidatePath(PCAP_COHORT_PATH);
  redirect(PCAP_COHORT_PATH);
}

export async function submitPcapQuiz(formData: FormData) {
  const { supabase, user } = await requireCurrentMember();
  const answers: Record<string, PcapChoiceId> = {};
  let score = 0;

  for (const question of pcapQuiz.questions) {
    const raw = trimField(formText(formData, `answer_${question.id}`), 8);
    if (!isPcapChoiceId(raw)) {
      redirect(`${PCAP_COHORT_PATH}?view=quiz&error=incomplete#${question.id}`);
    }
    answers[question.id] = raw;
    if (raw === question.correctChoiceId) {
      score += 1;
    }
  }

  const { error } = await supabase.from("cohort_quiz_submissions").upsert(
    {
      cohort_slug: PCAP_COHORT_SLUG,
      quiz_id: PCAP_QUIZ_ID,
      user_id: user.id,
      answers,
      score,
      total_questions: pcapQuiz.questions.length,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "cohort_slug,quiz_id,user_id" },
  );

  if (error) {
    redirect(`${PCAP_COHORT_PATH}?view=quiz&error=submit`);
  }

  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnToResults());
}

export async function postQuestionDiscussion(formData: FormData) {
  const { supabase, user } = await requireCurrentMember();
  const questionId = trimField(formText(formData, "question_id"), 80);
  const body = trimField(formText(formData, "body"), 1000);
  const returnTo = safeNextPath(formText(formData, "return_to")) || returnToResults(questionId);

  if (!pcapQuestionById(questionId) || !body) {
    redirect(returnTo);
  }

  const { error } = await supabase.from("cohort_question_discussions").insert({
    cohort_slug: PCAP_COHORT_SLUG,
    quiz_id: PCAP_QUIZ_ID,
    question_id: questionId,
    user_id: user.id,
    body,
  });

  if (error) {
    redirect(`${PCAP_COHORT_PATH}?view=results&error=discussion#${questionId}`);
  }

  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnTo);
}

export async function updateQuestionDiscussion(formData: FormData) {
  const { supabase, user } = await requireCurrentMember();
  const postId = trimField(formText(formData, "post_id"), 80);
  const questionId = trimField(formText(formData, "question_id"), 80);
  const body = trimField(formText(formData, "body"), 1000);
  const returnTo = safeNextPath(formText(formData, "return_to")) || returnToResults(questionId);

  if (!postId || !pcapQuestionById(questionId) || !body) {
    redirect(returnTo);
  }

  const { error } = await supabase
    .from("cohort_question_discussions")
    .update({ body })
    .eq("id", postId)
    .eq("cohort_slug", PCAP_COHORT_SLUG)
    .eq("quiz_id", PCAP_QUIZ_ID)
    .eq("question_id", questionId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`${PCAP_COHORT_PATH}?view=results&error=discussion-update#${questionId}`);
  }

  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnTo);
}

export async function deleteQuestionDiscussion(formData: FormData) {
  const { supabase, user } = await requireCurrentMember();
  const postId = trimField(formText(formData, "post_id"), 80);
  const questionId = trimField(formText(formData, "question_id"), 80);
  const returnTo = safeNextPath(formText(formData, "return_to")) || returnToResults(questionId);

  if (!postId || !pcapQuestionById(questionId)) {
    redirect(returnTo);
  }

  const { error } = await supabase
    .from("cohort_question_discussions")
    .delete()
    .eq("id", postId)
    .eq("cohort_slug", PCAP_COHORT_SLUG)
    .eq("quiz_id", PCAP_QUIZ_ID)
    .eq("question_id", questionId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`${PCAP_COHORT_PATH}?view=results&error=discussion-delete#${questionId}`);
  }

  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnTo);
}

export async function requestQuestionHelp(formData: FormData) {
  const { supabase, user } = await requireCurrentMember();
  const questionId = trimField(formText(formData, "question_id"), 80);
  const returnTo = safeNextPath(formText(formData, "return_to")) || returnToResults(questionId);

  if (!pcapQuestionById(questionId)) {
    redirect(returnTo);
  }

  const { error } = await supabase.from("cohort_question_help_requests").upsert(
    {
      cohort_slug: PCAP_COHORT_SLUG,
      quiz_id: PCAP_QUIZ_ID,
      question_id: questionId,
      user_id: user.id,
    },
    { onConflict: "cohort_slug,quiz_id,question_id,user_id" },
  );

  if (error) {
    redirect(`${PCAP_COHORT_PATH}?view=results&error=help#${questionId}`);
  }

  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnTo);
}
