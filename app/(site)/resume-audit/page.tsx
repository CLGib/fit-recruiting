import type { Metadata } from "next";
import Link from "next/link";
import ResumeAudit from "@/components/resume-audit";
import { Arrow, Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Free résumé review",
  description:
    "Upload your résumé and get written notes back in about a minute on what to change. Free, no account, and we do not keep a copy.",
};

/**
 * Rewritten after the client said she could not tell what this page was asking
 * a candidate to do, or how Fit helps if nobody can follow up.
 *
 * So the page now answers both before the upload box: exactly what comes back,
 * how long it takes, that it is free, that nothing is stored, and where to go
 * if what they actually want is a person. The vaguer "have your résumé read"
 * framing was the problem, because it read like a promise Fit would read it.
 */
export default function ResumeAuditPage() {
  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5">For candidates</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1.05] tracking-tight text-navy">
            Free résumé review.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-body">
            Upload your résumé and you will get written notes back on this page
            in about a minute: what a recruiter takes from it in the first ten
            seconds, what is already working, and specific changes to make before
            you send it anywhere else.
          </p>

          <ul className="mt-8 space-y-2 leading-relaxed text-body">
            <li>
              <span className="font-semibold text-navy">It is free</span> and
              there is no account to create.
            </li>
            <li>
              <span className="font-semibold text-navy">Nothing is stored.</span>{" "}
              Your file is read once and then discarded, so this is not an
              application and nobody at Fit sees it.
            </li>
            <li>
              <span className="font-semibold text-navy">
                It is written by Claude, not by a recruiter.
              </span>{" "}
              If what you want is a person here in Mobile to read your résumé and
              talk to you about what you are looking for, send it to us instead.
            </li>
          </ul>

          <div className="mt-10">
            <ResumeAudit />
          </div>

          <div className="mt-14 rounded-[2rem] border border-line-soft bg-canvas-warm/50 p-8">
            <h2 className="font-display text-2xl font-normal text-navy">
              Want a person to read it?
            </h2>
            <p className="mt-3 leading-relaxed text-body">
              Send it through the résumé form and a recruiter here reads it. That
              is the one that reaches us and puts you on our radar for roles that
              never get posted.
            </p>
            <Link
              href="/submit-resume"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-deep"
            >
              Submit your résumé
              <Arrow />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
