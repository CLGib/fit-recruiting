"use client";

import { useActionState } from "react";
import { analyzeResume, type AnalyzeState } from "@/app/admin/submissions/actions";

const INITIAL: AnalyzeState = { status: "idle" };

/**
 * A run takes the better part of a minute. Without a pending state a recruiter
 * assumes the click missed and presses it again, which costs a second run.
 */
export default function AdminAnalyzeButton({
  submissionId,
  again = false,
}: {
  submissionId: string;
  again?: boolean;
}) {
  const [state, action, pending] = useActionState(analyzeResume, INITIAL);

  return (
    <form action={action}>
      <input type="hidden" name="submissionId" value={submissionId} />
      <button
        type="submit"
        disabled={pending}
        className={
          again
            ? "text-sm font-medium text-body underline underline-offset-4 transition-colors hover:text-navy disabled:no-underline disabled:opacity-60"
            : "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:opacity-60"
        }
      >
        {pending ? "Reading the résumé…" : again ? "Read it again" : "Prepare a briefing"}
      </button>
      <p aria-live="polite" className="sr-only">
        {pending ? "Reading the résumé. This takes about a minute." : ""}
      </p>
      {state.status === "error" && state.message && (
        <p className="mt-3 text-sm leading-relaxed text-navy" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
