import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminNoteForm from "@/components/admin-note-form";
import AdminStatusPicker from "@/components/admin-status-picker";
import { Arrow, Container, Section } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { getSubmission, listNotes, signedResumeUrl } from "@/lib/admin/submissions";
import { STATUS_LABEL } from "@/lib/admin/status";
import { isAdminPreview } from "@/lib/admin/preview";

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

  if (isAdminPreview()) {
    return (
      <Section className="pt-12">
        <Container>
          <p className="text-body">
            Submission detail is not available in local preview mode. Sign in to
            view a real record.
          </p>
        </Container>
      </Section>
    );
  }

  const submission = await getSubmission(id);
  if (!submission) notFound();

  const [notes, resumeUrl] = await Promise.all([
    listNotes(id),
    signedResumeUrl(submission.resume_path),
  ]);

  const name = `${submission.first_name} ${submission.last_name}`;

  return (
    <Section className="pt-10 lg:pt-14">
      <Container>
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

            <div className="mt-8 rounded-[1.75rem] border border-line-soft bg-canvas-warm/50 p-7">
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
                      <p className="text-sm text-body">{when(n.created_at)}</p>
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
      </Container>
    </Section>
  );
}
