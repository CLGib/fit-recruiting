"use client";

import { useActionState } from "react";
import { matchToRoles, type MatchState } from "@/app/admin/(portal)/submissions/actions";
import MatchView from "@/components/admin/match-view";
import { RoleMatchSchema } from "@/lib/ai/role-match-schema";

const INITIAL: MatchState = { status: "idle" };

function RunButton({
  submissionId,
  label,
  quiet,
}: {
  submissionId: string;
  label: string;
  quiet?: boolean;
}) {
  const [state, action, pending] = useActionState(matchToRoles, INITIAL);
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="submissionId" value={submissionId} />
        <button
          type="submit"
          disabled={pending}
          className={
            quiet
              ? "text-sm font-medium text-body underline underline-offset-4 transition-colors hover:text-navy disabled:no-underline disabled:opacity-60"
              : "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:opacity-60"
          }
        >
          {pending ? "Reading against the roles…" : label}
        </button>
      </form>
      {state.status === "error" && state.message && (
        <p className="mt-3 text-sm leading-relaxed text-[#8c3225]" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="match-heading"
      className="mt-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7"
    >
      <h2 id="match-heading" className="eyebrow mb-3">
        Against our open roles
      </h2>
      {children}
    </section>
  );
}

export default function RoleMatchPanel({
  submissionId,
  configured,
  analyzable,
  stored,
  roleTitles,
  stale,
}: {
  submissionId: string;
  configured: boolean;
  analyzable: boolean;
  stored: unknown | null;
  /** slug -> title, so the panel can name roles the run only knows by slug. */
  roleTitles: Record<string, string>;
  stale: boolean;
}) {
  if (!configured) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Matching is switched off until an Anthropic API key is set on this deployment.
        </p>
      </Panel>
    );
  }

  if (!analyzable) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Matching reads PDFs only, so this one needs doing by eye.
        </p>
      </Panel>
    );
  }

  if (!stored) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Read this person against every role on the job board, with the reasoning written
          out so you can disagree with it.
        </p>
        <div className="mt-5">
          <RunButton submissionId={submissionId} label="Check the open roles" />
        </div>
      </Panel>
    );
  }

  const parsed = RoleMatchSchema.safeParse(stored);
  if (!parsed.success) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          The saved match could not be read. Running it again will replace it.
        </p>
        <div className="mt-4">
          <RunButton submissionId={submissionId} label="Run it again" quiet />
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <MatchView
        match={parsed.data}
        roleTitles={roleTitles}
        notice={
          stale ? (
            <p
              role="status"
              className="mt-4 rounded-xl border border-dashed border-line px-4 py-3 text-sm leading-relaxed text-body"
            >
              The open roles have changed since this ran. Run it again to include them.
            </p>
          ) : null
        }
      />
      <div className="mt-4">
        <RunButton submissionId={submissionId} label="Run it again" quiet />
      </div>
    </Panel>
  );
}
