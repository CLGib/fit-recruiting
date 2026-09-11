import type { Metadata } from "next";
import Image from "next/image";
import DisciplineIcon from "@/components/discipline-icon";
import { Button, Container, Section, SectionHeading } from "@/components/ui";
import { isSpecialtyIcon } from "@/lib/site/copy/icons";
import { getCopy } from "@/lib/site/copy/read";

export const metadata: Metadata = {
  title: "About",
  description:
    "Fit Recruiting is a boutique recruiting firm in Mobile, Alabama, placing accounting, IT, administrative, and executive talent across the Gulf Coast.",
};

export default async function AboutPage() {
  const { about: c } = await getCopy();

  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">{c.eyebrow}</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,5rem)] font-light leading-[1.02] tracking-tight text-navy">
              {c.title}
              <br />
              <em className="italic text-gold-deep">{c.titleAccent}</em>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-body">{c.intro}</p>
          </div>
        </Container>
      </Section>

      {/* One photo, not a band. Staff portraits live on the team page so
          headshots stay in one place. */}
      <Section className="pb-0">
        <Container>
          <div className="overflow-hidden rounded-[2.5rem]">
            <Image
              src={c.bannerImage.src}
              alt={c.bannerImage.alt}
              width={2000}
              height={1125}
              sizes="(max-width: 1240px) 100vw, 1180px"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow={c.marketsEyebrow} title={c.marketsTitle} body={c.marketsBody} />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {c.markets.map((m, i) => (
              <div key={i} className="rounded-3xl border border-line-soft bg-canvas-warm/60 p-9">
                <h3 className="font-display text-3xl font-light leading-tight text-navy">{m.place}</h3>
                <p className="mt-4 leading-relaxed text-body">{m.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <SectionHeading eyebrow={c.specialtiesEyebrow} title={c.specialtiesTitle} body={c.specialtiesBody} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.specialties.map((s, i) => (
              <div key={i} className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-8">
                {isSpecialtyIcon(s.icon) && s.icon !== "none" && (
                  <div className="mb-7 text-navy-700">
                    <DisciplineIcon icon={s.icon} />
                  </div>
                )}
                <h3 className="font-display text-2xl font-normal leading-snug text-navy">{s.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* One CTA, then the page ends. How Fit engages and how Fit works live on
          /employers, said once. */}
      <Section className="pt-0">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="/for-candidates" className="w-full sm:w-auto">
              {c.buttonCandidates}
            </Button>
            <Button href="/employers" variant="outline" className="w-full sm:w-auto">
              {c.buttonEmployers}
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
