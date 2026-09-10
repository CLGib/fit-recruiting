import Image from "next/image";
import Link from "next/link";
import { Button, Container, Section, Arrow } from "@/components/ui";
import { BRAND_STAMP } from "@/lib/content";
import { listActiveJobs } from "@/lib/jobs/source";

export const revalidate = 300;

/**
 * The homepage.
 *
 * Cut back hard on the client's instruction (2026-09-10). It previously tried
 * to introduce the firm, sell candidates, list specialties, explain the
 * employer process and close twice, which meant a lot of scrolling and eight
 * separate taglines. It now does three things: says who Fit is, shows what is
 * open, and says what makes them different. Selling candidates happens on
 * /for-candidates and the process lives on /employers, each said once.
 */
export default async function HomePage() {
  const jobs = await listActiveJobs();

  return (
    <>
      <section className="grain relative overflow-hidden pt-2 pb-16 sm:pt-8 lg:pt-14 lg:pb-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="rise">
              <p className="eyebrow mb-5">Mobile, Alabama · Gulf Coast</p>
              <h1 className="font-display text-[clamp(2.75rem,7.5vw,5.75rem)] font-light leading-[1.06] tracking-tight text-navy sm:leading-[0.98]">
                The right people,
                <br />
                the <em className="italic text-gold-deep">right fit.</em>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-body">
                A boutique recruiting firm placing accounting, IT, administrative,
                and executive talent across Mobile, Baldwin County, and the Gulf
                Coast. We have met these employers and walked into their offices,
                which is why our shortlists are short.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Button href="/for-candidates" className="w-full sm:w-auto">
                  I am looking for a job
                </Button>
                <Button href="/employers" variant="outline" className="w-full sm:w-auto">
                  I am hiring
                </Button>
              </div>
            </div>

            <div className="rise relative" style={{ animationDelay: "120ms" }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem] bg-canvas-warm">
                <Image
                  src="/photos/team-02.jpg"
                  alt="The owner of Fit Recruiting at the firm's Mobile, Alabama office"
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
              Open this week
            </h2>
            <Link
              href="/jobs"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              Search all {jobs.length} openings
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
              Not seeing it? Send your résumé
            </Button>
          </div>
        </Container>
      </Section>

      {/* Local. Trusted. Connected. — the one piece of positioning on the page. */}
      <Section className="on-navy bg-navy">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <h2 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-light leading-[1.06] tracking-tight text-canvas lg:sticky lg:top-32 lg:self-start">
              {BRAND_STAMP.map((word) => (
                <span key={word} className="block">
                  {word}
                </span>
              ))}
            </h2>

            <dl className="grid gap-8 sm:grid-cols-2">
              <div>
                <dt className="font-display text-2xl font-normal text-gold">Local</dt>
                <dd className="mt-3 leading-relaxed text-navy-100">
                  We live here. Every placement we make is on the Gulf Coast, and
                  we know which companies people stay at.
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-normal text-gold">Trusted</dt>
                <dd className="mt-3 leading-relaxed text-navy-100">
                  Reference checks, background checks, skills testing. We would
                  rather tell a client a role is hard to fill than send filler.
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-normal text-gold">Connected</dt>
                <dd className="mt-3 leading-relaxed text-navy-100">
                  A good portion of what we fill never reaches a job board.
                  Knowing us is how people hear about those roles.
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-normal text-gold">Free to you</dt>
                <dd className="mt-3 leading-relaxed text-navy-100">
                  If you are looking for work, our fees are paid by the companies
                  hiring. You are never charged.
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grain flex flex-col items-start gap-6 rounded-[2.75rem] bg-canvas-deep px-8 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-14">
            <div>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-tight tracking-tight text-navy">
                Hiring, or looking?
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-body">
                Give us a call and we will set up a time.
              </p>
            </div>
            <Button href="/contact" className="shrink-0">
              Get in touch
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
