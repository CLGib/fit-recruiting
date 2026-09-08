"use client";

import Link from "next/link";
import { useActionState } from "react";
import { matchToRoles, type MatchState } from "@/app/admin/(portal)/submissions/actions";
import { RoleMatchSchema, VERDICT_LABEL } from "@/lib/ai/role-match-schema";

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

function Verdict({ verdict }: { verdict: string }) {
  const strong = verdict === "worth_a_call";
  return (
    <span
      className={
        strong
          ? "shrink-0 rounded-full bg-gold/25 px-3 py-1 text-xs font-semibold text-navy-700"
          : "shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium text-body"
      }
    >
      {VERDICT_LABEL[verdict] ?? verdict}
    </span>
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
          Matching is switched off until an Anthropic API key is set on this
          deployment.
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
          Read this person against every role Fit has open, with the reasoning
          written out so you can disagree with it.
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

  const { matches, overall } = parsed.data;
  // Worth a call first: the recruiter is scanning for who to phone today.
  const order = { worth_a_call: 0, possible: 1, not_this_one: 2 } as const;
  const sorted = [...matches].sort(
    (a, b) => (order[a.verdict] ?? 3) - (order[b.verdict] ?? 3),
  );

  return (
    <Panel>
      <p className="text-[0.9375rem] leading-relaxed text-navy">{overall}</p>

      {stale && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-dashed border-line px-4 py-3 text-sm leading-relaxed text-body"
        >
          Your open roles have changed since this ran. Run it again to include
          them.
        </p>
      )}

      <ul className="mt-6 space-y-5">
        {sorted.map((m) => (
          <li key={m.role_slug} className="border-t border-line pt-5 first:border-0 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-normal text-navy">
                {roleTitles[m.role_slug] ?? m.role_slug}
              </h3>
              <Verdict verdict={m.verdict} />
            </div>

            {m.reasons.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.9375rem] leading-relaxed text-body marker:text-gold-deep">
                {m.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}

            {m.gaps.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-navy">Not evidenced</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.9375rem] leading-relaxed text-body marker:text-line">
                  {m.gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            )}

            {m.ask && <p className="mt-3 text-[0.9375rem] text-navy">“{m.ask}”</p>}
          </li>
        ))}
      </ul>

      <div className="mt-7 border-t border-line pt-5">
        {/* The line that keeps this a reading aid rather than a filter. */}
        <p className="text-xs leading-relaxed text-body">
          Claude&rsquo;s read of one document against the role text. It does not score
          or rank candidates, and it has not spoken to anyone. Treat a
          &ldquo;not this one&rdquo; as a prompt to look closer, not a decision.{" "}
          <Link href="/admin/roles" className="text-navy underline underline-offset-2">
            Manage roles
          </Link>
          .
        </p>
        <div className="mt-4">
          <RunButton submissionId={submissionId} label="Run it again" quiet />
        </div>
      </div>
    </Panel>
  );
}
