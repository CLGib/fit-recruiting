import Image from "next/image";
import Link from "next/link";
import { getCopy } from "@/lib/site/copy/read";
import { phoneHref } from "@/lib/site/format";

export default async function SiteFooter() {
  const { site } = await getCopy();

  // Words from the portal (Site-wide), destinations fixed here.
  const columns = [
    {
      heading: site.footerCompany,
      links: [
        { href: "/about", label: site.linkAbout },
        { href: "/employers", label: site.linkEmployers },
        { href: "/contact", label: site.linkContact },
      ],
    },
    {
      heading: site.footerCandidates,
      links: [
        { href: "/for-candidates", label: site.linkCandidates },
        { href: "/jobs", label: site.linkJobs },
        { href: "/submit-resume", label: site.linkSubmit },
        { href: "/resume-audit", label: site.linkAudit },
        { href: "/resources", label: site.linkGuide },
      ],
    },
  ];

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
            <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-navy-100">{site.footerBlurb}</p>
            <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
              {site.footerTagline}
            </p>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[0.9375rem] text-navy-100 transition-colors hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
              {site.footerVisit}
            </h4>
            <address className="space-y-3 text-[0.9375rem] not-italic text-navy-100">
              <p>
                {site.street}
                <br />
                {site.city}
              </p>
              {/* Visits are scheduled so a recruiter has read the résumé first. */}
              <p className="text-navy-100/90">{site.footerAppointment}</p>
              <p>
                <a href={`tel:${phoneHref(site.phone)}`} className="transition-colors hover:text-gold">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-gold">
                  {site.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-navy-100 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.copyright}
          </p>
          {/* A "Client & Candidate Portal" link used to sit here, pointing at
              /portal/login, which never existed: candidate accounts were never
              in scope. It was a 404 on every page of the site. */}
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-gold">
              {site.linkPrivacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
