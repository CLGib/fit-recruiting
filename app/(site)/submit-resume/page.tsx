import type { Metadata } from "next";
import ResumeForm from "@/components/resume-form";
import { Container, Section } from "@/components/ui";
import { listActiveJobs } from "@/lib/jobs/source";
import { getCopy } from "@/lib/site/copy/read";
import { phoneHref } from "@/lib/site/format";
import { withTokens } from "@/lib/site/tokens";

export const metadata: Metadata = {
  title: "Submit a Résumé",
  description:
    "Send your résumé to Fit Recruiting. Every submission is read by a person in our Mobile, Alabama office, including for roles that never reach the job board.",
};

export default async function SubmitResumePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const [{ submit: c, site }, { role }] = await Promise.all([getCopy(), searchParams]);
  const matched = role ? (await listActiveJobs()).find((j) => j.slug === role) : undefined;

  const link = "font-medium text-navy underline underline-offset-4 hover:text-gold-deep";

  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          {/* --- Intro rail --- */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-5">{c.eyebrow}</p>
            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] font-light leading-[1.03] tracking-tight text-navy">
              {c.title}
              <br />
              <em className="italic text-gold-deep">{c.titleAccent}</em>
            </h1>

            {matched ? (
              <div className="mt-8 rounded-3xl border border-line-soft bg-canvas-warm/70 p-7">
                <p className="eyebrow mb-2">{c.applyingFor}</p>
                <p className="font-display text-2xl font-normal text-navy">{matched.title}</p>
                <p className="mt-1 text-sm text-body">
                  {matched.location} · {matched.type}
                </p>
              </div>
            ) : (
              <p className="mt-8 text-lg leading-relaxed text-body">{c.intro}</p>
            )}

            <ul className="mt-10 space-y-5 border-t border-line pt-10">
              {c.points.map((point, i) => (
                <li key={i} className="flex gap-4 text-[0.9375rem] leading-relaxed text-body">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {point}
                </li>
              ))}
            </ul>

            <p className="mt-10 text-[0.9375rem] leading-relaxed text-body">
              {withTokens(c.alternative, {
                email: (
                  <a href={`mailto:${site.email}`} className={link}>
                    {site.email}
                  </a>
                ),
                phone: (
                  <a href={`tel:${phoneHref(site.phone)}`} className={link}>
                    {site.phone}
                  </a>
                ),
              })}
            </p>
          </div>

          {/* --- Form --- */}
          <div className="rounded-[2.5rem] border border-line-soft bg-canvas-warm/40 p-8 lg:p-12">
            <ResumeForm role={matched?.slug} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
