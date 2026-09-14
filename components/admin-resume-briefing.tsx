import AdminAnalyzeButton from "@/components/admin-analyze-button";
import BriefingView from "@/components/admin/briefing-view";
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

  return (
    <Panel>
      <BriefingView analysis={parsed.data} />
      <div className="mt-4">
        <AdminAnalyzeButton submissionId={submissionId} again />
      </div>
    </Panel>
  );
}
