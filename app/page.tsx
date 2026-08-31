import Image from "next/image";
import Link from "next/link";
import DisciplineIcon from "@/components/discipline-icon";
import BrandStamp from "@/components/brand-stamp";
import { Button, Container, Section, SectionHeading, Arrow } from "@/components/ui";
import {
  CANDIDATE_POINTS,
  CANDIDATE_PROMISE,
  PROCESS,
  SPECIALTIES,
} from "@/lib/content";
import { listActiveJobs } from "@/lib/jobs/source";

export const revalidate = 300;

export default async function HomePage() {
  const jobs = await listActiveJobs();

  return (
    <>
      {/* ================================================================== */}
      {/*  HERO                                                              */}
      {/* ================================================================== */}
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
                Coast. Real relationships, and a team that actually knows this
                market.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Button href="/jobs" className="w-full sm:w-auto">
                  See open roles
                </Button>
                <Button href="/submit-resume" variant="outline" className="w-full sm:w-auto">
                  Submit your résumé
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

              {/* Candidate message sits high on the page, per client review. */}
              <div className="mt-4 rounded-3xl bg-navy p-7 shadow-lift sm:absolute sm:-bottom-8 sm:-left-6 sm:mt-0 sm:w-[19rem] lg:-left-10">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
                  For job seekers
                </p>
                <p className="mt-3 font-display text-[1.75rem] font-light leading-tight text-canvas">
                  {CANDIDATE_PROMISE.hook}
                </p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-navy-100">
                  {CANDIDATE_PROMISE.line}
                </p>
                <Link
                  href="/jobs"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-soft"
                >
                  Browse openings
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================== */}
      {/*  OPEN ROLES — deliberately the first thing after the hero          */}
      {/* ================================================================== */}
      <Section className="pt-20 lg:pt-28" id="jobs">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Open right now"
              title={
                <>
                  Positions we are
                  <br />
                  <em className="italic text-gold-deep">filling this week.</em>
                </>
              }
            />
            <Link
              href="/jobs"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              Search all {jobs.length} openings
              <Arrow />
            </Link>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
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

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="/jobs" className="w-full sm:w-auto">
              Search all openings
            </Button>
            <Button href="/submit-resume" variant="outline" className="w-full sm:w-auto">
              Not seeing it? Send your résumé
            </Button>
          </div>
        </Container>
      </Section>

      {/* ================================================================== */}
      {/*  BRAND STAMP                                                       */}
      {/* ================================================================== */}
      <BrandStamp />

      {/* ================================================================== */}
      {/*  WHY FIT, FOR CANDIDATES                                           */}
      {/* ================================================================== */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading
                eyebrow="For job seekers"
                title={
                  <>
                    Free to you.
                    <br />
                    <em className="italic text-gold-deep">Always has been.</em>
                  </>
                }
                body="Companies pay our fees, which means we can spend our time helping you find something that actually fits."
              />
              <div className="mt-9">
                <Button href="/submit-resume">Submit your résumé</Button>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {CANDIDATE_POINTS.map((p) => (
                <li
                  key={p.title}
                  className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-7"
                >
                  <h3 className="font-display text-xl font-normal leading-snug text-navy">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ================================================================== */}
      {/*  SPECIALTIES                                                       */}
      {/* ================================================================== */}
      <Section className="pt-0" id="specialties">
        <Container>
          <SectionHeading
            eyebrow="What we place"
            title={
              <>
                Four areas we know
                <br />
                <em className="italic text-gold-deep">inside and out.</em>
              </>
            }
            body="We do not try to fill everything. We stay in the lanes the Gulf Coast actually hires for, which is why our shortlists are short."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALTIES.map((s) => (
              <div
                key={s.title}
                className="group rounded-3xl border border-line-soft bg-canvas-warm/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas-warm hover:shadow-soft"
              >
                <div className="mb-7 text-navy-700 transition-colors group-hover:text-gold-deep">
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

      {/* ================================================================== */}
      {/*  PROCESS                                                           */}
      {/* ================================================================== */}
      <Section className="on-navy bg-navy" id="process">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading
                tone="dark"
                eyebrow="For employers"
                title={
                  <>
                    A process built on
                    <br />
                    <em className="italic text-gold">relationships.</em>
                  </>
                }
                body="We do not blast résumés. We sit down with you, learn your culture, and bring back people who already feel like part of the team."
              />
              <div className="mt-9 overflow-hidden rounded-[2rem]">
                <Image
                  src="/photos/team-01.jpg"
                  alt="A Fit Recruiting recruiter at the firm's Mobile office"
                  width={1200}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            <ol className="space-y-3">
              {PROCESS.map((p) => (
                <li
                  key={p.step}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 lg:p-9"
                >
                  <div className="flex items-baseline gap-5">
                    <span className="font-display text-4xl font-light text-gold">{p.step}</span>
                    <h3 className="font-display text-[1.75rem] font-normal leading-tight text-canvas">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-navy-100">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* ================================================================== */}
      {/*  PULL QUOTE                                                        */}
      {/* ================================================================== */}
      <Section>
        <Container>
          <figure className="grain relative overflow-hidden rounded-[2.75rem] bg-canvas-deep px-8 py-16 text-center lg:px-20 lg:py-24">
            <span aria-hidden="true" className="font-display text-7xl leading-none text-gold">
              &ldquo;
            </span>
            <blockquote className="mx-auto mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-light leading-[1.25] text-navy">
              We&rsquo;re picky on purpose. It saves everyone time, and it&rsquo;s
              why the people we send <em className="italic text-gold-deep">tend to stay.</em>
            </blockquote>
            <figcaption className="mt-10 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-navy-700">
              The Fit Recruiting Team · Mobile, Alabama
            </figcaption>
          </figure>
        </Container>
      </Section>

      {/* ================================================================== */}
      {/*  CTA                                                               */}
      {/* ================================================================== */}
      <Section className="pt-0">
        <Container>
          <div className="grid items-center gap-12 rounded-[2.75rem] bg-navy p-10 on-navy lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
            <div>
              <SectionHeading
                tone="dark"
                eyebrow="Let's talk"
                title={
                  <>
                    Hiring, or looking?
                    <br />
                    <em className="italic text-gold">Let&rsquo;s sit down.</em>
                  </>
                }
                body="Give us a call and we'll set up a time. Coffee is on us."
              />
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button href="/submit-resume" variant="gold" className="w-full sm:w-auto">
                  Submit your résumé
                </Button>
                <Link
                  href="/employers"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:border-gold hover:text-gold sm:w-auto"
                >
                  Hire with Fit
                  <Arrow />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem]">
              <Image
                src="/photos/team-03.jpg"
                alt="A Fit Recruiting recruiter at her desk in the Mobile office"
                width={1000}
                height={1250}
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
