import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Container, Section } from "@/components/ui";
import { getContent } from "@/lib/site/content";
import { phoneHref } from "@/lib/site/schema";

// Built from the editable contact block, so a changed phone number reaches the
// search snippet as well as the page.
export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContent("contact");
  return {
    title: "Contact",
    description: `Get in touch with Fit Recruiting at ${contact.street}, ${contact.city}. Call ${contact.phone} or email ${contact.email}. By appointment only.`,
  };
}

export default async function ContactPage() {
  const contact = await getContent("contact");
  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <p className="eyebrow mb-5">Contact</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,4.75rem)] font-light leading-[1.02] tracking-tight text-navy">
              Come sit down
              <br />
              <em className="italic text-gold-deep">with us.</em>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-body">
              Whether you&rsquo;re hiring or looking, the first conversation is
              always the same: a real one. Coffee is on us.
            </p>
            <p className="mt-5 rounded-2xl border border-line-soft bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body">
              <span className="font-semibold text-navy">We meet by appointment.</span>{" "}
              Give us a call or send your résumé first, and we&rsquo;ll set a time
              with a recruiter who has already read it. That way the conversation
              is actually worth your drive.
            </p>

            <dl className="mt-12 space-y-8">
              <div>
                <dt className="eyebrow mb-2">Office · by appointment</dt>
                <dd className="font-display text-2xl font-light text-navy">
                  <address className="not-italic">
                    {contact.street}
                    <br />
                    {contact.city}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Phone</dt>
                <dd className="font-display text-2xl font-light">
                  <a
                    href={`tel:${phoneHref(contact.phone)}`}
                    className="text-navy underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Email</dt>
                <dd className="font-display text-2xl font-light">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-navy underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* --- Two doors --- */}
          <div className="space-y-5">
            <Link
              href="/submit-resume"
              className="group block rounded-[2rem] border border-line-soft bg-canvas-warm/60 p-9 transition-all hover:-translate-y-1 hover:border-line hover:shadow-soft"
            >
              <p className="eyebrow mb-4">Looking for a role</p>
              <h2 className="font-display text-3xl font-light text-navy group-hover:text-gold-deep">
                Submit your résumé
              </h2>
              <p className="mt-4 leading-relaxed text-body">
                Send it over and a person here in Mobile will actually read it.
                We&rsquo;ll reach out when something fits, including roles that
                never make it to the job board.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                Submit résumé
                <Arrow />
              </span>
            </Link>

            <a
              href={`mailto:${contact.email}?subject=New%20job%20order`}
              className="group block rounded-[2rem] bg-navy p-9 transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
                Hiring
              </p>
              <h2 className="font-display text-3xl font-light text-canvas">
                Start a search
              </h2>
              <p className="mt-4 leading-relaxed text-navy-100">
                Tell us about the role and the team. We&rsquo;ll come meet you,
                learn the culture, and get to work on a short list of people
                worth your time.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                Email us
                <Arrow />
              </span>
            </a>

            <div className="overflow-hidden rounded-[2rem] border border-line-soft">
              <iframe
                title="Map showing Fit Recruiting at 2602 Dauphin Street, Mobile, Alabama"
                src="https://www.google.com/maps?q=2602+Dauphin+Street,+Mobile,+Alabama+36606&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
