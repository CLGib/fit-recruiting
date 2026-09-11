import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Button, Container, Section } from "@/components/ui";
import { listActiveJobs } from "@/lib/jobs/source";
import { getCopy } from "@/lib/site/copy/read";
import { fill } from "@/lib/site/format";

export const metadata: Metadata = {
  title: "For Candidates",
  description:
    "Open roles on the Gulf Coast, a free résumé review, and an interview guide. Working with Fit Recruiting never costs you anything.",
};

export const revalidate = 300;

/**
 * The single front door for job seekers. Its only job is to make the choice
 * obvious and get out of the way, so it stays deliberately short. Each card's
 * destination is fixed here; its words are Fit's to edit.
 */
export default async function ForCandidatesPage() {
  const [jobs, { candidates: c }] = await Promise.all([listActiveJobs(), getCopy()]);

  const paths = [
    { href: "/submit-resume", label: c.submitTitle, body: c.submitBody },
    { href: "/resume-audit", label: c.auditTitle, body: c.auditBody },
    { href: "/resources", label: c.guideTitle, body: c.guideBody },
  ];

  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">{c.eyebrow}</p>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1.05] tracking-tight text-navy">
              {c.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-body">{c.intro}</p>
          </div>
        </Container>
      </Section>

      <Section className="pt-16 lg:pt-20">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-tight tracking-tight text-navy">
              {c.rolesHeading}
            </h2>
            <Link
              href="/jobs"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              {fill(c.rolesLink, { count: jobs.length })}
              <Arrow />
            </Link>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {jobs.slice(0, 6).map((job) => (
              <li key={job.slug}>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="group flex h-full items-center gap-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas-warm hover:shadow-soft"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[1.4rem] font-normal leading-tight text-navy transition-colors group-hover:text-gold-deep">
                      {job.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-body">
                      {job.location} · {job.type}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-navy transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
                  >
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="pt-16 lg:pt-20">
        <Container>
          <ul className="grid gap-4 lg:grid-cols-3">
            {paths.map((path) => (
              <li key={path.href}>
                <Link
                  href={path.href}
                  className="group flex h-full flex-col rounded-3xl border border-line-soft bg-canvas-warm/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas-warm hover:shadow-soft"
                >
                  <h2 className="font-display text-2xl font-normal leading-snug text-navy transition-colors group-hover:text-gold-deep">
                    {path.label}
                  </h2>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-body">{path.body}</p>
                  <span
                    aria-hidden="true"
                    className="mt-6 flex h-11 w-11 items-center justify-center rounded-full border border-line text-navy transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
                  >
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-[2.5rem] bg-navy on-navy p-10 lg:p-14">
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-tight tracking-tight text-canvas">
              {c.talkHeading}
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-navy-100">{c.talkBody}</p>
            <div className="mt-8">
              <Button href="/contact" variant="gold">
                {c.talkButton}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
