import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, Container, Section } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";
import { phoneHref } from "@/lib/site/format";
import { withTokens } from "@/lib/site/tokens";
import { getJob, listActiveJobs } from "@/lib/jobs/source";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

// dynamicParams stays on (the default) so a role added after the last build
// still renders on first request rather than 404ing.
export async function generateStaticParams() {
  const jobs = await listActiveJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Role not found" };
  return {
    title: job.title,
    description:
      job.summary ??
      `${job.title}. ${job.type} in ${job.location}. Placed by Fit Recruiting.`,
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function JobDetailPage({ params }: Params) {
  const { jobs: c, site: contact } = await getCopy();
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job || job.status !== "active") notFound();

  const related = (await listActiveJobs())
    .filter((j) => j.slug !== job.slug && j.categories.some((c) => job.categories.includes(c)))
    .slice(0, 3);

  return (
    <Section className="pt-10 lg:pt-14">
      <Container>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-body transition-colors hover:text-navy"
        >
          <Arrow className="rotate-180" />
          {c.backLink}
        </Link>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          {/* --- Main --- */}
          <article>
            <ul className="flex flex-wrap gap-2">
              {job.categories.map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-medium text-navy-700"
                >
                  {c}
                </li>
              ))}
            </ul>

            <h1 className="mt-6 font-display text-[clamp(2.5rem,5.5vw,4rem)] font-light leading-[1.03] tracking-tight text-navy">
              {job.title}
            </h1>
            <p className="mt-4 text-lg text-body">
              {job.location} · {job.type}
            </p>

            {job.summary ? (
              <p className="mt-8 text-lg leading-relaxed text-body">{job.summary}</p>
            ) : (
              <p className="mt-8 text-lg leading-relaxed text-body">{c.noSummary}</p>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-3xl font-light text-navy">{c.responsibilitiesHeading}</h2>
                <ul className="mt-6 space-y-3">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex gap-4 leading-relaxed text-body">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-3xl font-light text-navy">{c.requirementsHeading}</h2>
                <ul className="mt-6 space-y-3">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex gap-4 leading-relaxed text-body">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* --- Apply rail --- */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-[2rem] border border-line-soft bg-canvas-warm/70 p-8">
              <h2 className="font-display text-2xl font-normal text-navy">{c.applyHeading}</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{c.applyBody}</p>

              <Link
                href={`/submit-resume?role=${job.slug}`}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 hover:shadow-soft"
              >
                {c.applyButton}
                <Arrow />
              </Link>

              <dl className="mt-8 space-y-4 border-t border-line pt-8 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-body">{c.labelPosted}</dt>
                  <dd className="text-navy">{formatDate(job.postedAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-body">{c.labelEmployment}</dt>
                  <dd className="text-navy">{job.type}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-body">{c.labelLocation}</dt>
                  <dd className="text-navy">{job.location}</dd>
                </div>
                {job.salary && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">{c.labelPay}</dt>
                    <dd className="text-navy">{job.salary}</dd>
                  </div>
                )}
              </dl>

              <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-body">
                {withTokens(c.questions, {
                  phone: (
                    <a
                      href={`tel:${phoneHref(contact.phone)}`}
                      className="font-medium text-navy underline underline-offset-4 hover:text-gold-deep"
                    >
                      {contact.phone}
                    </a>
                  ),
                })}
              </p>
            </div>
          </aside>
        </div>

        {/* --- Related --- */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-line-soft pt-14">
            <h2 className="font-display text-3xl font-light text-navy">{c.similarHeading}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/jobs/${r.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-line-soft bg-canvas-warm/50 p-7 transition-all hover:-translate-y-1 hover:border-line hover:shadow-soft"
                  >
                    <h3 className="font-display text-xl font-normal leading-snug text-navy group-hover:text-gold-deep">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-body">
                      {r.location} · {r.type}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </Section>
  );
}
