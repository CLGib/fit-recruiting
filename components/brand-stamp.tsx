/**
 * Recurring brand stamp: "Local. Trusted. Connected."
 *
 * Deliberately NOT a banner. An earlier version ran these words as a scrolling
 * yellow ticker, which read like a promo bar and undercut the brand. Here each
 * word carries a line of actual substance, so the stamp reads as a section
 * rather than decoration, and the local/relationship story gets real estate.
 */

const STAMP = [
  {
    word: "Local.",
    body: "We live and work here. Mobile, Baldwin County, and the Mississippi coast are our market, not a territory on someone else's map.",
  },
  {
    word: "Trusted.",
    body: "Clients call us back and candidates send us their friends. That is more or less the whole business model.",
  },
  {
    word: "Connected.",
    body: "We usually know who is hiring before it is posted, and who is quietly ready for something new.",
  },
];

export default function BrandStamp() {
  return (
    <section aria-labelledby="brand-stamp" className="bg-canvas-warm py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1240px] px-6 lg:px-10">
        <h2 id="brand-stamp" className="sr-only">
          Local. Trusted. Connected.
        </h2>
        <div className="grid gap-12 sm:grid-cols-3 sm:gap-8 lg:gap-14">
          {STAMP.map((s) => (
            <div key={s.word}>
              <span aria-hidden="true" className="block h-0.5 w-10 rounded-full bg-gold" />
              <p className="mt-6 font-display text-[clamp(2.25rem,4vw,3.25rem)] font-light leading-none text-navy">
                {s.word}
              </p>
              <p className="mt-4 max-w-xs leading-relaxed text-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
