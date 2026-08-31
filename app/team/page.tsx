import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, Section } from "@/components/ui";
import { CONTACT } from "@/lib/content";
import { TEAM, TEAM_IS_DRAFT, initials, type TeamMember } from "@/lib/team";

export const metadata: Metadata = {
  title: "Meet the Team",
  description:
    "The people behind Fit Recruiting. Recruiting is relationship driven, so here is who you will actually be talking to.",
  // Draft entries must never be indexed. Remove once TEAM is complete.
  robots: TEAM_IS_DRAFT ? { index: false, follow: false } : undefined,
};

function MemberCard({ m }: { m: TeamMember }) {
  return (
    <article className="group">
      {m.photo ? (
        <div className="overflow-hidden rounded-[2.5rem] bg-canvas-warm">
          <Image
            src={m.photo}
            alt={m.photoAlt ?? `${m.name}, Fit Recruiting`}
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
          <span className="font-display text-[clamp(3rem,6vw,4.5rem)] font-light text-navy-700">
            {initials(m.name)}
          </span>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-display text-[1.75rem] font-normal leading-tight text-navy">
          {m.name}
        </h2>
        {m.title && <p className="mt-1 text-[0.9375rem] text-body">{m.title}</p>}

        {m.specialty && (
          <p className="mt-4 inline-block rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-medium text-navy-700">
            {m.specialty}
          </p>
        )}

        {m.bio && <p className="mt-4 leading-relaxed text-body">{m.bio}</p>}

        {m.askMeAbout && (
          <p className="mt-4 border-l-2 border-gold pl-4 text-[0.9375rem] leading-relaxed text-body">
            <span className="font-semibold text-navy">Ask me about</span> {m.askMeAbout}
          </p>
        )}

        {(m.email || m.linkedin) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
            {m.email && (
              <a
                href={`mailto:${m.email}`}
                className="text-navy underline underline-offset-4 transition-colors hover:text-gold-deep"
              >
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

export default function TeamPage() {
  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">Meet the team</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,5rem)] font-light leading-[1.02] tracking-tight text-navy">
              The people you&rsquo;ll
              <br />
              <em className="italic text-gold-deep">actually talk to.</em>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-body">
              Recruiting runs on relationships, so it helps to know who is on the
              other end of the phone. We are a small team in Mobile, and you will
              work with the same person start to finish.
            </p>
          </div>

          {TEAM_IS_DRAFT && (
            <p
              role="status"
              className="mt-10 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
            >
              <span className="font-semibold text-navy">Draft.</span> Names, titles,
              and LinkedIn links are in place. The bios are first drafts adapted
              from each person&rsquo;s own LinkedIn and still need her sign-off,
              Chambliss&rsquo;s title needs confirming, and Lesley&rsquo;s headshot
              is still to come. This page is hidden from search and not linked in
              the navigation until all of that is settled.
            </p>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {TEAM.map((m) => (
              <MemberCard key={`${m.name}-${m.photo}`} m={m} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="rounded-[2.5rem] bg-navy px-8 py-14 text-center on-navy lg:px-16">
            <h2 className="mx-auto max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-canvas">
              Come talk to one of us.
            </h2>
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-navy-100">
              We meet by appointment, so give us a call or send your résumé and
              we&rsquo;ll set a time.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button href="/submit-resume" variant="gold" className="w-full sm:w-auto">
                Submit your résumé
              </Button>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:border-gold hover:text-gold sm:w-auto"
              >
                Call {CONTACT.phone}
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
