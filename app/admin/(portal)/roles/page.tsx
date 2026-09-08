import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/ui";
import { GroupHeading, PageHeader, PortalPage } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview, PREVIEW_ROLES } from "@/lib/admin/preview";
import { listRoles, type Role } from "@/lib/admin/roles";
import { ROLE_STATUS_LABEL, type RoleStatus } from "@/lib/admin/role-status";

export const metadata: Metadata = { title: "Roles" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

function Row({ r }: { r: Role }) {
  const channels = [
    r.status === "open" ? "Website" : null,
    r.bullhorn_job_order_id ? "Bullhorn" : null,
    r.linkedin_urn ? "LinkedIn" : null,
  ].filter(Boolean);

  return (
    <li>
      <Link
        href={`/admin/roles/${r.id}`}
        className="group flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line-soft bg-canvas-warm/50 px-6 py-5 transition-all hover:border-line hover:bg-canvas-warm"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.3rem] font-normal leading-tight text-navy transition-colors group-hover:text-gold-deep">
            {r.title}
          </h3>
          <p className="mt-1 text-sm text-body">
            {r.location} · {r.employment_type}
            {channels.length > 0 && ` · on ${channels.join(", ")}`}
            {!r.summary && " · no description yet"}
          </p>
        </div>
        <span className="rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-medium text-navy-700">
          {ROLE_STATUS_LABEL[r.status] ?? r.status}
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

export default async function RolesPage() {
  await requireAdmin();
  const preview = isAdminPreview();
  const roles: Role[] = preview ? (PREVIEW_ROLES as Role[]) : await listRoles();

  const groups: { label: string; status: RoleStatus }[] = [
    { label: "Open", status: "open" },
    { label: "Drafts", status: "draft" },
    { label: "Closed", status: "closed" },
  ];

  return (
    <PortalPage>
      <PageHeader
        eyebrow="Team portal"
        title="Roles."
        intro={
          <>
            Everything Fit is working on. Take the brief down while you are on
            the phone, have the description written from your notes, then decide
            where it goes: the website, Bullhorn, and LinkedIn.
          </>
        }
        actions={
          <Link
            href="/admin/roles/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
          >
            Add a role
          </Link>
        }
      />

      {preview && (
        <p
          role="status"
          className="mb-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
        >
          <span className="font-semibold text-navy">Design preview.</span> Invented
          sample roles, local only.
        </p>
      )}

      {roles.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-line bg-canvas-warm/40 px-8 py-20 text-center">
          <p className="font-display text-3xl font-light text-navy">No roles yet.</p>
          <p className="mx-auto mt-4 max-w-md text-body">
            Add the first one and the website job board fills itself in.
          </p>
        </div>
      ) : (
        groups.map(({ label, status }) => {
          const rows = roles.filter((r) => r.status === status);
          if (rows.length === 0) return null;
          return (
            <div key={status}>
              <GroupHeading label={label} count={rows.length} />
              <ul className="space-y-3">
                {rows.map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </ul>
            </div>
          );
        })
      )}
    </PortalPage>
  );
}
