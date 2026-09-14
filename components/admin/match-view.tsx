import { VERDICT_LABEL, type RoleMatch } from "@/lib/ai/role-match-schema";

/**
 * A résumé read against the open roles, without any panel or buttons.
 *
 * Shared by the match on a submitted résumé and by the standalone Résumé
 * reviewer tool. No hooks and no server-only imports, so it renders on either
 * side.
 */

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

// Worth a call first: the recruiter is scanning for who to phone today.
const ORDER: Record<string, number> = { worth_a_call: 0, possible: 1, not_this_one: 2 };

export default function MatchView({
  match,
  roleTitles,
  notice,
}: {
  match: RoleMatch;
  /** slug -> title, so roles known to the run only by slug are named. */
  roleTitles: Record<string, string>;
  /** Shown under the overall read, e.g. that the open roles have changed. */
  notice?: React.ReactNode;
}) {
  const sorted = [...match.matches].sort((a, b) => (ORDER[a.verdict] ?? 3) - (ORDER[b.verdict] ?? 3));

  return (
    <>
      <p className="text-[0.9375rem] leading-relaxed text-navy">{match.overall}</p>
      {notice}

      <ul className="mt-6 space-y-5">
        {sorted.map((m) => (
          <li key={m.role_slug} className="border-t border-line pt-5 first:border-0 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-normal text-navy">{roleTitles[m.role_slug] ?? m.role_slug}</h3>
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

            {m.ask && <p className="mt-3 text-[0.9375rem] text-navy">&ldquo;{m.ask}&rdquo;</p>}
          </li>
        ))}
      </ul>

      {/* The line that keeps this a reading aid rather than a filter. */}
      <p className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-body">
        Claude&rsquo;s read of one document against the role text. It does not score or
        rank candidates, and it has not spoken to anyone. Treat a &ldquo;not this
        one&rdquo; as a prompt to look closer, not a decision.
      </p>
    </>
  );
}
