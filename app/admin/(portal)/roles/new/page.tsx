import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/ui";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import NewRoleForm from "@/components/admin/new-role-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Add a role" };

export const dynamic = "force-dynamic";

export default async function NewRolePage() {
  await requireAdmin();

  return (
    <PortalPage>
      <Link
        href="/admin/roles"
        className="inline-flex items-center gap-2 text-sm font-medium text-body transition-colors hover:text-navy"
      >
        <Arrow className="rotate-180" />
        All roles
      </Link>

      <div className="mt-8">
        <PageHeader
          title="Add a role."
          intro={
            <>
              Just enough to get it on the board. The description comes next, and
              nothing goes on the website until you set the role to open.
            </>
          }
        />
        <div className="max-w-2xl">
          <NewRoleForm />
        </div>
      </div>
    </PortalPage>
  );
}
