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
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
