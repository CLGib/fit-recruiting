import type { Metadata } from "next";
import JobBoard from "@/components/job-board";
import { Container, Section } from "@/components/ui";
import { ACTIVE_JOBS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Open Roles",
  description:
    "Browse current openings placed by Fit Recruiting across Mobile, Baldwin County, and the Mississippi Gulf Coast.",
};

export default function JobsPage() {
  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <header className="max-w-2xl">
          <p className="eyebrow mb-5">Now hiring</p>
          <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-light leading-[1.02] tracking-tight text-navy">
            Open <em className="italic text-gold-deep">positions.</em>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-body">
            A live look at what we&rsquo;re working on right now. Don&rsquo;t see
            the right one? Plenty of our placements never hit this page. Send
            your résumé and we&rsquo;ll keep you in mind.
          </p>
        </header>

        <div className="mt-14">
          <JobBoard jobs={ACTIVE_JOBS} />
        </div>
      </Container>
    </Section>
  );
}
