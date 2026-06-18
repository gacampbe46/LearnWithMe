import {
  oauthAccountMenuLabel,
  ssoAvatarUrlFromUser,
} from "@/lib/auth/oauth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PCAP_COHORT_SLUG,
  PCAP_QUIZ_ID,
  pcapQuiz,
  type PcapChoiceId,
  isPcapChoiceId,
} from "./quiz-data";
import type { User } from "@supabase/supabase-js";

type ProfileRow = {
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type MemberRow = {
  user_id: string;
  joined_at: string;
};

type SubmissionRow = {
  user_id: string;
  answers: unknown;
  score: number;
  total_questions: number;
  submitted_at: string;
};

type DiscussionRow = {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

type HelpRow = {
  question_id: string;
  user_id: string;
  created_at: string;
};

export type PcapCohortMember = {
  userId: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  isCurrentUser: boolean;
};

export type PcapQuizSubmission = {
  userId: string;
  answers: Record<string, PcapChoiceId>;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  member: PcapCohortMember | null;
};

export type PcapQuestionDiscussion = {
  id: string;
  questionId: string;
  body: string;
  createdAt: string;
  member: PcapCohortMember | null;
};

export type PcapQuestionHelpRequest = {
  questionId: string;
  createdAt: string;
  member: PcapCohortMember | null;
};

export type PcapCohortState = {
  currentUser: PcapCohortMember | null;
  isMember: boolean;
  members: PcapCohortMember[];
  submissions: PcapQuizSubmission[];
  currentSubmission: PcapQuizSubmission | null;
  cohortAveragePercent: number | null;
  answerBucketsByQuestion: Record<
    string,
    Record<PcapChoiceId, PcapCohortMember[]>
  >;
  discussionsByQuestion: Record<string, PcapQuestionDiscussion[]>;
  helpRequestsByQuestion: Record<string, PcapQuestionHelpRequest[]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function compactName(profile: ProfileRow | null | undefined): string | null {
  if (!profile) return null;
  const full = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  return full || profile.username?.trim() || null;
}

function currentUserIdentity(user: User, profile: ProfileRow | null): {
  name: string;
  email: string | null;
  avatarUrl: string | null;
} {
  const name = compactName(profile) ?? oauthAccountMenuLabel(user);
  const avatar =
    profile?.avatar_url && profile.avatar_url.trim()
      ? profile.avatar_url.trim()
      : ssoAvatarUrlFromUser(user);
  return {
    name,
    email: user.email ?? null,
    avatarUrl: avatar,
  };
}

function profileIdentity(profile: ProfileRow | null | undefined): {
  name: string;
  avatarUrl: string | null;
} {
  const avatar =
    profile?.avatar_url && profile.avatar_url.trim()
      ? profile.avatar_url.trim()
      : null;
  return {
    name: compactName(profile) ?? "Cohort member",
    avatarUrl: avatar,
  };
}

function normalizeAnswers(raw: unknown): Record<string, PcapChoiceId> {
  if (!isRecord(raw)) return {};
  const answers: Record<string, PcapChoiceId> = {};
  for (const q of pcapQuiz.questions) {
    const v = raw[q.id];
    if (typeof v === "string" && isPcapChoiceId(v)) {
      answers[q.id] = v;
    }
  }
  return answers;
}

function emptyChoiceBuckets(): Record<PcapChoiceId, PcapCohortMember[]> {
  return {
    A: [],
    B: [],
    C: [],
    D: [],
  };
}

function buildAnswerBuckets(
  submissions: PcapQuizSubmission[],
): PcapCohortState["answerBucketsByQuestion"] {
  const buckets: PcapCohortState["answerBucketsByQuestion"] = {};
  for (const q of pcapQuiz.questions) {
    buckets[q.id] = emptyChoiceBuckets();
  }

  for (const submission of submissions) {
    if (!submission.member) continue;
    for (const q of pcapQuiz.questions) {
      const choiceId = submission.answers[q.id];
      if (choiceId) {
        buckets[q.id][choiceId].push(submission.member);
      }
    }
  }
  return buckets;
}

export async function loadPcapCohortState(): Promise<PcapCohortState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedOutState: PcapCohortState = {
    currentUser: null,
    isMember: false,
    members: [],
    submissions: [],
    currentSubmission: null,
    cohortAveragePercent: null,
    answerBucketsByQuestion: buildAnswerBuckets([]),
    discussionsByQuestion: {},
    helpRequestsByQuestion: {},
  };

  if (!user) {
    return signedOutState;
  }

  const { data: currentProfile } = await supabase
    .from("profile")
    .select("user_id, username, first_name, last_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  const { data: memberRows } = await supabase
    .from("cohort_members")
    .select("user_id, joined_at")
    .eq("cohort_slug", PCAP_COHORT_SLUG)
    .order("joined_at", { ascending: true })
    .returns<MemberRow[]>();

  const rawMembers = memberRows ?? [];
  const isMember = rawMembers.some((m) => m.user_id === user.id);
  const memberUserIds = rawMembers.map((m) => m.user_id);

  const { data: profiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profile")
          .select("user_id, username, first_name, last_name, avatar_url")
          .in("user_id", memberUserIds)
          .returns<ProfileRow[]>()
      : { data: [] as ProfileRow[] };

  const profileByUser = new Map<string, ProfileRow>();
  for (const profile of profiles ?? []) {
    profileByUser.set(profile.user_id, profile);
  }
  if (currentProfile) {
    profileByUser.set(user.id, currentProfile);
  }

  const currentIdentity = currentUserIdentity(user, currentProfile ?? null);
  const currentMember: PcapCohortMember = {
    userId: user.id,
    name: currentIdentity.name,
    email: currentIdentity.email,
    avatarUrl: currentIdentity.avatarUrl,
    joinedAt: "",
    isCurrentUser: true,
  };

  const members = rawMembers.map((m) => {
    if (m.user_id === user.id) {
      return {
        ...currentMember,
        joinedAt: m.joined_at,
      };
    }
    const identity = profileIdentity(profileByUser.get(m.user_id));
    return {
      userId: m.user_id,
      name: identity.name,
      email: null,
      avatarUrl: identity.avatarUrl,
      joinedAt: m.joined_at,
      isCurrentUser: false,
    };
  });

  const memberByUser = new Map(members.map((m) => [m.userId, m]));
  const currentUser = isMember
    ? (memberByUser.get(user.id) ?? currentMember)
    : currentMember;

  if (!isMember) {
    return {
      ...signedOutState,
      currentUser,
      members,
      isMember: false,
    };
  }

  const [
    { data: submissionRows },
    { data: discussionRows },
    { data: helpRows },
  ] = await Promise.all([
    supabase
      .from("cohort_quiz_submissions")
      .select("user_id, answers, score, total_questions, submitted_at")
      .eq("cohort_slug", PCAP_COHORT_SLUG)
      .eq("quiz_id", PCAP_QUIZ_ID)
      .returns<SubmissionRow[]>(),
    supabase
      .from("cohort_question_discussions")
      .select("id, question_id, user_id, body, created_at")
      .eq("cohort_slug", PCAP_COHORT_SLUG)
      .eq("quiz_id", PCAP_QUIZ_ID)
      .order("created_at", { ascending: true })
      .returns<DiscussionRow[]>(),
    supabase
      .from("cohort_question_help_requests")
      .select("question_id, user_id, created_at")
      .eq("cohort_slug", PCAP_COHORT_SLUG)
      .eq("quiz_id", PCAP_QUIZ_ID)
      .returns<HelpRow[]>(),
  ]);

  const submissions = (submissionRows ?? []).map((s) => ({
    userId: s.user_id,
    answers: normalizeAnswers(s.answers),
    score: s.score,
    totalQuestions: s.total_questions,
    submittedAt: s.submitted_at,
    member: memberByUser.get(s.user_id) ?? null,
  }));

  const currentSubmission =
    submissions.find((submission) => submission.userId === user.id) ?? null;

  const cohortAveragePercent =
    submissions.length > 0
      ? Math.round(
          (submissions.reduce(
            (sum, s) => sum + s.score / Math.max(s.totalQuestions, 1),
            0,
          ) /
            submissions.length) *
            100,
        )
      : null;

  const discussionsByQuestion: Record<string, PcapQuestionDiscussion[]> = {};
  for (const row of discussionRows ?? []) {
    const list = discussionsByQuestion[row.question_id] ?? [];
    list.push({
      id: row.id,
      questionId: row.question_id,
      body: row.body,
      createdAt: row.created_at,
      member: memberByUser.get(row.user_id) ?? null,
    });
    discussionsByQuestion[row.question_id] = list;
  }

  const helpRequestsByQuestion: Record<string, PcapQuestionHelpRequest[]> = {};
  for (const row of helpRows ?? []) {
    const list = helpRequestsByQuestion[row.question_id] ?? [];
    list.push({
      questionId: row.question_id,
      createdAt: row.created_at,
      member: memberByUser.get(row.user_id) ?? null,
    });
    helpRequestsByQuestion[row.question_id] = list;
  }

  return {
    currentUser,
    isMember,
    members,
    submissions,
    currentSubmission,
    cohortAveragePercent,
    answerBucketsByQuestion: buildAnswerBuckets(submissions),
    discussionsByQuestion,
    helpRequestsByQuestion,
  };
}
