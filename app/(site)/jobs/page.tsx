import type { Metadata } from "next";
import JobBoard from "@/components/job-board";
import { Container, Section } from "@/components/ui";
import { listActiveJobs } from "@/lib/jobs/source";
import { getCopy } from "@/lib/site/copy/read";

// Jobs come from the source of record, so the board refreshes without a deploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Open Roles",
  description:
    "Browse current openings placed by Fit Recruiting across Mobile, Baldwin County, and the Mississippi Gulf Coast.",
};

export default async function JobsPage() {
  const [jobs, { jobs: c }] = await Promise.all([listActiveJobs(), getCopy()]);

  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <header className="max-w-2xl">
          <p className="eyebrow mb-5">{c.eyebrow}</p>
          <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-light leading-[1.02] tracking-tight text-navy">
            {c.title} <em className="italic text-gold-deep">{c.titleAccent}</em>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-body">{c.intro}</p>
        </header>

        <div className="mt-14">
          <JobBoard
            jobs={jobs}
            copy={{
              searchLabel: c.searchLabel,
              searchPlaceholder: c.searchPlaceholder,
              filterLabel: c.filterLabel,
              filterAll: c.filterAll,
              resultsOne: c.resultsOne,
              resultsMany: c.resultsMany,
              emptyHeading: c.emptyHeading,
              emptyBody: c.emptyBody,
              emptyButton: c.emptyButton,
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
