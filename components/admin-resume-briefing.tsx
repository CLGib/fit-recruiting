import AdminAnalyzeButton from "@/components/admin-analyze-button";
import { ResumeAnalysisSchema } from "@/lib/ai/resume-analysis";
import type { StoredAnalysis } from "@/lib/admin/submissions";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="briefing-heading"
      className="mt-8 rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7"
    >
      {/* A real h2 rather than styled text: the h3s below need a parent, and
          the page already uses h2 for "History". */}
      <h2 className="eyebrow mb-3" id="briefing-heading">
        Résumé briefing
      </h2>
      {children}
    </section>
  );
}

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

export default function AdminResumeBriefing({
  submissionId,
  analyzable,
  configured,
  stored,
}: {
  submissionId: string;
  analyzable: boolean;
  configured: boolean;
  stored: StoredAnalysis | null;
}) {
  if (!configured) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Briefings are switched off until an Anthropic API key is set on this
          deployment.
        </p>
      </Panel>
    );
  }

  if (!analyzable) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Briefings currently read PDFs only. This résumé is a Word document, so
          it needs reading the old way.
        </p>
      </Panel>
    );
  }

  if (!stored) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Pull the facts out of this résumé and suggest what to ask on the call.
          It takes about a minute.
        </p>
        <div className="mt-5">
          <AdminAnalyzeButton submissionId={submissionId} />
        </div>
      </Panel>
    );
  }

  // The column is jsonb, so what comes back is whatever was written — including
  // rows written by an older version of the schema. Parse rather than cast.
  const parsed = ResumeAnalysisSchema.safeParse(stored.result);
  if (!parsed.success) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          The saved briefing could not be read. Running it again will replace it.
        </p>
        <div className="mt-4">
          <AdminAnalyzeButton submissionId={submissionId} again />
        </div>
      </Panel>
    );
  }

  const a = parsed.data;

  return (
    <Panel>
      <p className="font-display text-xl font-normal leading-snug text-navy">
        {a.headline}
      </p>

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
                  <span className="block text-sm">
                    {[job.start, job.end].filter(Boolean).join(" – ")}
                  </span>
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
                <p className="mt-1 text-navy">“{item.question}”</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <List title="Skills named" items={a.skills} />
      <List title="Education" items={a.education} />
      <List title="Not stated on the résumé" items={a.missing_information} />

      <div className="mt-7 border-t border-line pt-5">
        {/* Said plainly, because a recruiter should treat this as a reading aid
            and not as a verified record of the person. */}
        <p className="text-xs leading-relaxed text-body">
          Written by Claude from the résumé alone. It can misread a document, so
          check anything that matters against the file itself. It does not score
          or rank candidates.
        </p>
        <div className="mt-4">
          <AdminAnalyzeButton submissionId={submissionId} again />
        </div>
      </div>
    </Panel>
  );
}
