import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, Section } from "@/components/ui";
import { getCopy } from "@/lib/site/copy/read";
import { fill, phoneHref } from "@/lib/site/format";
import { listTeam, type TeamMemberRecord } from "@/lib/site/team";
import { initials } from "@/lib/team";

/**
 * Meet the Team, managed by Fit in the portal.
 *
 * The page stays out of search, and shows a draft notice, until the team
 * switches "ready to go public" on. Publishing a bio and a headshot is a
 * consent question, so that switch is theirs rather than something a deploy
 * turns on.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { team } = await getCopy();
  return {
    title: "Meet the Team",
    description:
      "The people behind Fit Recruiting. Recruiting is relationship driven, so here is who you will actually be talking to.",
    robots: team.published ? undefined : { index: false, follow: false },
  };
}

function MemberCard({ m }: { m: TeamMemberRecord }) {
  return (
    <article className="group">
      {m.photo_url ? (
        <div className="overflow-hidden rounded-[2.5rem] bg-canvas-warm">
          <Image
            src={m.photo_url}
            alt={m.photo_alt ?? `${m.name}, Fit Recruiting`}
            width={1000}
            height={1250}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        /* No headshot on file yet. An initials monogram reads as a deliberate
           choice rather than a missing image. */
        <div
          aria-hidden="true"
          className="flex aspect-[4/5] w-full items-center justify-center rounded-[2.5rem] border border-line-soft bg-canvas-warm"
        >
          <span className="font-display text-[clamp(3rem,6vw,4.5rem)] font-light text-navy-700">{initials(m.name)}</span>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-display text-[1.75rem] font-normal leading-tight text-navy">{m.name}</h2>
        {m.title && <p className="mt-1 text-[0.9375rem] text-body">{m.title}</p>}
        {m.bio && <p className="mt-4 whitespace-pre-line leading-relaxed text-body">{m.bio}</p>}

        {(m.email || m.linkedin) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
            {m.email && (
              <a href={`mailto:${m.email}`} className="text-navy underline underline-offset-4 transition-colors hover:text-gold-deep">
                Email
                <span className="sr-only"> {m.name}</span>
              </a>
            )}
            {m.linkedin && (
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy underline underline-offset-4 transition-colors hover:text-gold-deep"
              >
                LinkedIn
                <span className="sr-only"> profile for {m.name}, opens in a new tab</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function TeamPage() {
  const [{ team: c, site }, members] = await Promise.all([getCopy(), listTeam()]);

  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">{c.eyebrow}</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,5rem)] font-light leading-[1.02] tracking-tight text-navy">
              {c.title}
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-body">{c.intro}</p>
          </div>

          {!c.published && (
            <p
              role="status"
              className="mt-10 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
            >
              <span className="font-semibold text-navy">Draft.</span> This page is
              hidden from search and not linked from the navigation until the team
              marks it ready in the portal.
            </p>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {members.map((m) => (
              <MemberCard key={m.id} m={m} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-[2.5rem] bg-navy px-8 py-12 on-navy sm:flex-row sm:items-center sm:justify-between lg:px-14">
            <p className="max-w-lg leading-relaxed text-navy-100">{c.closingBody}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button href="/submit-resume" variant="gold" className="w-full sm:w-auto">
                {c.closingButton}
              </Button>
              <a
                href={`tel:${phoneHref(site.phone)}`}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:border-gold hover:text-gold sm:w-auto"
              >
                {fill(c.callButton, { phone: site.phone })}
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
