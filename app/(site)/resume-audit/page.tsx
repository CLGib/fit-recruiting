import type { Metadata } from "next";
import Link from "next/link";
import ResumeAudit from "@/components/resume-audit";
import { Arrow, Container, Section } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";

export const metadata: Metadata = {
  title: "Free résumé review",
  description:
    "Upload your résumé and get written notes back in about a minute on what to change. Free, no account, and we do not keep a copy.",
};

/**
 * Says, before the upload box, exactly what comes back, how long it takes,
 * that it is free, that nothing is stored, and where to go for a person. The
 * earlier "have your résumé read" framing read like a promise that Fit itself
 * would read it, which is what confused the client.
 */
export default async function ResumeAuditPage() {
  const { audit: c } = await getCopy();

  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5">{c.eyebrow}</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1.05] tracking-tight text-navy">
            {c.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-body">{c.intro}</p>

          <ul className="mt-8 space-y-2 leading-relaxed text-body">
            {c.points.map((p, i) => (
              <li key={i}>
                <span className="font-semibold text-navy">{p.lead}</span> {p.body}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ResumeAudit
              copy={{
                formHint: c.formHint,
                formButton: c.formButton,
                resultImpression: c.resultImpression,
                resultWorking: c.resultWorking,
                resultFixes: c.resultFixes,
                resultTry: c.resultTry,
                resultMissing: c.resultMissing,
                resultLayout: c.resultLayout,
                resultPersonHeading: c.resultPersonHeading,
                resultPersonBody: c.resultPersonBody,
                resultPersonButton: c.resultPersonButton,
                resultNotKept: c.resultNotKept,
              }}
            />
          </div>

          <div className="mt-14 rounded-[2rem] border border-line-soft bg-canvas-warm/50 p-8">
            <h2 className="font-display text-2xl font-normal text-navy">{c.personHeading}</h2>
            <p className="mt-3 leading-relaxed text-body">{c.personBody}</p>
            <Link
              href="/submit-resume"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              {c.personLink}
              <Arrow />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
