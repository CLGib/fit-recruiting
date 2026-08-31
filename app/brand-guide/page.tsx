import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section } from "@/components/ui";
import {
  CANVAS,
  CORE,
  GOLD_TEXT,
  GREYS,
  NAVY_SCALE,
  PAIRINGS,
  contrast,
  type Swatch,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "Brand Guide",
  description:
    "The Fit Recruiting brand system. Logo usage, color, typography, photography, and voice.",
};

/* -------------------------------------------------------------------------- */

function SwatchCard({ s, large = false }: { s: Swatch; large?: boolean }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line-soft bg-canvas">
      <div
        className={large ? "h-32" : "h-20"}
        style={{ backgroundColor: s.hex }}
        aria-hidden="true"
      />
      <div className="p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-normal text-navy">{s.name}</h3>
          {s.locked && (
            <span className="rounded-full bg-gold/20 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-navy-700">
              Locked
            </span>
          )}
        </div>
        <p className="mt-2 font-mono text-sm tabular-nums text-navy-700">{s.hex}</p>
        {s.pantone && (
          <p className="mt-1 text-xs uppercase tracking-[0.1em] text-body">{s.pantone}</p>
        )}
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-body">{s.role}</p>
      </div>
    </div>
  );
}

function Rule({ children, allowed }: { children: React.ReactNode; allowed: boolean }) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          allowed ? "bg-navy text-canvas" : "border border-line text-navy-700"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {allowed ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
        </svg>
      </span>
      <span className="leading-relaxed text-body">
        <span className="sr-only">{allowed ? "Do: " : "Don't: "}</span>
        {children}
      </span>
    </li>
  );
}

function GuideSection({
  n,
  title,
  lede,
  children,
}: {
  n: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-14">
      <div className="max-w-2xl">
        <p className="mb-4 font-mono text-sm tabular-nums text-navy-700">{n}</p>
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-light text-navy">{title}</h2>
        {lede && <p className="mt-5 text-lg leading-relaxed text-body">{lede}</p>}
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export default function BrandGuidePage() {
  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        {/* --- Masthead --- */}
        <header className="max-w-3xl">
          <p className="eyebrow mb-5">Internal reference</p>
          <h1 className="font-display text-[clamp(2.75rem,6.5vw,5rem)] font-light leading-[1.02] tracking-tight text-navy">
            The Fit
            <br />
            <em className="italic text-gold-deep">brand guide.</em>
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-body">
            Every value here is pulled from the original vector artwork rather
            than sampled off the old website, so print and screen finally agree.
          </p>
        </header>

        <div className="mt-24 space-y-24">
          {/* ============================= LOGO ============================= */}
          <GuideSection
            n="01"
            title="The logo"
            lede="Two forms. The full lockup is the default; the mark alone is for tight spaces where the wordmark would be illegible."
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="flex items-center justify-center rounded-3xl border border-line-soft bg-canvas-warm/60 p-12 lg:col-span-2">
                <Image
                  src="/brand/fit-lockup.png"
                  alt="The full Fit Recruiting lockup: the mark beside the word fit, above the tagline finding quality people"
                  width={2213}
                  height={1444}
                  sizes="360px"
                  className="h-28 w-auto"
                />
              </div>
              <div className="flex items-center justify-center rounded-3xl border border-line-soft bg-canvas-warm/60 p-12">
                <Image
                  src="/brand/fit-mark.png"
                  alt="The Fit mark on its own: a rounded yellow square containing the fi ligature"
                  width={1750}
                  height={2117}
                  sizes="240px"
                  className="h-28 w-auto"
                />
              </div>
            </div>

            {/* On-dark rule */}
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl bg-navy p-10">
                <p className="mb-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
                  On dark surfaces
                </p>
                <Image
                  src="/brand/fit-lockup-reversed-light-glyph.png"
                  alt="The reversed Fit lockup with a cream glyph inside the yellow mark"
                  width={2213}
                  height={1444}
                  sizes="260px"
                  className="h-16 w-auto"
                />
                <p className="mt-6 leading-relaxed text-navy-100">
                  The wordmark is near-black and disappears on navy, so dark
                  surfaces use the reversed lockup. The wordmark and tagline knock
                  out to cream. Never box the full-colour logo in a white panel.
                </p>

                <div className="mt-8 border-t border-white/10 pt-7">
                  <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
                    Awaiting approval
                  </p>
                  <div className="flex flex-wrap items-end gap-8">
                    <div>
                      <Image
                        src="/brand/fit-mark.png"
                        alt="The current mark on navy, with a near-black glyph"
                        width={1750}
                        height={2117}
                        sizes="120px"
                        className="h-14 w-auto"
                      />
                      <p className="mt-3 text-xs text-navy-100">Current glyph</p>
                    </div>
                    <div>
                      <Image
                        src="/brand/fit-mark-light-glyph.png"
                        alt="The proposed mark on navy, with a cream glyph"
                        width={1750}
                        height={2117}
                        sizes="120px"
                        className="h-14 w-auto"
                      />
                      <p className="mt-3 text-xs text-gold">Proposed</p>
                    </div>
                  </div>
                  <p className="mt-6 leading-relaxed text-navy-100">
                    The glyph inside the mark is near-black, which sits at the same
                    hue as the navy. On dark surfaces it blends into the background
                    and the mark stops reading as &ldquo;fi&rdquo; at small sizes.
                    The proposed variant knocks the glyph out to cream so it matches
                    the wordmark. It applies to dark surfaces only. The primary mark
                    on light backgrounds does not change.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-navy-100/85">
                    Note: this variant was produced by recolouring a render, so it
                    is web-ready but not a true vector. If approved, it should be
                    rebuilt from the original artwork before any print or
                    embroidery use.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-10">
                <p className="eyebrow mb-6">Usage</p>
                <ul className="space-y-4">
                  <Rule allowed>
                    Keep clear space around the lockup equal to the height of the
                    yellow mark on all sides.
                  </Rule>
                  <Rule allowed>
                    Minimum width of 120&nbsp;px on screen for the full lockup;
                    below that, switch to the mark.
                  </Rule>
                  <Rule allowed={false}>
                    Don&rsquo;t recolor, rotate, add effects, or place the lockup
                    on a busy photograph.
                  </Rule>
                  <Rule allowed={false}>
                    Don&rsquo;t stretch or re-space the wordmark and tagline.
                  </Rule>
                </ul>
              </div>
            </div>
          </GuideSection>

          {/* ============================ COLOR ============================ */}
          <GuideSection
            n="02"
            title="Color"
            lede="Two spot colors carry the brand. The navy is new, but it isn't arbitrary. It is built on the hue already sitting inside the logo's black."
          >
            <div className="grid gap-5 lg:grid-cols-3">
              {CORE.map((s) => (
                <SwatchCard key={s.hex} s={s} large />
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-line-soft bg-canvas-warm/50 p-8 lg:p-10">
              <h3 className="font-display text-2xl font-normal text-navy">
                Why this navy
              </h3>
              <p className="mt-4 max-w-3xl leading-relaxed text-body">
                PANTONE Black 6 C isn&rsquo;t a neutral black. Converted to RGB
                it sits at hue&nbsp;212°, a blue-black. The navy scale below is
                built at that same hue, which is why it reads as something the
                mark always contained rather than a color layered on top of it.
              </p>
            </div>

            <h3 className="mt-14 font-display text-2xl font-normal text-navy">Navy scale</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NAVY_SCALE.map((s) => (
                <SwatchCard key={s.hex} s={s} />
              ))}
            </div>

            <h3 className="mt-14 font-display text-2xl font-normal text-navy">
              Canvas, the beige ground
            </h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-body">
              The site sits on warm beige rather than white. It softens the navy,
              flatters the photography, and is the single biggest reason the
              redesign doesn&rsquo;t read like a job board.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {CANVAS.map((s) => (
                <SwatchCard key={s.hex} s={s} />
              ))}
            </div>

            <h3 className="mt-14 font-display text-2xl font-normal text-navy">
              Greys and gold-as-text
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[...GREYS, GOLD_TEXT].map((s) => (
                <SwatchCard key={s.hex} s={s} />
              ))}
            </div>
          </GuideSection>

          {/* ========================= CONTRAST ============================ */}
          <GuideSection
            n="03"
            title="Contrast"
            lede="Every pairing below is measured, not estimated. WCAG AA requires 4.5:1 for body text and 3:1 for large text."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <caption className="sr-only">
                  Measured contrast ratios for approved and prohibited color pairings
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    {["Pairing", "Sample", "Ratio", "Use for"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="pb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-body"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAIRINGS.map((p) => {
                    const ratio = contrast(p.fg, p.bg);
                    const verdict =
                      p.status === "ok"
                        ? "Passes AA for body text"
                        : p.status === "large"
                          ? "Passes AA for large text only"
                          : "Fails. Never use as text";
                    return (
                      <tr key={p.label} className="border-b border-line-soft">
                        <td className="py-5 pr-6 text-[0.9375rem] text-navy">{p.label}</td>
                        <td className="py-5 pr-6">
                          {p.status === "never" ? (
                            /* Rendering genuinely illegible sample text to
                               demonstrate illegibility would itself be a
                               failure. Show the two colors as chips instead. */
                            <span className="inline-flex items-center gap-2">
                              <span
                                aria-hidden="true"
                                className="inline-block h-8 w-8 rounded-lg border border-line"
                                style={{ backgroundColor: p.bg }}
                              />
                              <span
                                aria-hidden="true"
                                className="inline-block h-8 w-8 rounded-lg border border-line"
                                style={{ backgroundColor: p.fg }}
                              />
                            </span>
                          ) : (
                            <span
                              className={`inline-block rounded-lg px-4 py-2 font-medium ${
                                p.status === "large" ? "text-2xl" : "text-sm"
                              }`}
                              style={{ backgroundColor: p.bg, color: p.fg }}
                            >
                              Finding quality people
                            </span>
                          )}
                        </td>
                        <td className="py-5 pr-6">
                          <span
                            className={`inline-flex items-center gap-2 font-mono text-sm tabular-nums ${
                              p.status === "never" ? "text-[#8c3225]" : "text-navy"
                            }`}
                          >
                            {ratio.toFixed(2)}:1
                            <span className="sr-only">{verdict}</span>
                            <span aria-hidden="true">{p.status === "never" ? "✕" : "✓"}</span>
                          </span>
                        </td>
                        <td className="py-5 text-[0.9375rem] text-body">{p.use}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GuideSection>

          {/* ========================= TYPOGRAPHY ========================== */}
          <GuideSection
            n="04"
            title="Typography"
            lede="A refined serif for display, a clean grotesque for everything that has to be read quickly."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-10">
                <p className="eyebrow mb-6">Display · Cormorant Garamond</p>
                <p className="font-display text-7xl font-light leading-none text-navy">Aa</p>
                <p className="mt-8 font-display text-3xl font-light leading-tight text-navy">
                  The right people, the right fit.
                </p>
                <p className="mt-6 leading-relaxed text-body">
                  Light (300) and Regular (400) only. Used for headlines, pull
                  quotes, statistics, and step numerals. Italic carries emphasis
                  in headlines, always in Fit Yellow&nbsp;Deep.
                </p>
              </div>

              <div className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-10">
                <p className="eyebrow mb-6">Text · Inter</p>
                <p className="text-7xl font-medium leading-none text-navy">Aa</p>
                <p className="mt-8 text-lg leading-relaxed text-navy">
                  A boutique recruiting firm placing talent across the Gulf Coast.
                </p>
                <p className="mt-6 leading-relaxed text-body">
                  Regular (400), Medium (500), Semibold (600). Body copy, buttons,
                  navigation, forms, and the uppercase eyebrow labels.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-line-soft bg-canvas-warm/50 p-10">
              <p className="eyebrow mb-8">Scale</p>
              <div className="space-y-6">
                {[
                  { label: "Display / H1", cls: "font-display text-6xl font-light", t: "Finding quality people" },
                  { label: "Section / H2", cls: "font-display text-4xl font-light", t: "What we recruit for" },
                  { label: "Card / H3", cls: "font-display text-2xl font-normal", t: "Executive Search" },
                  { label: "Lede", cls: "text-lg", t: "A boutique recruiting firm in Mobile, Alabama." },
                  { label: "Body", cls: "text-base", t: "Reference checks, background checks, and skills testing." },
                  { label: "Eyebrow", cls: "text-[0.6875rem] font-semibold uppercase tracking-[0.2em]", t: "Now hiring" },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="grid gap-2 border-b border-line-soft pb-6 last:border-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-6"
                  >
                    <p className="text-sm text-body">{r.label}</p>
                    <p className={`${r.cls} text-navy`}>{r.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </GuideSection>

          {/* ======================== PHOTOGRAPHY ========================== */}
          <GuideSection
            n="05"
            title="Photography"
            lede="Real people in the real office. The single fastest way to stop looking like a national staffing platform."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { src: "/photos/team-02.jpg", alt: "The owner of Fit Recruiting seated at a table in the Mobile office" },
                { src: "/photos/team-01.jpg", alt: "A Fit Recruiting recruiter seated in the office lounge area" },
                { src: "/photos/team-03.jpg", alt: "A Fit Recruiting recruiter at her desk" },
              ].map((p) => (
                <div key={p.src} className="overflow-hidden rounded-3xl">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={1000}
                    height={1250}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <ul className="mt-10 grid gap-4 rounded-3xl border border-line-soft bg-canvas-warm/50 p-10 sm:grid-cols-2">
              <Rule allowed>Natural light, warm neutrals, the actual Dauphin Street office.</Rule>
              <Rule allowed>Corner radius of 2rem or greater on every image.</Rule>
              <Rule allowed={false}>No generic stock handshakes or skyline imagery.</Rule>
              <Rule allowed={false}>No heavy filters or duotone treatments over faces.</Rule>
            </ul>
          </GuideSection>

          {/* =========================== VOICE ============================= */}
          <GuideSection
            n="06"
            title="Voice"
            lede="Direct, warm, and specific. Fit is a small firm that knows things, and the writing should sound like a person who has done this a long time."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-10">
                <p className="eyebrow mb-6">Sounds like Fit</p>
                <ul className="space-y-4">
                  <Rule allowed>&ldquo;We&rsquo;re picky on purpose. It saves everyone time.&rdquo;</Rule>
                  <Rule allowed>&ldquo;A real person here in Mobile reads every submission.&rdquo;</Rule>
                  <Rule allowed>Specifics over superlatives. Name the city, the discipline, the role.</Rule>
                </ul>
              </div>
              <div className="rounded-3xl border border-line-soft bg-canvas-warm/50 p-10">
                <p className="eyebrow mb-6">Doesn&rsquo;t</p>
                <ul className="space-y-4">
                  <Rule allowed={false}>&ldquo;Leveraging synergies to optimize talent acquisition.&rdquo;</Rule>
                  <Rule allowed={false}>&ldquo;Your trusted partner in workforce solutions.&rdquo;</Rule>
                  <Rule allowed={false}>Claims we can&rsquo;t back with a number or a name.</Rule>
                </ul>
              </div>
            </div>
          </GuideSection>

          {/* ======================== ACCESSIBILITY ======================== */}
          <GuideSection
            n="07"
            title="Accessibility"
            lede="The rules that keep the brand usable. These aren't suggestions, and a few of them override aesthetic preference."
          >
            <ul className="grid gap-4 rounded-3xl border border-line-soft bg-canvas-warm/50 p-10 sm:grid-cols-2">
              <Rule allowed>Body text uses #666666. Never #808080, which fails contrast on beige.</Rule>
              <Rule allowed>Yellow is a surface color, never a text color on light ground.</Rule>
              <Rule allowed>Every interactive element keeps a visible focus ring, navy on light and yellow on navy.</Rule>
              <Rule allowed>Every image carries alt text describing who or what is shown.</Rule>
              <Rule allowed={false}>Never signal state with color alone. Pair it with text or an icon.</Rule>
              <Rule allowed={false}>Never drop below 44&nbsp;px for a tap target.</Rule>
            </ul>
          </GuideSection>
        </div>
      </Container>
    </Section>
  );
}
