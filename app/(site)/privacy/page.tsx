import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";
import { phoneHref } from "@/lib/site/format";
import { withTokens } from "@/lib/site/tokens";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Fit Recruiting collects, stores, and uses the information you send us.",
};

/**
 * DRAFT. Describes the data practices this site actually implements, so it is
 * accurate rather than boilerplate. It has NOT been reviewed by counsel.
 * TODO(chambliss): have an attorney review before launch.
 */
export default async function PrivacyPage() {
  const { privacy: c, site } = await getCopy();
  const link = "font-medium text-navy underline underline-offset-4 hover:text-gold-deep";

  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">{c.eyebrow}</p>
          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] font-light leading-[1.03] tracking-tight text-navy">
            {c.title}
            <br />
            <em className="italic text-gold-deep">{c.titleAccent}</em>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-body">{c.intro}</p>

          <div className="mt-14 space-y-12">
            {c.sections.map((s, i) => (
              <section key={i}>
                <h2 className="font-display text-3xl font-light text-navy">{s.title}</h2>
                <div className="mt-5 space-y-4">
                  {s.body
                    .split("\n")
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, j) => (
                      <p key={j} className="leading-relaxed text-body">
                        {p}
                      </p>
                    ))}
                </div>
              </section>
            ))}

            <section className="rounded-[2rem] border border-line-soft bg-canvas-warm/60 p-8">
              <h2 className="font-display text-2xl font-normal text-navy">{c.contactHeading}</h2>
              <p className="mt-4 leading-relaxed text-body">
                {withTokens(c.contactBody, {
                  email: (
                    <a href={`mailto:${site.email}`} className={link}>
                      {site.email}
                    </a>
                  ),
                  phone: (
                    <a href={`tel:${phoneHref(site.phone)}`} className={link}>
                      {site.phone}
                    </a>
                  ),
                  address: `${site.street}, ${site.city}`,
                })}
              </p>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
