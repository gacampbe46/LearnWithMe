import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PCAP_COHORT_SLUG } from "./quiz-data";

export type PcapQuestionType =
  | "multiple_choice"
  | "multi_select"
  | "fill_blank"
  | "free_response"
  | "code_output"
  | "code_completion";

export type PcapCurriculumTopic = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type PcapCurriculumQuestion = {
  id: string;
  slug: string;
  type: PcapQuestionType;
  role: "current" | "refresher";
  promptMarkdown: string;
  codeSnippet: string | null;
  expectedOutput: string | null;
  choices: unknown[];
  correctAnswer: unknown;
  explanationMarkdown: string;
  discussionPrompt: string;
  primaryTopic: PcapCurriculumTopic | null;
  secondaryTopics: PcapCurriculumTopic[];
  sourceModuleId: string | null;
  sourceLessonId: string | null;
  refresherLessonId: string | null;
  discussionThreadId: string | null;
  aiRequestCount: number;
  aiResponseMarkdown: string | null;
  sortOrder: number;
};

export type PcapCurriculumQuiz = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  currentQuestionRatio: number;
  refresherQuestionRatio: number;
  passingPercent: number;
  lessonId: string | null;
  moduleId: string | null;
  cohortId: string | null;
  sortOrder: number;
  questions: PcapCurriculumQuestion[];
};

export type PcapCurriculumLesson = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  objective: string;
  summary: string;
  contentMarkdown: string;
  lessonType: string;
  estimatedMinutes: number;
  sortOrder: number;
  topics: PcapCurriculumTopic[];
  quizzes: PcapCurriculumQuiz[];
  progressStatus: "not_started" | "in_progress" | "completed" | null;
};

export type PcapCurriculumModule = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  objective: string;
  phase: "foundation" | "pcap_core" | "readiness";
  sortOrder: number;
  lessons: PcapCurriculumLesson[];
  quizzes: PcapCurriculumQuiz[];
  progressStatus: "not_started" | "in_progress" | "completed" | null;
};

export type PcapSchemaCohort = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "draft" | "published" | "archived";
  programId: string | null;
};

export type PcapCurriculumState = {
  cohort: PcapSchemaCohort | null;
  modules: PcapCurriculumModule[];
  moduleBySlug: Map<string, PcapCurriculumModule>;
  lessonBySlug: Map<string, PcapCurriculumLesson>;
  hasSchemaCurriculum: boolean;
};

type CohortRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  program_id: string | null;
};

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  objective: string | null;
  phase: "foundation" | "pcap_core" | "readiness";
  sort_order: number | null;
};

type LessonRow = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  objective: string | null;
  summary: string | null;
  content_markdown: string | null;
  lesson_type: string | null;
  estimated_minutes: number | null;
  sort_order: number | null;
};

type TopicRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type LessonTopicRow = {
  lesson_id: string;
  is_primary: boolean | null;
  curriculum_topics: TopicRow | null;
};

type QuizRow = {
  id: string;
  lesson_id: string | null;
  module_id: string | null;
  cohort_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  quiz_type: string;
  sort_order: number | null;
  current_question_ratio: number | string | null;
  refresher_question_ratio: number | string | null;
  passing_percent: number | null;
};

type QuestionRow = {
  id: string;
  quiz_id: string;
  slug: string;
  question_type: PcapQuestionType;
  question_role: "current" | "refresher";
  prompt_markdown: string;
  code_snippet: string | null;
  expected_output: string | null;
  choices: unknown;
  correct_answer: unknown;
  explanation_markdown: string | null;
  discussion_prompt: string | null;
  primary_topic_id: string | null;
  source_module_id: string | null;
  source_lesson_id: string | null;
  refresher_lesson_id: string | null;
  sort_order: number | null;
  curriculum_topics: TopicRow | null;
};

type QuestionSecondaryTopicRow = {
  question_id: string;
  curriculum_topics: TopicRow | null;
};

type ProgressRow = {
  module_id: string | null;
  lesson_id: string | null;
  quiz_id: string | null;
  status: "not_started" | "in_progress" | "completed";
};

type ThreadRow = {
  id: string;
  question_id: string | null;
};

type AiRequestRow = {
  thread_id: string;
  user_id: string;
};

type AiResponseRow = {
  thread_id: string;
  response_markdown: string;
  created_at: string;
};

function topicFromRow(row: TopicRow | null): PcapCurriculumTopic | null {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
  };
}

function numericRatio(value: number | string | null, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export async function loadPcapCurriculumState(): Promise<PcapCurriculumState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: PcapCurriculumState = {
    cohort: null,
    modules: [],
    moduleBySlug: new Map(),
    lessonBySlug: new Map(),
    hasSchemaCurriculum: false,
  };

  if (!user) return empty;

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, slug, name, description, status, program_id")
    .eq("slug", PCAP_COHORT_SLUG)
    .maybeSingle<CohortRow>();

  if (!cohort) return empty;

  const schemaCohort: PcapSchemaCohort = {
    id: cohort.id,
    slug: cohort.slug,
    name: cohort.name,
    description: cohort.description ?? "",
    status: cohort.status,
    programId: cohort.program_id,
  };

  if (!cohort.program_id) {
    return {
      ...empty,
      cohort: schemaCohort,
    };
  }

  const { data: moduleRows } = await supabase
    .from("program_modules")
    .select("id, slug, title, summary, objective, phase, sort_order")
    .eq("program_id", cohort.program_id)
    .order("sort_order", { ascending: true })
    .returns<ModuleRow[]>();

  const moduleIds = (moduleRows ?? []).map((m) => m.id);
  if (moduleIds.length === 0) {
    return {
      ...empty,
      cohort: schemaCohort,
    };
  }

  const [
    { data: lessonRows },
    { data: moduleQuizRows },
    { data: progressRows },
  ] = await Promise.all([
    supabase
      .from("program_lessons")
      .select(
        "id, module_id, slug, title, objective, summary, content_markdown, lesson_type, estimated_minutes, sort_order",
      )
      .in("module_id", moduleIds)
      .order("sort_order", { ascending: true })
      .returns<LessonRow[]>(),
    supabase
      .from("lesson_quizzes")
      .select(
        "id, lesson_id, module_id, cohort_id, slug, title, description, quiz_type, sort_order, current_question_ratio, refresher_question_ratio, passing_percent",
      )
      .or(
        `module_id.in.(${moduleIds.join(",")}),cohort_id.eq.${cohort.id}`,
      )
      .order("sort_order", { ascending: true })
      .returns<QuizRow[]>(),
    supabase
      .from("learner_progress")
      .select("module_id, lesson_id, quiz_id, status")
      .eq("cohort_id", cohort.id)
      .eq("user_id", user.id)
      .returns<ProgressRow[]>(),
  ]);

  const lessonIds = (lessonRows ?? []).map((l) => l.id);

  const [{ data: lessonQuizRows }, { data: lessonTopicRows }] =
    lessonIds.length > 0
      ? await Promise.all([
          supabase
            .from("lesson_quizzes")
            .select(
              "id, lesson_id, module_id, cohort_id, slug, title, description, quiz_type, sort_order, current_question_ratio, refresher_question_ratio, passing_percent",
            )
            .in("lesson_id", lessonIds)
            .order("sort_order", { ascending: true })
            .returns<QuizRow[]>(),
          supabase
            .from("lesson_topics")
            .select(
              "lesson_id, is_primary, curriculum_topics(id, slug, name, description)",
            )
            .in("lesson_id", lessonIds)
            .returns<LessonTopicRow[]>(),
        ])
      : [
          { data: [] as QuizRow[] },
          { data: [] as LessonTopicRow[] },
        ];

  const quizRows = [...(moduleQuizRows ?? []), ...(lessonQuizRows ?? [])];
  const quizIds = [...new Set(quizRows.map((q) => q.id))];

  const [{ data: questionRows }, { data: secondaryTopicRows }] =
    quizIds.length > 0
      ? await Promise.all([
          supabase
            .from("quiz_questions")
            .select(
              "id, quiz_id, slug, question_type, question_role, prompt_markdown, code_snippet, expected_output, choices, correct_answer, explanation_markdown, discussion_prompt, primary_topic_id, source_module_id, source_lesson_id, refresher_lesson_id, sort_order, curriculum_topics(id, slug, name, description)",
            )
            .in("quiz_id", quizIds)
            .order("sort_order", { ascending: true })
            .returns<QuestionRow[]>(),
          supabase
            .from("quiz_question_secondary_topics")
            .select("question_id, curriculum_topics(id, slug, name, description)")
            .returns<QuestionSecondaryTopicRow[]>(),
        ])
      : [
          { data: [] as QuestionRow[] },
          { data: [] as QuestionSecondaryTopicRow[] },
        ];

  const questionIds = (questionRows ?? []).map((q) => q.id);

  const { data: threadRows } =
    questionIds.length > 0
      ? await supabase
          .from("discussion_threads")
          .select("id, question_id")
          .eq("cohort_id", cohort.id)
          .in("question_id", questionIds)
          .returns<ThreadRow[]>()
      : { data: [] as ThreadRow[] };

  const threadIds = (threadRows ?? []).map((t) => t.id);

  const [{ data: aiRequestRows }, { data: aiResponseRows }] =
    threadIds.length > 0
      ? await Promise.all([
          supabase
            .from("ai_liferaft_requests")
            .select("thread_id, user_id")
            .in("thread_id", threadIds)
            .returns<AiRequestRow[]>(),
          supabase
            .from("ai_responses")
            .select("thread_id, response_markdown, created_at")
            .in("thread_id", threadIds)
            .order("created_at", { ascending: false })
            .returns<AiResponseRow[]>(),
        ])
      : [
          { data: [] as AiRequestRow[] },
          { data: [] as AiResponseRow[] },
        ];

  const progressByModule = new Map(
    (progressRows ?? [])
      .filter((p) => p.module_id && !p.lesson_id && !p.quiz_id)
      .map((p) => [p.module_id!, p.status]),
  );
  const progressByLesson = new Map(
    (progressRows ?? [])
      .filter((p) => p.lesson_id)
      .map((p) => [p.lesson_id!, p.status]),
  );

  const topicsByLesson = new Map<string, PcapCurriculumTopic[]>();
  for (const row of lessonTopicRows ?? []) {
    const topic = topicFromRow(row.curriculum_topics);
    if (!topic) continue;
    const list = topicsByLesson.get(row.lesson_id) ?? [];
    if (row.is_primary) list.unshift(topic);
    else list.push(topic);
    topicsByLesson.set(row.lesson_id, list);
  }

  const secondaryTopicsByQuestion = new Map<string, PcapCurriculumTopic[]>();
  for (const row of secondaryTopicRows ?? []) {
    const topic = topicFromRow(row.curriculum_topics);
    if (!topic) continue;
    const list = secondaryTopicsByQuestion.get(row.question_id) ?? [];
    list.push(topic);
    secondaryTopicsByQuestion.set(row.question_id, list);
  }

  const threadByQuestion = new Map(
    (threadRows ?? [])
      .filter((row) => row.question_id)
      .map((row) => [row.question_id!, row.id]),
  );
  const aiRequestCountByThread = new Map<string, number>();
  for (const row of aiRequestRows ?? []) {
    const current = aiRequestCountByThread.get(row.thread_id) ?? 0;
    aiRequestCountByThread.set(row.thread_id, current + 1);
  }
  const aiResponseByThread = new Map<string, string>();
  for (const row of aiResponseRows ?? []) {
    if (!aiResponseByThread.has(row.thread_id)) {
      aiResponseByThread.set(row.thread_id, row.response_markdown);
    }
  }

  const questionsByQuiz = new Map<string, PcapCurriculumQuestion[]>();
  for (const row of questionRows ?? []) {
    const discussionThreadId = threadByQuestion.get(row.id) ?? null;
    const list = questionsByQuiz.get(row.quiz_id) ?? [];
    list.push({
      id: row.id,
      slug: row.slug,
      type: row.question_type,
      role: row.question_role,
      promptMarkdown: row.prompt_markdown,
      codeSnippet: row.code_snippet,
      expectedOutput: row.expected_output,
      choices: Array.isArray(row.choices) ? row.choices : [],
      correctAnswer: row.correct_answer,
      explanationMarkdown: row.explanation_markdown ?? "",
      discussionPrompt: row.discussion_prompt ?? "",
      primaryTopic: topicFromRow(row.curriculum_topics),
      secondaryTopics: secondaryTopicsByQuestion.get(row.id) ?? [],
      sourceModuleId: row.source_module_id,
      sourceLessonId: row.source_lesson_id,
      refresherLessonId: row.refresher_lesson_id,
      discussionThreadId,
      aiRequestCount: discussionThreadId
        ? (aiRequestCountByThread.get(discussionThreadId) ?? 0)
        : 0,
      aiResponseMarkdown: discussionThreadId
        ? (aiResponseByThread.get(discussionThreadId) ?? null)
        : null,
      sortOrder: row.sort_order ?? 0,
    });
    questionsByQuiz.set(row.quiz_id, list);
  }

  function mapQuiz(row: QuizRow): PcapCurriculumQuiz {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description ?? "",
      type: row.quiz_type,
      currentQuestionRatio: numericRatio(row.current_question_ratio, 0.7),
      refresherQuestionRatio: numericRatio(row.refresher_question_ratio, 0.3),
      passingPercent: row.passing_percent ?? 70,
      lessonId: row.lesson_id,
      moduleId: row.module_id,
      cohortId: row.cohort_id,
      sortOrder: row.sort_order ?? 0,
      questions: questionsByQuiz.get(row.id) ?? [],
    };
  }

  const quizzesByLesson = new Map<string, PcapCurriculumQuiz[]>();
  const quizzesByModule = new Map<string, PcapCurriculumQuiz[]>();
  for (const quiz of quizRows.map(mapQuiz)) {
    if (quiz.lessonId) {
      const list = quizzesByLesson.get(quiz.lessonId) ?? [];
      list.push(quiz);
      quizzesByLesson.set(quiz.lessonId, list);
    } else if (quiz.moduleId) {
      const list = quizzesByModule.get(quiz.moduleId) ?? [];
      list.push(quiz);
      quizzesByModule.set(quiz.moduleId, list);
    }
  }

  const lessonsByModule = new Map<string, PcapCurriculumLesson[]>();
  const lessonBySlug = new Map<string, PcapCurriculumLesson>();
  for (const row of lessonRows ?? []) {
    const lesson: PcapCurriculumLesson = {
      id: row.id,
      moduleId: row.module_id,
      slug: row.slug,
      title: row.title,
      objective: row.objective ?? "",
      summary: row.summary ?? "",
      contentMarkdown: row.content_markdown ?? "",
      lessonType: row.lesson_type ?? "core",
      estimatedMinutes: row.estimated_minutes ?? 7,
      sortOrder: row.sort_order ?? 0,
      topics: topicsByLesson.get(row.id) ?? [],
      quizzes: quizzesByLesson.get(row.id) ?? [],
      progressStatus: progressByLesson.get(row.id) ?? null,
    };
    const list = lessonsByModule.get(row.module_id) ?? [];
    list.push(lesson);
    lessonsByModule.set(row.module_id, list);
    lessonBySlug.set(lesson.slug, lesson);
  }

  const moduleBySlug = new Map<string, PcapCurriculumModule>();
  const modules: PcapCurriculumModule[] = (moduleRows ?? []).map((row) => {
    const currentModule: PcapCurriculumModule = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary ?? "",
      objective: row.objective ?? "",
      phase: row.phase,
      sortOrder: row.sort_order ?? 0,
      lessons: lessonsByModule.get(row.id) ?? [],
      quizzes: quizzesByModule.get(row.id) ?? [],
      progressStatus: progressByModule.get(row.id) ?? null,
    };
    moduleBySlug.set(currentModule.slug, currentModule);
    return currentModule;
  });

  return {
    cohort: schemaCohort,
    modules,
    moduleBySlug,
    lessonBySlug,
    hasSchemaCurriculum: modules.length > 0,
  };
}
