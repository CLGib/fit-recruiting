import type { Metadata } from "next";
import Image from "next/image";
import DisciplineIcon from "@/components/discipline-icon";
import { Button, Container, Section, SectionHeading } from "@/components/ui";
import { SPECIALTIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Fit Recruiting is a boutique recruiting firm in Mobile, Alabama, placing accounting, IT, administrative, and executive talent across the Gulf Coast.",
};

const MARKETS = [
  { place: "Mobile", note: "Our home. Downtown, midtown, west Mobile, and the port." },
  { place: "Baldwin County", note: "Spanish Fort, Daphne, Fairhope, Foley, and the beaches." },
  { place: "Mississippi Gulf Coast", note: "Pascagoula, Moss Point, and across the state line." },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">About Fit</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,5rem)] font-light leading-[1.02] tracking-tight text-navy">
              Boutique by choice,
              <br />
              <em className="italic text-gold-deep">not by size.</em>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-body">
              Fit Recruiting places accounting, information technology, office
              administration, and executive talent across the Gulf Coast. Most of
              what we do is direct hire, full-time roles with real salaries and
              real career weight. We keep our client list small enough that you
              always talk to someone who knows your name.
            </p>
          </div>
        </Container>
      </Section>

      {/* One photo, not a band. Staff portraits live on the team page so
          headshots stay in one place. */}
      <Section className="pb-0">
        <Container>
          <div className="overflow-hidden rounded-[2.5rem]">
            <Image
              src="/photos/team-02.jpg"
              alt="The owner of Fit Recruiting at the firm's Mobile office"
              width={2000}
              height={1125}
              sizes="(max-width: 1240px) 100vw, 1180px"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </Container>
      </Section>

      {/* --- Market --- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Why Fit"
            title="Where we work."
            body="We are not calling from three states away. We know these companies, these neighborhoods, and what a commute across the bay really costs you."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {MARKETS.map((m) => (
              <div
                key={m.place}
                className="rounded-3xl border border-line-soft bg-canvas-warm/60 p-9"
              >
                <h3 className="font-display text-3xl font-light leading-tight text-navy">
                  {m.place}
                </h3>
                <p className="mt-4 leading-relaxed text-body">{m.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Disciplines --- */}
      <Section className="pt-0">
        <Container>
          <SectionHeading
            eyebrow="Disciplines"
            title="What we recruit for."
            body="Four areas we know well, because knowing a field is the only honest way to judge someone working in it."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALTIES.map((s) => (
              <div
                key={s.title}
                className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-8"
              >
                <div className="mb-7 text-navy-700">
                  <DisciplineIcon title={s.title} />
                </div>
                <h3 className="font-display text-2xl font-normal leading-snug text-navy">
                  {s.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* One CTA, then the page ends. How Fit engages and how Fit works used
          to be repeated here; both live on /employers now. */}
      <Section className="pt-0">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="/for-candidates" className="w-full sm:w-auto">
              I am looking for a job
            </Button>
            <Button href="/employers" variant="outline" className="w-full sm:w-auto">
              I am hiring
            </Button>
          </div>
        </Container>
      </Section>

    </>
  );
}
