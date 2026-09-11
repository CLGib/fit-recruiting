import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { getContent } from "@/lib/site/content";
import { phoneHref } from "@/lib/site/schema";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Fit Recruiting collects, stores, and uses the information you send us.",
};

/**
 * DRAFT — describes the data practices this site actually implements, so it is
 * accurate rather than boilerplate. It has NOT been reviewed by counsel.
 * TODO(chambliss): have an attorney review before launch.
 */
const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "When you submit a résumé, we collect your name, email address, optional phone number, the role you're interested in, anything you write in the message field, and the résumé file itself.",
      "When you contact us by email or phone, we keep that correspondence so we can follow up.",
      "We do not use advertising trackers, and we do not sell any information you give us.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To evaluate you for current and future openings, and to contact you about opportunities.",
      "To share your qualifications with a prospective employer, only when you're being considered for a specific role and never without your knowledge.",
      "To keep our own records of who we've spoken with and when.",
    ],
  },
  {
    title: "How it's stored",
    body: [
      "Résumé files are held in private storage. They are not publicly accessible and cannot be reached by guessing a URL.",
      "Access is limited to Fit Recruiting staff who are signed in to our internal system.",
      "We sign in using one-time email links rather than passwords, so there is no password to be reused or leaked.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "We keep candidate records so we can reach out when a fitting role comes along, often long after your first submission.",
      "You can ask us to delete your information at any time, and we will.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "Ask us what we have on file, ask us to correct it, or ask us to delete it. Email or call us using the details below and we'll take care of it.",
    ],
  },
];

export default async function PrivacyPage() {
  const contact = await getContent("contact");
  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">Privacy</p>
          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] font-light leading-[1.03] tracking-tight text-navy">
            What we do with
            <br />
            <em className="italic text-gold-deep">your information.</em>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-body">
            Short version: we use it to help you find work, we keep it private,
            and we&rsquo;ll delete it if you ask.
          </p>

          <div className="mt-14 space-y-12">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="font-display text-3xl font-light text-navy">{s.title}</h2>
                <div className="mt-5 space-y-4">
                  {s.body.map((p) => (
                    <p key={p} className="leading-relaxed text-body">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-[2rem] border border-line-soft bg-canvas-warm/60 p-8">
              <h2 className="font-display text-2xl font-normal text-navy">
                Questions, or want your data removed?
              </h2>
              <p className="mt-4 leading-relaxed text-body">
                Email{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="font-medium text-navy underline underline-offset-4 hover:text-gold-deep"
                >
                  {contact.email}
                </a>{" "}
                or call{" "}
                <a
                  href={`tel:${phoneHref(contact.phone)}`}
                  className="font-medium text-navy underline underline-offset-4 hover:text-gold-deep"
                >
                  {contact.phone}
                </a>
                . Our office is at {contact.street}, {contact.city}.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
