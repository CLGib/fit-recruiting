import Image from "next/image";
import Link from "next/link";
import { Button, Container, Section, Arrow } from "@/components/ui";
import { listActiveJobs } from "@/lib/jobs/source";
import { getCopy } from "@/lib/site/copy/read";
import { fill } from "@/lib/site/format";

export const revalidate = 300;

/**
 * The homepage: who Fit is, what is open, and what makes them different.
 * Every word is editable in the portal (Website → Pages → Homepage).
 */
export default async function HomePage() {
  const [jobs, { home: c }] = await Promise.all([listActiveJobs(), getCopy()]);

  return (
    <>
      <section className="grain relative overflow-hidden pt-2 pb-16 sm:pt-8 lg:pt-14 lg:pb-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="rise">
              <p className="eyebrow mb-5">{c.heroEyebrow}</p>
              <h1 className="font-display text-[clamp(2.75rem,7.5vw,5.75rem)] font-light leading-[1.06] tracking-tight text-navy sm:leading-[0.98]">
                {c.heroTitle}
                <br />
                <em className="italic text-gold-deep">{c.heroTitleAccent}</em>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-body">{c.heroIntro}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Button href="/for-candidates" className="w-full sm:w-auto">
                  {c.heroButtonCandidates}
                </Button>
                <Button href="/employers" variant="outline" className="w-full sm:w-auto">
                  {c.heroButtonEmployers}
                </Button>
              </div>
            </div>

            <div className="rise relative" style={{ animationDelay: "120ms" }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem] bg-canvas-warm">
                <Image
                  src={c.heroImage.src}
                  alt={c.heroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Open roles lead, because this is what job seekers came for. */}
      <Section className="pt-16 lg:pt-24" id="jobs">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-tight text-navy">
              {c.jobsHeading}
            </h2>
            <Link
              href="/jobs"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              {fill(c.jobsLink, { count: jobs.length })}
              <Arrow />
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {jobs.slice(0, 6).map((job) => (
              <li key={job.slug}>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="group flex h-full items-center gap-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas-warm hover:shadow-soft lg:p-7"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[1.5rem] font-normal leading-tight text-navy transition-colors group-hover:text-gold-deep">
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

          <div className="mt-10">
            <Button href="/submit-resume" variant="outline">
              {c.jobsButton}
            </Button>
          </div>
        </Container>
      </Section>

      <Section className="on-navy bg-navy">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <h2 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-light leading-[1.06] tracking-tight text-canvas lg:sticky lg:top-32 lg:self-start">
              {c.stampWords.map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </h2>

            <dl className="grid gap-8 sm:grid-cols-2">
              {c.pillars.map((p, i) => (
                <div key={i}>
                  <dt className="font-display text-2xl font-normal text-gold">{p.title}</dt>
                  <dd className="mt-3 leading-relaxed text-navy-100">{p.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grain flex flex-col items-start gap-6 rounded-[2.75rem] bg-canvas-deep px-8 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-14">
            <div>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-tight tracking-tight text-navy">
                {c.ctaHeading}
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-body">{c.ctaBody}</p>
            </div>
            <Button href="/contact" className="shrink-0">
              {c.ctaButton}
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
