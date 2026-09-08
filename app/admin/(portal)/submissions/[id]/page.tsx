import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminNoteForm from "@/components/admin-note-form";
import AdminStatusPicker from "@/components/admin-status-picker";
import AdminResumeBriefing from "@/components/admin-resume-briefing";
import RoleMatchPanel from "@/components/admin/role-match-panel";
import ClientCopyPanel from "@/components/admin/client-copy-panel";
import { Arrow } from "@/components/ui";
import { PortalPage } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/guard";
import {
  getAnalysis,
  getPresentation,
  getRoleMatch,
  getSubmission,
  listNotes,
  rolesHash,
  signedResumeUrl,
  type StoredAnalysis,
  type StoredMatch,
  type StoredPresentation,
  type Submission,
} from "@/lib/admin/submissions";
import { isAiConfigured } from "@/lib/ai/config";
import { isAnalyzable } from "@/lib/ai/resume-analysis";
import { STATUS_LABEL } from "@/lib/admin/status";
import {
  isAdminPreview,
  PREVIEW_ANALYSIS,
  PREVIEW_MATCH,
  PREVIEW_PRESENTATION,
  PREVIEW_ROLES,
  PREVIEW_ROWS,
} from "@/lib/admin/preview";
import { listOpenRoles } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Submission",
  robots: { index: false, follow: false },
};

// Candidate data is never cached or prerendered.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  // Local preview renders the same layout against the invented sample rows, so
  // the design can be reviewed without opening a real candidate's record.
  const preview = isAdminPreview();

  const submission = preview
    ? ((PREVIEW_ROWS.find((r) => r.id === id) ?? null) as Submission | null)
    : await getSubmission(id);
  if (!submission) notFound();

  // Only sample-1 carries a briefing, so the preview shows both the written
  // state and the "not run yet" state that a recruiter actually meets first.
  const [notes, resumeUrl, analysis, match, openRoles, presentation] = preview
    ? ([
        [],
        null,
        id === "sample-1" ? ({ result: PREVIEW_ANALYSIS } as StoredAnalysis) : null,
        id === "sample-1"
          ? ({ result: PREVIEW_MATCH, roles_hash: "" } as StoredMatch)
          : null,
        PREVIEW_ROLES.filter((r) => r.status === "open"),
        id === "sample-1"
          ? ({ content: PREVIEW_PRESENTATION } as StoredPresentation)
          : null,
      ] as const)
    : await Promise.all([
        listNotes(id),
        signedResumeUrl(submission.resume_path),
        getAnalysis(id),
        getRoleMatch(id),
        listOpenRoles(),
        getPresentation(id),
      ]);

  const roleTitles = Object.fromEntries(openRoles.map((r) => [r.slug, r.title]));
  // A cached match that predates a role change is worth flagging rather than
  // silently re-running: re-running costs money and is the recruiter's call.
  const staleMatch = Boolean(
    match && !preview && match.roles_hash !== rolesHash(openRoles.map((r) => r.slug)),
  );

  const name = `${submission.first_name} ${submission.last_name}`;

  return (
    <PortalPage>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-body transition-colors hover:text-navy"
        >
          <Arrow className="rotate-180" />
          All submissions
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          {/* --- Notes are the working surface, so they lead --- */}
          <div>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-tight text-navy">
              {name}
            </h1>
            <p className="mt-2 text-body">
              Applied {when(submission.created_at)}
              {submission.role_slug ? ` for ${submission.role_slug}` : ", general submission"}
            </p>

            {submission.resume_path && (
              <RoleMatchPanel
                submissionId={submission.id}
                configured={preview || isAiConfigured()}
                analyzable={isAnalyzable(submission.resume_filename, submission.resume_path)}
                stored={match?.result ?? null}
                roleTitles={roleTitles}
                stale={staleMatch}
              />
            )}

            {submission.resume_path && (
              <ClientCopyPanel
                submissionId={submission.id}
                configured={preview || isAiConfigured()}
                analyzable={isAnalyzable(submission.resume_filename, submission.resume_path)}
                stored={presentation?.content ?? null}
              />
            )}

            {submission.resume_path && (
              <AdminResumeBriefing
                submissionId={submission.id}
                configured={preview || isAiConfigured()}
                analyzable={isAnalyzable(submission.resume_filename, submission.resume_path)}
                stored={analysis}
              />
            )}

            <div className="mt-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/50 p-7">
              <AdminNoteForm submissionId={submission.id} />
            </div>

            <h2 className="mt-12 font-display text-2xl font-normal text-navy">
              History
            </h2>
            {notes.length === 0 ? (
              <p className="mt-4 text-body">
                No notes yet. The first one is usually what came out of the screening call.
              </p>
            ) : (
              <ol className="mt-6 space-y-4">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-2xl border border-line-soft bg-canvas-warm/40 p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-navy">{n.author_email}</p>
                      <div className="flex items-baseline gap-3">
                        {/* Sync state is shown per note rather than per record:
                            once Bullhorn is connected, some notes will have
                            gone across and some will not, and the difference
                            matters when someone is looking at Bullhorn instead. */}
                        <span className="text-xs text-body">
                          {n.bullhorn_note_id ? "In Bullhorn" : "Here only"}
                        </span>
                        <p className="text-sm text-body">{when(n.created_at)}</p>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line leading-relaxed text-body">
                      {n.body}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* --- Facts rail --- */}
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <div className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/60 p-7">
              <AdminStatusPicker submissionId={submission.id} current={submission.status} />

              <dl className="mt-7 space-y-4 border-t border-line pt-7 text-[0.9375rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-body">Email</dt>
                  <dd className="text-right">
                    <a
                      href={`mailto:${submission.email}`}
                      className="text-navy underline underline-offset-4 hover:text-gold-deep"
                    >
                      {submission.email}
                    </a>
                  </dd>
                </div>
                {submission.phone && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${submission.phone}`}
                        className="text-navy underline underline-offset-4 hover:text-gold-deep"
                      >
                        {submission.phone}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-body">Stage</dt>
                  <dd className="text-navy">{STATUS_LABEL[submission.status]}</dd>
                </div>
              </dl>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
                >
                  Open résumé
                  <span className="sr-only"> for {name}, opens in a new tab</span>
                </a>
              ) : (
                <p className="mt-7 text-sm text-body">No résumé file on this record.</p>
              )}
              <p className="mt-3 text-xs text-body">
                Résumé links expire after ten minutes.
              </p>
            </div>

            {submission.message && (
              <div className="mt-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7">
                <p className="eyebrow mb-3">What they wrote</p>
                <p className="whitespace-pre-line leading-relaxed text-body">
                  {submission.message}
                </p>
              </div>
            )}

          </aside>
        </div>
    </PortalPage>
  );
}
