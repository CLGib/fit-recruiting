import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Absolute base for OG/Twitter image URLs.
 *
 * This MUST match the host actually serving the site. Hardcoding the client's
 * live domain made link previews point at fitrecruiting.com/opengraph-image,
 * which doesn't exist there — so every shared link fell back to a broken image.
 *
 * At launch, set SITE_URL=https://fitrecruiting.com in the Vercel project once
 * the real domain is attached.
 *
 * Not NEXT_PUBLIC_: every consumer is server side, so there is no reason to
 * inline it into the client bundle. Vercel also refuses to mark a public-
 * prefixed variable as a Secret, since the prefix exposes it by definition.
 */
const SITE_URL =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fit Recruiting · Finding Quality People on the Gulf Coast",
    template: "%s · Fit Recruiting",
  },
  description:
    "A boutique recruiting firm in Mobile, Alabama, placing accounting, IT, administrative, and executive talent across Mobile, Baldwin County, and the Gulf Coast. Local. Trusted. Connected.",
  // Keep the OG title short — iMessage and Slack truncate hard, and a title
  // with an em dash gets clipped to the fragment after it.
  openGraph: {
    title: "Fit Recruiting",
    description:
      "A boutique recruiting firm in Mobile, Alabama, placing accounting, IT, administrative, and executive talent across the Gulf Coast.",
    url: SITE_URL,
    siteName: "Fit Recruiting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fit Recruiting",
    description:
      "A boutique recruiting firm in Mobile, Alabama, placing talent across the Gulf Coast.",
  },
  icons: {
    icon: "/brand/fit-mark-512.png",
    apple: "/brand/fit-mark-512.png",
  },
  // PREVIEW ONLY. This is a staging copy of a live client's site — if it gets
  // crawled it competes with fitrecruiting.com for their own brand terms and
  // can surface unapproved copy in search results.
  // TODO: remove this block at launch.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-canvas antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
