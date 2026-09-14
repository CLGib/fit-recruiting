import type { ResumeAnalysis } from "@/lib/ai/resume-analysis";

/**
 * The résumé summary itself, without any panel, heading or buttons.
 *
 * Shared by the summary on a submitted résumé and by the standalone Résumé
 * reviewer tool, so the two always read the same way. No hooks and no
 * server-only imports, so it renders on either side.
 */

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-navy">{title}</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.9375rem] leading-relaxed text-body marker:text-gold-deep">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function BriefingView({ analysis: a }: { analysis: ResumeAnalysis }) {
  return (
    <>
      <p className="font-display text-xl font-normal leading-snug text-navy">{a.headline}</p>

      <dl className="mt-5 space-y-3 border-t border-line pt-5 text-[0.9375rem]">
        {a.current_title && (
          <div className="flex justify-between gap-4">
            <dt className="text-body">Current title</dt>
            <dd className="text-right text-navy">{a.current_title}</dd>
          </div>
        )}
        {a.years_experience !== null && (
          <div className="flex justify-between gap-4">
            <dt className="text-body">Experience</dt>
            <dd className="text-navy">
              About {a.years_experience} {a.years_experience === 1 ? "year" : "years"}
            </dd>
          </div>
        )}
        {a.location && (
          <div className="flex justify-between gap-4">
            <dt className="text-body">Location</dt>
            <dd className="text-right text-navy">{a.location}</dd>
          </div>
        )}
      </dl>

      {a.employment.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-navy">Where they have worked</h3>
          <ol className="mt-2 space-y-2.5 text-[0.9375rem] leading-relaxed text-body">
            {a.employment.map((job, i) => (
              <li key={i}>
                <span className="text-navy">{job.title}</span>, {job.employer}
                {(job.start || job.end) && (
                  <span className="block text-sm">{[job.start, job.end].filter(Boolean).join(" – ")}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <List title="Strengths" items={a.strengths} />

      {a.things_to_ask_about.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-navy">Worth asking about</h3>
          <ul className="mt-2 space-y-3 text-[0.9375rem] leading-relaxed">
            {a.things_to_ask_about.map((item, i) => (
              <li key={i}>
                <p className="text-body">{item.observation}</p>
                <p className="mt-1 text-navy">&ldquo;{item.question}&rdquo;</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <List title="Skills named" items={a.skills} />
      <List title="Education" items={a.education} />
      <List title="Not stated on the résumé" items={a.missing_information} />

      {/* Said plainly, because a recruiter should treat this as a reading aid
          and not as a verified record of the person. */}
      <p className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-body">
        Written by Claude from the résumé alone. It can misread a document, so check
        anything that matters against the file itself. It does not score or rank
        candidates.
      </p>
    </>
  );
}
