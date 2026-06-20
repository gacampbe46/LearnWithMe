"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateAiLiferaftResponse } from "@/lib/ai/openai";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
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
    .select("id, cohort_id")
    .eq("cohort_slug", PCAP_COHORT_SLUG)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(`${PCAP_COHORT_PATH}?error=join-first`);
  }

  return {
    supabase,
    user,
    cohortId:
      typeof membership.cohort_id === "string" ? membership.cohort_id : null,
  };
}

async function requireCurrentSchemaMember() {
  const current = await requireCurrentMember();
  if (!current.cohortId) {
    redirect(`${PCAP_COHORT_PATH}?error=join-first`);
  }
  return current as typeof current & { cohortId: string };
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

export async function markCurriculumLessonComplete(formData: FormData) {
  const { supabase, user, cohortId } = await requireCurrentSchemaMember();
  const lessonId = trimField(formText(formData, "lesson_id"), 80);
  const returnTo = safeNextPath(formText(formData, "return_to")) || PCAP_COHORT_PATH;

  if (!lessonId) {
    redirect(returnTo);
  }

  const { data: existing } = await supabase
    .from("learner_progress")
    .select("id")
    .eq("cohort_id", cohortId)
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("learner_progress")
      .update({
        status: "completed",
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);
  } else {
    await supabase.from("learner_progress").insert({
      cohort_id: cohortId,
      user_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });
  }

  revalidatePath(returnTo);
  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnTo);
}

export async function markCurriculumModuleComplete(formData: FormData) {
  const { supabase, user, cohortId } = await requireCurrentSchemaMember();
  const moduleId = trimField(formText(formData, "module_id"), 80);
  const returnTo = safeNextPath(formText(formData, "return_to")) || PCAP_COHORT_PATH;

  if (!moduleId) {
    redirect(returnTo);
  }

  const { data: existing } = await supabase
    .from("learner_progress")
    .select("id")
    .eq("cohort_id", cohortId)
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("learner_progress")
      .update({
        status: "completed",
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);
  } else {
    await supabase.from("learner_progress").insert({
      cohort_id: cohortId,
      user_id: user.id,
      module_id: moduleId,
      status: "completed",
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });
  }

  revalidatePath(returnTo);
  revalidatePath(PCAP_COHORT_PATH);
  redirect(returnTo);
}

export async function submitCurriculumQuestionAttempt(formData: FormData) {
  const { supabase, user, cohortId } = await requireCurrentSchemaMember();
  const questionId = trimField(formText(formData, "question_id"), 80);
  const quizId = trimField(formText(formData, "quiz_id"), 80);
  const answer = trimField(formText(formData, "answer"), 4000);
  const returnTo = safeNextPath(formText(formData, "return_to")) || PCAP_COHORT_PATH;

  if (!questionId || !quizId || !answer) {
    redirect(returnTo);
  }

  const { data: previousAttempts } = await supabase
    .from("question_attempts")
    .select("attempt_number")
    .eq("question_id", questionId)
    .eq("user_id", user.id)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .returns<{ attempt_number: number }[]>();

  const nextAttempt =
    typeof previousAttempts?.[0]?.attempt_number === "number"
      ? previousAttempts[0].attempt_number + 1
      : 1;

  await supabase.from("question_attempts").insert({
    question_id: questionId,
    quiz_id: quizId,
    cohort_id: cohortId,
    user_id: user.id,
    attempt_number: nextAttempt,
    answer_payload: { answer },
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function postCurriculumDiscussionMessage(formData: FormData) {
  const { supabase, user } = await requireCurrentSchemaMember();
  const threadId = trimField(formText(formData, "thread_id"), 80);
  const body = trimField(formText(formData, "body"), 4000);
  const returnTo = safeNextPath(formText(formData, "return_to")) || PCAP_COHORT_PATH;

  if (!threadId || !body) {
    redirect(returnTo);
  }

  await supabase.from("discussion_messages").insert({
    thread_id: threadId,
    user_id: user.id,
    body,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function requestAiLiferaft(formData: FormData) {
  const { supabase, user, cohortId } = await requireCurrentSchemaMember();
  const threadId = trimField(formText(formData, "thread_id"), 80);
  const returnTo = safeNextPath(formText(formData, "return_to")) || PCAP_COHORT_PATH;

  if (!threadId) {
    redirect(returnTo);
  }

  const { error: requestErr } = await supabase
    .from("ai_liferaft_requests")
    .upsert(
      {
        thread_id: threadId,
        user_id: user.id,
      },
      { onConflict: "thread_id,user_id" },
    );

  if (requestErr) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=ai-liferaft`);
  }

  const service = createSupabaseServiceClient();

  const { data: requests } = await service
    .from("ai_liferaft_requests")
    .select("user_id")
    .eq("thread_id", threadId)
    .returns<{ user_id: string }[]>();

  const uniqueRequesters = [...new Set((requests ?? []).map((r) => r.user_id))];
  if (uniqueRequesters.length < 2) {
    revalidatePath(returnTo);
    redirect(returnTo);
  }

  const { data: existingResponse } = await service
    .from("ai_responses")
    .select("id")
    .eq("thread_id", threadId)
    .limit(1)
    .maybeSingle();

  if (existingResponse) {
    revalidatePath(returnTo);
    redirect(returnTo);
  }

  const { data: thread } = await service
    .from("discussion_threads")
    .select("id, cohort_id, lesson_id, question_id, title")
    .eq("id", threadId)
    .eq("cohort_id", cohortId)
    .maybeSingle<{
      id: string;
      cohort_id: string;
      lesson_id: string | null;
      question_id: string | null;
      title: string | null;
    }>();

  if (!thread) {
    redirect(returnTo);
  }

  const [
    { data: messages },
    { data: question },
    { data: attempts },
    { data: cohort },
  ] = await Promise.all([
    service
      .from("discussion_messages")
      .select("id, parent_message_id, user_id, body, created_at")
      .eq("thread_id", threadId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    thread.question_id
      ? service
          .from("quiz_questions")
          .select(
            "id, slug, question_type, question_role, prompt_markdown, code_snippet, expected_output, choices, correct_answer, explanation_markdown, discussion_prompt, primary_topic_id, source_module_id, source_lesson_id, refresher_lesson_id",
          )
          .eq("id", thread.question_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    thread.question_id
      ? service
          .from("question_attempts")
          .select(
            "user_id, attempt_number, answer_payload, is_correct, score, topic_snapshot, submitted_at",
          )
          .eq("question_id", thread.question_id)
          .order("submitted_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    service
      .from("cohorts")
      .select("id, slug, name, program_id")
      .eq("id", cohortId)
      .maybeSingle(),
  ]);

  const responseMarkdown = await generateAiLiferaftResponse({
    question,
    learner: {
      currentUserId: user.id,
      requesters: uniqueRequesters,
      attempts,
    },
    discussion: {
      thread,
      messages,
    },
    curriculum: {
      cohort,
    },
  });

  await service.from("ai_responses").insert({
    thread_id: threadId,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    prompt_context: {
      question,
      learner: {
        currentUserId: user.id,
        requesters: uniqueRequesters,
        attempts,
      },
      discussion: {
        thread,
        messages,
      },
      curriculum: {
        cohort,
      },
    },
    response_markdown: responseMarkdown,
    requested_by_user_ids: uniqueRequesters,
    activation_threshold: 2,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}
