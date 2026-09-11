import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import {
  ContactForm,
  HomeForm,
  IntroForm,
  SpecialtiesForm,
  TeamPageForm,
} from "@/components/admin/website/content-forms";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview } from "@/lib/admin/preview";
import { getContentMeta, getSiteContent } from "@/lib/site/content";

export const metadata: Metadata = { title: "Pages & contact" };

// Always the live values: this is the page people edit them on.
export const dynamic = "force-dynamic";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-12 first:mt-0">
      <h2 className="eyebrow mb-4">{label}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export default async function WebsitePage() {
  await requireAdmin();
  const [content, meta] = await Promise.all([getSiteContent(), getContentMeta()]);

  return (
    <PortalPage>
      <PageHeader
        eyebrow="Team portal"
        title="Your website."
        intro={
          <>
            Change the words, numbers and details on the public site. Saving puts
            a change live straight away. Job postings are edited under{" "}
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
          <span className="font-semibold text-navy">Design preview.</span> You
          can try every field, but nothing is saved.
        </p>
      )}

      <Group label="Everywhere">
        <ContactForm initial={content.contact} meta={meta.contact} />
      </Group>

      <Group label="Homepage">
        <HomeForm initial={content.home} meta={meta.home} />
      </Group>

      <Group label="About page">
        <IntroForm
          contentKey="about"
          title="About introduction"
          description="The paragraph under the About page headline."
          viewHref="/about"
          initial={content.about}
          meta={meta.about}
        />
        <SpecialtiesForm initial={content.specialties} meta={meta.specialties} />
      </Group>

      <Group label="For Employers page">
        <IntroForm
          contentKey="employers"
          title="For Employers introduction"
          description="The paragraph under the For Employers headline."
          viewHref="/employers"
          initial={content.employers}
          meta={meta.employers}
        />
      </Group>

      <Group label="Team page">
        <TeamPageForm initial={content.team_page} meta={meta.team_page} />
      </Group>
    </PortalPage>
  );
}
