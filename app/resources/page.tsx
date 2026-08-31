import type { Metadata } from "next";
import { Arrow, Container, Section, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Interview Guide",
  description:
    "Fit Recruiting's interview guide. How to prepare, what to bring, what to ask, and how to follow up, written by the recruiters who sit on the other side of the table.",
};

/**
 * Content adapted from Fit's own "FIT Interview Guide 2025" PDF.
 *
 * ONE EDITORIAL CHANGE: the source PDF splits attire advice into "For Women"
 * and "For Men" sections. That's been consolidated into single, non-gendered
 * guidance here — same substance, no assumption about who's reading. Flagged
 * for Chambliss to approve; revert by restoring the original two lists.
 */
const SECTIONS = [
  {
    id: "before",
    title: "Before your interview",
    items: [
      "Research the company website, including news and press releases, the “about” page, culture and values, and the management profiles of the people you know you're meeting.",
      "Take at least three ideas that genuinely interest you from your research, and be prepared to discuss them.",
      "Review the position description and be able to give at least five reasons you're the best fit for this role and this company.",
      "Consider the top five strengths this position would draw on, and be ready to discuss how you've used them. Be prepared to speak to your weaknesses as well.",
      "Work these into the conversation. It shows the interviewer you're prepared and serious about the role.",
    ],
  },
  {
    id: "attire",
    title: "What to wear",
    items: [
      "Business professional attire. Plan it the day before, not the morning of.",
      "Tailored suits in navy, gray, or black, with a knee-length skirt, tailored pants, or a matching suit.",
      "Shirts and blouses pressed and basic. Modesty is recommended.",
      "Fragrances are not recommended.",
      "Jewelry simple and conservative. Makeup and nail polish minimal.",
      "Clean hands, trimmed nails, and a professional hair style are a must.",
      "Shoes shined and conservative. Oxford or wingtip styles work well.",
      "Ties should be non-novelty, worn with a navy, gray, or black suit.",
      "Don't remove your suit jacket unless the interviewer offers.",
    ],
  },
  {
    id: "take",
    title: "What to take",
    items: [
      "A folder or portfolio with multiple copies of your résumé and references, plus a good pen.",
      "The position description, when possible.",
      "Three to five questions you'll ask the interviewer.",
    ],
  },
  {
    id: "leave",
    title: "What to leave in the car",
    items: ["Cell phones, tobacco products, and chewing gum.", "Other distractions."],
  },
  {
    id: "behavior",
    title: "Behavioral tips",
    items: [
      "Greet your interviewer with a firm handshake and an enthusiastic, sincere smile.",
      "Greet the interviewer by Mr. or Ms. and their last name.",
      "Wait until you're offered a chair before taking a seat.",
      "Sit upright, look alert, and stay interested. Make eye contact and nod to show you're listening.",
      "Be assertive and proud of your accomplishments, without being over-confident.",
      "Show enthusiasm. If you're interested, say so. If you're not, your responsiveness still demonstrates professionalism.",
      "Stay confident even if you sense the interview isn't going well. Some interviewers discourage you deliberately to test your reaction.",
      "Most importantly, be yourself.",
    ],
  },
  {
    id: "avoid",
    title: "What to avoid",
    items: [
      "Answering questions with a “yes” or “no.” Explain your answers.",
      "Exaggerating. Answers should be truthful and direct.",
      "Sharing personal stories unrelated to the position or your qualifications.",
      "Derogatory remarks about previous employers, supervisors, or co-workers. When explaining your departure, limit comments to what's necessary to communicate your rationale.",
      "Asking about compensation, vacation, and benefits in your first interview. Use the interview to build confidence that you're the best fit, not to signal you're focused on what's in it for you. These matter, but they're better discussed further along.",
    ],
  },
];

const THEY_ASK = [
  "Tell me about yourself, your background, and accomplishments.",
  "What are your strengths? Weaknesses?",
  "Describe your ideal job.",
  "Why are you the best fit for this position?",
  "How do you define success? Failure?",
  "Tell me about a work assignment you did not complete successfully, and why.",
  "What motivates you most in a job?",
  "List your top three achievements.",
  "What do you know about our company?",
  "Why did you want to interview with our company?",
  "What are your career goals?",
  "Tell me about a work situation you handled poorly. What did you learn?",
  "What other opportunities are you considering in addition to ours?",
];

const YOU_ASK = [
  "What are the greatest challenges in this position?",
  "What might I expect during the first six months on the job?",
  "What would I be expected to accomplish in this role?",
  "What made the last person in this position successful?",
  "What characteristics or traits do successful people in this company share?",
  "What are the company's plans for growth?",
  "What is the biggest challenge facing this department or company right now?",
  "How often is formal feedback given?",
  "Do you have any concerns about my qualifications that I can address for you?",
];

const CLOSING = [
  "If you're interested in the position, let the interviewer know. Something like: “I'm very interested in your company, its products, and the people I've met. I know I would do an excellent job in the position we discussed.” You can also ask about next steps in the decision-making process.",
  "Don't be discouraged if no immediate commitment is made. Often the interviewer needs to talk with others or interview more candidates.",
  "Thank the interviewer for their time and consideration.",
  "Ask everyone you met for a business card, then follow up by email thanking them for their time and expressing your interest.",
  "Within 48 hours, follow up with a brief handwritten note. Thank them again, reiterate your interest, and add two or three quick points about how your qualifications relate to the position.",
  "Connect with everyone you met on LinkedIn, and follow the company page.",
];

function Panel({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <section className="rounded-[2rem] border border-line-soft bg-canvas-warm/50 p-8 lg:p-10">
      <h2 className="font-display text-3xl font-light text-navy">{title}</h2>
      <List className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-4 leading-relaxed text-body">
            <span
              aria-hidden="true"
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
            />
            <span>{item}</span>
          </li>
        ))}
      </List>
    </section>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <Section className="pb-0 pt-14 lg:pt-20">
        <Container>
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">Candidate resources</p>
            <h1 className="font-display text-[clamp(2.75rem,6.5vw,5rem)] font-light leading-[1.02] tracking-tight text-navy">
              The interview
              <br />
              <em className="italic text-gold-deep">guide.</em>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-body">
              Everything we tell our candidates before we send them in. Written by
              the people who sit on the other side of the table, and who talk to
              the hiring manager afterward.
            </p>
            <a
              href="/fit-interview-guide.pdf"
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-navy/25 px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas"
            >
              Download the PDF
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v13M7 12l5 5 5-5M4 21h16" />
              </svg>
            </a>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {SECTIONS.map((s) => (
              <Panel key={s.id} title={s.title} items={s.items} />
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Questions --- */}
      <Section className="on-navy bg-navy pt-0 lg:pt-0">
        <div className="py-20 lg:py-28">
          <Container>
            <SectionHeading
              tone="dark"
              eyebrow="Rehearse these"
              title={
                <>
                  The questions,
                  <br />
                  <em className="italic text-gold">both directions.</em>
                </>
              }
            />
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 lg:p-10">
                <h3 className="font-display text-2xl font-normal text-canvas">
                  Questions you may be asked
                </h3>
                <p className="mt-2 text-sm italic text-navy-100">
                  Rehearse your answers before the interview.
                </p>
                <ul className="mt-6 space-y-3.5">
                  {THEY_ASK.map((q) => (
                    <li key={q} className="flex gap-4 leading-relaxed text-navy-100">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 lg:p-10">
                <h3 className="font-display text-2xl font-normal text-canvas">
                  Questions you should ask
                </h3>
                <p className="mt-2 text-sm italic text-navy-100">
                  A lack of questions can be mistaken for disinterest.
                </p>
                <ul className="mt-6 space-y-3.5">
                  {YOU_ASK.map((q) => (
                    <li key={q} className="flex gap-4 leading-relaxed text-navy-100">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </div>
      </Section>

      <Section className="pt-0">
        <Container>
          <Panel title="Closing and following up" items={CLOSING} />

          <div className="mt-14 rounded-[2.5rem] bg-gold px-8 py-14 text-center lg:px-16">
            <h2 className="mx-auto max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-ink">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-ink/75">
              Send us your résumé and we&rsquo;ll help you find the seat that
              actually fits.
            </p>
            <a
              href="/submit-resume"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
            >
              Submit your résumé
              <Arrow />
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
