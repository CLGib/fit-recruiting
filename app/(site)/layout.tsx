import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

/**
 * The public marketing site.
 *
 * The header and footer live here rather than in the root layout so the team
 * portal under /admin does not inherit a candidate-facing navigation bar it has
 * no use for. Route groups do not affect URLs — /about is still /about.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
