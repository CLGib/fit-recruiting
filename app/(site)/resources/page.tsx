import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";
import { withTokens } from "@/lib/site/tokens";

export const metadata: Metadata = {
  title: "Interview Guide",
  description:
    "Fit Recruiting's interview guide. How to prepare, what to bring, what to ask, and how to follow up, written by the recruiters who sit on the other side of the table.",
};

/** Each guide section stores its points one per line. */
const toPoints = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function Bullets({ items, light = false }: { items: string[]; light?: boolean }) {
  return (
    <ul className={light ? "mt-6 space-y-3.5" : "mt-6 space-y-4"}>
      {items.map((item, i) => (
        <li key={i} className={`flex gap-4 leading-relaxed ${light ? "text-navy-100" : "text-body"}`}>
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-line-soft bg-canvas-warm/50 p-8 lg:p-10">
      <h2 className="font-display text-3xl font-light text-navy">{title}</h2>
      <Bullets items={items} />
    </section>
  );
}

export default async function ResourcesPage() {
  const { guide: c } = await getCopy();

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
            <a
              href="/fit-interview-guide.pdf"
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-navy/25 px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas"
            >
              {c.pdfButton}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v13M7 12l5 5 5-5M4 21h16" />
              </svg>
            </a>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {c.sections.map((s, i) => (
              <Panel key={i} title={s.title} items={toPoints(s.points)} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="on-navy bg-navy pt-0 lg:pt-0">
        <div className="py-20 lg:py-28">
          <Container>
            <SectionHeading
              tone="dark"
              eyebrow={c.questionsEyebrow}
              title={
                <>
                  {c.questionsTitle}
                  <br />
                  <em className="italic text-gold">{c.questionsTitleAccent}</em>
                </>
              }
            />
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 lg:p-10">
                <h3 className="font-display text-2xl font-normal text-canvas">{c.theyAskHeading}</h3>
                <p className="mt-2 text-sm italic text-navy-100">{c.theyAskNote}</p>
                <Bullets items={c.theyAsk} light />
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 lg:p-10">
                <h3 className="font-display text-2xl font-normal text-canvas">{c.youAskHeading}</h3>
                <p className="mt-2 text-sm italic text-navy-100">{c.youAskNote}</p>
                <Bullets items={c.youAsk} light />
              </div>
            </div>
          </Container>
        </div>
      </Section>

      <Section className="pt-0">
        <Container>
          <Panel title={c.closingHeading} items={c.closing} />

          {/* The guide ends with one line and a link, not another full
              section. Once someone has the information they came for, a large
              closing panel is just page filler. */}
          <p className="mt-12 leading-relaxed text-body">
            {withTokens(c.endText, {
              link: (
                <a
                  href="/submit-resume"
                  className="font-semibold text-navy underline underline-offset-4 transition-colors hover:text-gold-deep"
                >
                  {c.endLink}
                </a>
              ),
            })}
          </p>
        </Container>
      </Section>
    </>
  );
}
