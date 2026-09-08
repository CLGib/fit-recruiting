import type { Metadata } from "next";
import ResumeAudit from "@/components/resume-audit";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Free résumé review",
  description:
    "Upload your résumé and get specific, usable feedback in about a minute. Free, no account, and we do not keep a copy.",
};

export default function ResumeAuditPage() {
  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5">Free, and no account needed</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1.05] tracking-tight text-navy">
            Have your résumé read.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-body">
            Recruiters spend about ten seconds on a résumé before deciding
            whether to keep reading. Upload yours and find out what those ten
            seconds tell them, and what to change before you send it anywhere
            else.
          </p>
          <p className="mt-4 leading-relaxed text-body">
            We do not keep your file. It is read once, and then it is gone.
          </p>

          <div className="mt-10">
            <ResumeAudit />
          </div>
        </div>
      </Container>
    </Section>
  );
}
