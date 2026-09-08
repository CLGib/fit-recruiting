import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/ui";
import { PortalPage } from "@/components/admin/page-header";
import RoleEditor from "@/components/admin/role-editor";
import PublishPanel from "@/components/admin/publish-panel";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview, PREVIEW_ROLES } from "@/lib/admin/preview";
import { getRole, type Role } from "@/lib/admin/roles";
import { ROLE_STATUS_LABEL } from "@/lib/admin/role-status";
import { isBullhornConfigured } from "@/lib/bullhorn/config";

export const metadata: Metadata = { title: "Role" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const preview = isAdminPreview();

  const role: Role | null = preview
    ? ((PREVIEW_ROLES.find((r) => r.id === id) ?? null) as Role | null)
    : await getRole(id);
  if (!role) notFound();

  return (
    <PortalPage>
      <Link
        href="/admin/roles"
        className="inline-flex items-center gap-2 text-sm font-medium text-body transition-colors hover:text-navy"
      >
        <Arrow className="rotate-180" />
        All roles
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <p className="eyebrow mb-4">{ROLE_STATUS_LABEL[role.status]}</p>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-tight text-navy">
            {role.title}
          </h1>
          <p className="mt-2 text-body">
            {role.location} · {role.employment_type}
            {role.salary ? ` · ${role.salary}` : ""}
          </p>

          <div className="mt-10">
            <RoleEditor role={role} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-10 lg:self-start">
          {/* In preview the channels show as connected, because the point of the
              preview is to walk through the flow. Anywhere real, this is the
              honest answer about what the deployment can actually reach. */}
          <PublishPanel
            role={role}
            bullhornConnected={preview || isBullhornConfigured()}
          />

          <div className="mt-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7">
            <p className="eyebrow mb-3">On the website</p>
            <p className="text-[0.9375rem] leading-relaxed text-body">
              {role.status === "open" ? (
                <>
                  Candidates see this at{" "}
                  <span className="text-navy">/jobs/{role.slug}</span>.
                </>
              ) : (
                <>
                  Nothing is on the website yet. When you set this to open it
                  appears at <span className="text-navy">/jobs/{role.slug}</span>.
                </>
              )}
            </p>
          </div>
        </aside>
      </div>
    </PortalPage>
  );
}
