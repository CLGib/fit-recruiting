import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/content";

const COLUMNS = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Fit" },
      { href: "/employers", label: "For Employers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Candidates",
    links: [
      { href: "/for-candidates", label: "For Candidates" },
      { href: "/jobs", label: "Browse Open Roles" },
      { href: "/submit-resume", label: "Submit a Resume" },
      { href: "/resume-audit", label: "Free Resume Review" },
      { href: "/resources", label: "Interview Guide" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="on-navy relative overflow-hidden bg-navy text-navy-100">
      <div className="mx-auto max-w-[1240px] px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          {/* Brand. Uses the reversed lockup (cream wordmark, yellow mark left
              intact) rather than boxing the full-colour logo in a white card,
              which read as accidental. */}
          <div>
            {/* PROPOSED VARIANT, pending Chambliss's approval: the glyph inside
                the mark is cream rather than near-black. The near-black is
                hue 212, the same hue as the navy, so at small sizes the glyph
                blended into the background and the mark stopped reading as
                "fi". Revert to fit-lockup-reversed.png if she prefers. */}
            <Image
              src="/brand/fit-lockup-reversed-light-glyph.png"
              alt="Fit Recruiting, finding quality people"
              width={2213}
              height={1444}
              sizes="220px"
              className="h-16 w-auto"
            />
            <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-navy-100">
              A boutique recruiting firm in Mobile, Alabama, placing exceptional
              people across the Gulf Coast
              {CONTACT.founded ? ` since ${CONTACT.founded}.` : "."}
            </p>
            <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
              Local. Trusted. Connected.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.9375rem] text-navy-100 transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
              Visit Us
            </h4>
            <address className="space-y-3 text-[0.9375rem] not-italic text-navy-100">
              <p>
                {CONTACT.street}
                <br />
                {CONTACT.city}
              </p>
              {/* Visits are scheduled so a recruiter has read the résumé first. */}
              <p className="text-navy-100/90">By appointment only</p>
              <p>
                <a href={`tel:${CONTACT.phoneRaw}`} className="transition-colors hover:text-gold">
                  {CONTACT.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-gold">
                  {CONTACT.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-navy-100 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fit Recruiting. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-gold">
              Privacy
            </Link>
            <Link href="/portal/login" className="transition-colors hover:text-gold">
              Client &amp; Candidate Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
