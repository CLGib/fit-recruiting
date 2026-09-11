import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getCopy } from "@/lib/site/copy/read";

/**
 * The public marketing site.
 *
 * The header and footer live here rather than in the root layout so the team
 * portal under /admin does not inherit a candidate-facing navigation bar it has
 * no use for. Route groups do not affect URLs: /about is still /about.
 *
 * The header is a client component (it runs the mobile menu), so it cannot
 * read copy itself; its words are read here and handed down.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getCopy();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader
        labels={{
          candidates: site.navCandidates,
          employers: site.navEmployers,
          about: site.navAbout,
          contact: site.navContact,
          button: site.navButton,
        }}
      />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
