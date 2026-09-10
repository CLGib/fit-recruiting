import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Button, Container, Section } from "@/components/ui";
import { listActiveJobs } from "@/lib/jobs/source";

export const metadata: Metadata = {
  title: "For Candidates",
  description:
    "Open roles on the Gulf Coast, a free résumé review, and an interview guide. Working with Fit Recruiting never costs you anything.",
};

export const revalidate = 300;

/**
 * The single front door for job seekers.
 *
 * Added at the client's request: candidates previously had four separate
 * navigation items and no obvious first click. Everything here still has its
 * own page and URL; this page's only job is to make the choice obvious and then
 * get out of the way, so it stays deliberately short.
 */
const PATHS = [
  {
    href: "/submit-resume",
    label: "Send us your résumé",
    body: "A recruiter here in Mobile reads it. A good portion of what we fill never reaches a job board, so this is how you hear about those.",
  },
  {
    href: "/resume-audit",
    label: "Get your résumé reviewed, free",
    body: "Upload it and get written notes back in about a minute on what to change. No account, and we do not keep the file.",
  },
  {
    href: "/resources",
    label: "Read the interview guide",
    body: "What to bring, what to ask, and the questions worth rehearsing before you walk in.",
  },
];

export default async function ForCandidatesPage() {
  const jobs = await listActiveJobs();

  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">For candidates</p>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1.05] tracking-tight text-navy">
              Start here.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-body">
              Working with us never costs you anything. Companies pay our fees.
              Below is everything open right now, and three ways we can help
              whether or not one of them is right for you.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="pt-16 lg:pt-20">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-tight tracking-tight text-navy">
              Open roles
            </h2>
            <Link
              href="/jobs"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              Search all {jobs.length}
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
            {PATHS.map((path) => (
              <li key={path.href}>
                <Link
                  href={path.href}
                  className="group flex h-full flex-col rounded-3xl border border-line-soft bg-canvas-warm/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas-warm hover:shadow-soft"
                >
                  <h2 className="font-display text-2xl font-normal leading-snug text-navy transition-colors group-hover:text-gold-deep">
                    {path.label}
                  </h2>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-body">
                    {path.body}
                  </p>
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
              Rather just talk to someone?
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-navy-100">
              Call the office and we will set up a time. Appointments only, so
              whoever you meet has read your résumé first.
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="gold">
                Get in touch
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
