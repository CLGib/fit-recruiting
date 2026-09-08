import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "./actions";
import { Arrow, Container, Section } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview, PREVIEW_ROWS } from "@/lib/admin/preview";
import { listSubmissions, type Submission } from "@/lib/admin/submissions";
import { OPEN_STATUSES, STATUS_LABEL } from "@/lib/admin/status";

export const metadata: Metadata = {
  title: "Submissions",
  robots: { index: false, follow: false },
};

// Candidate data must never be cached or statically rendered.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminPage() {
  const signedInAs = await requireAdmin();
  const preview = isAdminPreview();
  const rows: Submission[] = preview
    ? (PREVIEW_ROWS as Submission[])
    : await listSubmissions();

  const needsAction = rows.filter((r) => OPEN_STATUSES.includes(r.status)).length;

  return (
    <Section className="pt-12 lg:pt-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-4">Fit Recruiting</p>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-light leading-tight tracking-tight text-navy">
              Résumé submissions
            </h1>
            <p className="mt-4 text-body">
              {rows.length} total
              {rows.length > 0 && `, ${needsAction} still open`}. Signed in as {signedInAs}.
            </p>
          </div>
          <form action={signOut} hidden={preview}>
            <button
              type="submit"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas"
            >
              Sign out
            </button>
          </form>
        </div>

        {preview && (
          <p
            role="status"
            className="mt-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
          >
            <span className="font-semibold text-navy">Design preview.</span> Invented
            sample records, local only. Open a record to see the detail view with
            real data.
          </p>
        )}

        {rows.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-dashed border-line bg-canvas-warm/40 px-8 py-20 text-center">
            <p className="font-display text-3xl font-light text-navy">No submissions yet.</p>
            <p className="mx-auto mt-4 max-w-md text-body">
              Applications from the website will appear here as they come in.
            </p>
          </div>
        ) : (
          <ul className="mt-12 space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/submissions/${r.id}`}
                  className="group flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[1.5rem] border border-line-soft bg-canvas-warm/50 p-6 transition-all hover:-translate-y-0.5 hover:border-line hover:bg-canvas-warm hover:shadow-soft"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[1.4rem] font-normal leading-tight text-navy transition-colors group-hover:text-gold-deep">
                      {r.first_name} {r.last_name}
                    </h2>
                    <p className="mt-1 text-sm text-body">
                      {when(r.created_at)}
                      {r.role_slug ? ` · ${r.role_slug}` : " · general submission"}
                    </p>
                  </div>
                  <span className="rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-medium text-navy-700">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-navy transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
                  >
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
