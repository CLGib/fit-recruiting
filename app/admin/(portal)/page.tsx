import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Arrow } from "@/components/ui";
import { GroupHeading, PageHeader, PortalPage } from "@/components/admin/page-header";
import SubmissionFilters from "@/components/admin/submission-filters";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview, PREVIEW_ROWS } from "@/lib/admin/preview";
import { listSubmissions, type Submission } from "@/lib/admin/submissions";
import { STATUS_LABEL, type Status } from "@/lib/admin/status";

export const metadata: Metadata = { title: "Résumés" };

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

function Row({ r }: { r: Submission }) {
  return (
    <li>
      <Link
        href={`/admin/submissions/${r.id}`}
        className="group flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line-soft bg-canvas-warm/50 px-6 py-5 transition-all hover:border-line hover:bg-canvas-warm"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.3rem] font-normal leading-tight text-navy transition-colors group-hover:text-gold-deep">
            {r.first_name} {r.last_name}
          </h3>
          <p className="mt-1 text-sm text-body">
            {r.email}
            {r.role_slug ? ` · ${r.role_slug}` : " · general submission"}
          </p>
        </div>
        <span className="text-sm text-body">{when(r.created_at)}</span>
        <span className="rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-medium text-navy-700">
          {STATUS_LABEL[r.status] ?? r.status}
        </span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-navy transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
        >
          <Arrow />
        </span>
      </Link>
    </li>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;
  const preview = isAdminPreview();

  const all: Submission[] = preview
    ? (PREVIEW_ROWS as Submission[])
    : await listSubmissions();

  // Filtering in memory: listSubmissions() caps at 200 rows, and Fit's volume
  // is nowhere near that. Move this into the query when it stops being true.
  const needle = q.trim().toLowerCase();
  const rows = all.filter((r) => {
    if (status && r.status !== (status as Status)) return false;
    if (!needle) return true;
    return [r.first_name, r.last_name, r.email, r.role_slug]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(needle));
  });

  // New applications lead, because they are the only ones with a clock running.
  const fresh = rows.filter((r) => r.status === "new");
  const rest = rows.filter((r) => r.status !== "new");
  const filtered = Boolean(needle || status);

  return (
    <PortalPage>
      <PageHeader
        eyebrow="Team portal"
        title="Résumés."
        intro={
          <>
            New applications first. Below, everyone else — search by name, email,
            or role, or filter by stage. Open a record to read the résumé, run a
            briefing, add notes, and move someone along the pipeline.
          </>
        }
      />

      {preview && (
        <p
          role="status"
          className="mb-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
        >
          <span className="font-semibold text-navy">Design preview.</span> Invented
          sample records, local only.
        </p>
      )}

      <Suspense fallback={null}>
        <SubmissionFilters />
      </Suspense>

      {all.length === 0 ? (
        <div className="mt-12 rounded-[2rem] border border-dashed border-line bg-canvas-warm/40 px-8 py-20 text-center">
          <p className="font-display text-3xl font-light text-navy">No submissions yet.</p>
          <p className="mx-auto mt-4 max-w-md text-body">
            Applications from the website will appear here as they come in.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-12 text-body">
          Nothing matches that. <Link href="/admin" className="text-navy underline underline-offset-4">Clear the filters</Link>.
        </p>
      ) : (
        <>
          {fresh.length > 0 && (
            <>
              <GroupHeading label="New" count={fresh.length} />
              <ul className="space-y-3">
                {fresh.map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </ul>
            </>
          )}
          {rest.length > 0 && (
            <>
              <GroupHeading
                label={filtered ? "Matching" : "Everyone else"}
                count={rest.length}
              />
              <ul className="space-y-3">
                {rest.map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </PortalPage>
  );
}
