import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Container, Section } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";
import { mapEmbedUrl, phoneHref } from "@/lib/site/format";

// Built from the editable contact details, so a changed phone number reaches
// the search snippet as well as the page.
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getCopy();
  return {
    title: "Contact",
    description: `Get in touch with Fit Recruiting at ${site.street}, ${site.city}. Call ${site.phone} or email ${site.email}. By appointment only.`,
  };
}

export default async function ContactPage() {
  const { contact: c, site } = await getCopy();

  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <p className="eyebrow mb-5">{c.eyebrow}</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,4.75rem)] font-light leading-[1.02] tracking-tight text-navy">
              {c.title}
              <br />
              <em className="italic text-gold-deep">{c.titleAccent}</em>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-body">{c.intro}</p>
            <p className="mt-5 rounded-2xl border border-line-soft bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body">
              <span className="font-semibold text-navy">{c.appointmentLead}</span> {c.appointmentBody}
            </p>

            <dl className="mt-12 space-y-8">
              <div>
                <dt className="eyebrow mb-2">{c.officeLabel}</dt>
                <dd className="font-display text-2xl font-light text-navy">
                  <address className="not-italic">
                    {site.street}
                    <br />
                    {site.city}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">{c.phoneLabel}</dt>
                <dd className="font-display text-2xl font-light">
                  <a
                    href={`tel:${phoneHref(site.phone)}`}
                    className="text-navy underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
                  >
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">{c.emailLabel}</dt>
                <dd className="font-display text-2xl font-light">
                  <a
                    href={`mailto:${site.email}`}
                    className="text-navy underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* --- Two doors --- */}
          <div className="space-y-5">
            <Link
              href="/submit-resume"
              className="group block rounded-[2rem] border border-line-soft bg-canvas-warm/60 p-9 transition-all hover:-translate-y-1 hover:border-line hover:shadow-soft"
            >
              <p className="eyebrow mb-4">{c.candidateEyebrow}</p>
              <h2 className="font-display text-3xl font-light text-navy group-hover:text-gold-deep">{c.candidateTitle}</h2>
              <p className="mt-4 leading-relaxed text-body">{c.candidateBody}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                {c.candidateLink}
                <Arrow />
              </span>
            </Link>

            <a
              href={`mailto:${site.email}?subject=New%20job%20order`}
              className="group block rounded-[2rem] bg-navy p-9 transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">{c.hiringEyebrow}</p>
              <h2 className="font-display text-3xl font-light text-canvas">{c.hiringTitle}</h2>
              <p className="mt-4 leading-relaxed text-navy-100">{c.hiringBody}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                {c.hiringLink}
                <Arrow />
              </span>
            </a>

            {/* Built from the editable address. Hardcoded, the map kept showing
                the old office after the address was changed in the portal. */}
            <div className="overflow-hidden rounded-[2rem] border border-line-soft">
              <iframe
                title={`Map showing Fit Recruiting at ${site.street}, ${site.city}`}
                src={mapEmbedUrl(site.street, site.city)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
