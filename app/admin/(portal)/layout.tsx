import type { Metadata } from "next";
import PortalNav from "@/components/admin/portal-nav";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = {
  // Nothing under the portal is ever indexed or followed.
  robots: { index: false, follow: false },
};

/**
 * The signed-in half of /admin.
 *
 * The guard runs here so every page in the group is covered by default rather
 * than by each author remembering. Pages still call requireAdmin() themselves
 * for the address, and server actions call it again — a layout does not run
 * for a direct action POST.
 */
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await requireAdmin();

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <PortalNav email={email} />
      <div className="min-w-0 flex-1">
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
