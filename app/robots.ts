import type { MetadataRoute } from "next";

/**
 * PREVIEW ONLY — blocks all crawlers.
 *
 * This deployment is a staging copy of a live client site. Letting it be
 * indexed would put unapproved copy in search results and compete with
 * fitrecruiting.com for their own brand terms.
 *
 * TODO: delete this file (and the `robots` block in app/layout.tsx) at launch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // PREVIEW: everything is blocked. At launch, replace the blanket rule with
    // the commented one below so the marketing site is indexed but the admin
    // area and the draft team page never are.
    rules: [{ userAgent: "*", disallow: "/" }],
    // rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/team"] }],
  };
}
