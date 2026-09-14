"use client";

import { useActionState, useState } from "react";
import { reviewResume, type ReviewState } from "@/app/admin/(portal)/tools/actions";
import BriefingView from "@/components/admin/briefing-view";
import MatchView from "@/components/admin/match-view";
import { PrimaryButton } from "@/components/admin/field";

const INITIAL: ReviewState = { status: "idle" };

/** Mirrors the server cap so an oversized file is refused before it uploads. */
const MAX_BYTES = 4 * 1024 * 1024;

const PANEL = "rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7 lg:p-8";

export default function ResumeReviewerTool() {
  const [state, action, pending] = useActionState(reviewResume, INITIAL);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? (state.status === "error" ? state.message : null);

  return (
    <div className="space-y-8">
      <form
        action={action}
        onSubmit={(e) => {
          const input = e.currentTarget.elements.namedItem("resume") as HTMLInputElement;
          const file = input?.files?.[0];
          if (file && file.size > MAX_BYTES) {
            e.preventDefault();
            setLocalError("That file is larger than 4 MB. Please use a smaller copy.");
            return;
          }
          setLocalError(null);
        }}
        className={`${PANEL} space-y-5`}
      >
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] leading-relaxed text-[#8c3225]"
          >
            {error}
          </p>
        )}

        <label className="block">
          <span className="eyebrow mb-3 block">Résumé</span>
          <input
            name="resume"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="w-full rounded-xl border border-line bg-canvas px-4 py-3.5 text-[0.9375rem] text-navy file:mr-4 file:rounded-full file:border-0 file:bg-navy file:px-5 file:py-2 file:text-sm file:font-semibold file:text-canvas hover:file:bg-navy-700"
          />
        </label>
        <p className="text-sm text-body">PDF, up to 4 MB. Download it from Bullhorn or anywhere else.</p>

        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Reading it…" : "Review this résumé"}
          </PrimaryButton>
          <p aria-live="polite" className="text-sm text-body">
            {pending ? "This takes about a minute. Keep this tab open." : ""}
          </p>
        </div>
      </form>

      {state.status === "done" && state.analysis && (
        <>
          <section aria-labelledby="review-summary-heading" className={PANEL}>
            <h2 id="review-summary-heading" className="eyebrow mb-4">
              Summary{state.fileName ? ` of ${state.fileName}` : ""}
            </h2>
            <BriefingView analysis={state.analysis} />
          </section>

          <section aria-labelledby="review-roles-heading" className={PANEL}>
            <h2 id="review-roles-heading" className="eyebrow mb-4">
              Against the open roles
            </h2>
            {state.match ? (
              <MatchView match={state.match} roleTitles={state.roleTitles ?? {}} />
            ) : (
              <p className="text-[0.9375rem] leading-relaxed text-body">{state.matchNote}</p>
            )}
          </section>

          <p className="text-sm leading-relaxed text-body">Nothing you uploaded was saved.</p>
        </>
      )}
    </div>
  );
}
