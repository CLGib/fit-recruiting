import type { Metadata } from "next";
import { Button, Container, Section, SectionHeading } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";
import { fill, phoneHref } from "@/lib/site/format";

export const metadata: Metadata = {
  title: "For Employers",
  description:
    "Hire with Fit Recruiting. A short list of screened, genuinely qualified candidates from a boutique firm that knows the Gulf Coast market.",
};

export default async function EmployersPage() {
  const { employers: c, site } = await getCopy();

  return (
    <>
      <Section className="pt-14 lg:pt-20">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">{c.eyebrow}</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,4.75rem)] font-light leading-[1.06] tracking-tight text-navy sm:leading-[1.02]">
              {c.title}
              <br />
              <em className="italic text-gold-deep">{c.titleAccent}</em>
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-body">{c.intro}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button href="/contact" className="w-full sm:w-auto">
                {c.heroButton}
              </Button>
              <a
                href={`tel:${phoneHref(site.phone)}`}
                className="inline-flex w-full items-center justify-center rounded-full border border-navy/25 px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas sm:w-auto"
              >
                {fill(c.callButton, { phone: site.phone })}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Screening --- */}
      <Section className="on-navy bg-navy">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <SectionHeading tone="dark" eyebrow={c.screeningEyebrow} title={c.screeningTitle} body={c.screeningBody} />

            <ul className="grid gap-4 sm:grid-cols-2">
              {c.screening.map((item, i) => (
                <li key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[0.9375rem] text-canvas">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* --- Process --- */}
      <Section>
        <Container>
          <SectionHeading eyebrow={c.processEyebrow} title={c.processTitle} body={c.processBody || undefined} />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.steps.map((p, i) => (
              <li key={i} className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-8">
                <span className="font-display text-4xl font-light text-navy-700">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-xl font-normal leading-snug text-navy">{p.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{p.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* --- Models. The first is highlighted: direct hire is most of the work. --- */}
      <Section className="pt-0">
        <Container>
          <SectionHeading eyebrow={c.engagementEyebrow} title={c.engagementTitle} body={c.engagementBody} />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {c.models.map((m, i) => {
              const primary = i === 0;
              return (
                <div key={i} className={`rounded-3xl p-9 ${primary ? "bg-gold" : "border border-line-soft bg-canvas-warm/50"}`}>
                  <h3 className={`font-display text-2xl font-normal ${primary ? "text-ink" : "text-navy"}`}>{m.title}</h3>
                  <p className={`mt-4 leading-relaxed ${primary ? "text-ink/80" : "text-body"}`}>{m.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-[2.5rem] bg-navy px-8 py-14 text-center on-navy lg:px-16">
            <h2 className="mx-auto max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-canvas">
              {c.closingHeading}
            </h2>
            <div className="mt-9 flex justify-center">
              <Button href="/contact" variant="gold">
                {c.closingButton}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
