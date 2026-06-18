"use client";

import { useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { PcapQuestionDiscussion } from "@/lib/pcap-cohort-1/cohort-data";
import { PCAP_COHORT_PATH } from "@/lib/pcap-cohort-1/quiz-data";
import {
  formLabelClass,
  inputFieldClass,
  inputFocusClass,
} from "@/lib/ui/typography";
import {
  deleteQuestionDiscussion,
  updateQuestionDiscussion,
} from "./actions";
import { PendingSubmitButton } from "./discussion-form-buttons";

type Props = {
  post: PcapQuestionDiscussion;
  questionId: string;
};

export function DiscussionPostCard({ post, questionId }: Props) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const canManage = Boolean(post.member?.isCurrentUser);
  const returnTo = `${PCAP_COHORT_PATH}?view=results#${questionId}`;

  const content = (
    <div className="flex gap-3">
      <ProfileAvatar
        name={post.member?.name ?? "Member"}
        imageUrl={post.member?.avatarUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
          {post.member?.name ?? "Cohort member"}
          {post.member?.isCurrentUser ? " (you)" : ""}
        </p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {post.body}
        </p>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-editorial-border bg-stone-50/70 p-3 dark:bg-stone-900/30">
      <div className="relative overflow-hidden rounded-xl">
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setActionsOpen((open) => !open);
            }}
            className={`block w-full text-left transition ${
              actionsOpen ? "scale-[0.99] opacity-40 blur-[1px]" : ""
            }`}
            aria-expanded={actionsOpen}
          >
            {content}
          </button>
        ) : (
          content
        )}

        {canManage && actionsOpen ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-editorial-card/70 px-3 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-editorial-border bg-editorial-card/90 px-4 py-2 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false);
                  setEditing(true);
                }}
                className="text-sm font-medium text-stone-900 underline decoration-editorial-accent-muted underline-offset-4 dark:text-stone-50"
              >
                Edit
              </button>
              <form action={deleteQuestionDiscussion}>
                <input type="hidden" name="post_id" value={post.id} />
                <input type="hidden" name="question_id" value={questionId} />
                <input type="hidden" name="return_to" value={returnTo} />
                <PendingSubmitButton
                  variant="ghost"
                  className="min-h-0 rounded-none px-0 py-0 text-sm text-red-700 underline decoration-red-300 underline-offset-4 hover:bg-transparent hover:text-red-900 dark:text-red-300 dark:hover:bg-transparent dark:hover:text-red-100"
                  pendingChildren="Deleting..."
                >
                  Delete
                </PendingSubmitButton>
              </form>
              <button
                type="button"
                onClick={() => setActionsOpen(false)}
                className="text-sm font-medium text-stone-600 underline decoration-stone-400 underline-offset-4 dark:text-stone-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {editing ? (
        <form action={updateQuestionDiscussion} className="mt-3 space-y-2">
          <input type="hidden" name="post_id" value={post.id} />
          <input type="hidden" name="question_id" value={questionId} />
          <input type="hidden" name="return_to" value={returnTo} />
          <label
            htmlFor={`edit-discussion-${post.id}`}
            className={formLabelClass}
          >
            Update your comment
          </label>
          <textarea
            id={`edit-discussion-${post.id}`}
            name="body"
            rows={3}
            maxLength={1000}
            required
            defaultValue={post.body}
            className={`${inputFieldClass} ${inputFocusClass} resize-y`}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <PendingSubmitButton
              variant="outline"
              className="w-full sm:w-auto"
              pendingChildren="Updating..."
            >
              Update comment
            </PendingSubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="min-h-12 rounded-full px-4 text-sm font-medium text-stone-600 dark:text-stone-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
