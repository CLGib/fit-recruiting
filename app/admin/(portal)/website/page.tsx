import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview } from "@/lib/admin/preview";
import { PAGE_KEYS, PAGES } from "@/lib/site/copy";
import { getCopyMeta } from "@/lib/site/copy/read";

export const metadata: Metadata = { title: "Pages" };

// Always current: this is where people come to see what has changed.
export const dynamic = "force-dynamic";

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function WebsitePages() {
  await requireAdmin();
  const meta = await getCopyMeta();

  const lastChanged = (page: string) =>
    Object.entries(meta)
      .filter(([k]) => k.startsWith(`${page}.`))
      .map(([, m]) => m)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  return (
    <PortalPage>
      <PageHeader
        eyebrow="Team portal"
        title="Your website."
        intro={
          <>
            Every word on the public site, page by page. Saving puts a change live
            straight away, and any section can be put back to its original
            wording. Job postings are edited under{" "}
            <Link href="/admin/roles" className="font-medium text-navy underline underline-offset-4">
              Roles
            </Link>
            .
          </>
        }
      />

      {isAdminPreview() && (
        <p
          role="status"
          className="mb-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
        >
          <span className="font-semibold text-navy">Design preview.</span> You can
          try every field, but nothing is saved.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {PAGE_KEYS.map((key) => {
          const page = PAGES[key];
          // The team's copy sits with the people on one page.
          const href = key === "team" ? "/admin/website/team" : `/admin/website/${key}`;
          const changed = lastChanged(key);
          return (
            <li key={key}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7 transition-all hover:border-line hover:bg-canvas-warm"
              >
                <h2 className="font-display text-2xl font-normal text-navy transition-colors group-hover:text-gold-deep">
                  {page.label}
                </h2>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-body">{page.description}</p>
                <p className="mt-5 text-xs text-body">
                  {changed ? `Last changed ${when(changed.updated_at)}` : "Original wording"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </PortalPage>
  );
}
