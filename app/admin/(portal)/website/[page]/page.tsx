import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/ui";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import PageEditor from "@/components/admin/website/page-editor";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview } from "@/lib/admin/preview";
import { isPageKey, pageDef } from "@/lib/site/copy";
import { getCopy, getCopyMeta } from "@/lib/site/copy/read";

// Always the live values: this is the page people edit them on.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { page } = await params;
  return { title: isPageKey(page) ? pageDef(page).label : "Page" };
}

export default async function EditPage({ params }: Params) {
  await requireAdmin();
  const { page } = await params;
  if (!isPageKey(page)) notFound();

  const def = pageDef(page);
  const [copy, meta] = await Promise.all([getCopy(), getCopyMeta()]);

  return (
    <PortalPage>
      <Link
        href="/admin/website"
        className="inline-flex items-center gap-2 text-sm font-medium text-body transition-colors hover:text-navy"
      >
        <Arrow className="rotate-180" />
        All pages
      </Link>

      <div className="mt-8">
        <PageHeader
          title={`${def.label}.`}
          intro={
            <>
              {def.description}{" "}
              <Link
                href={def.path}
                target="_blank"
                className="font-medium text-navy underline underline-offset-4 hover:text-gold-deep"
              >
                View it on the website
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
              .
            </>
          }
        />
      </div>

      {isAdminPreview() && (
        <p
          role="status"
          className="mb-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
        >
          <span className="font-semibold text-navy">Design preview.</span> You can
          try every field, but nothing is saved.
        </p>
      )}

      <PageEditor pageKey={page} values={copy[page] as Record<string, unknown>} meta={meta} />
    </PortalPage>
  );
}
