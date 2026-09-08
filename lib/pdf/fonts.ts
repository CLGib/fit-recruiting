import "server-only";

import { Font } from "@react-pdf/renderer";

/**
 * Register the brand faces with the PDF renderer.
 *
 * The Google Fonts CSS API is asked for a TTF by sending a browser-ish user
 * agent; the woff2 it serves by default is not something the PDF renderer can
 * embed. Registration is global and idempotent per process, so this guards
 * against re-running on a warm invocation.
 *
 * If the fetch fails the document still renders, in Helvetica. A plain PDF
 * beats a failed download, and the recruiter is not blocked by a font.
 */
let registered: Promise<boolean> | null = null;

const CSS = "https://fonts.googleapis.com/css2";
// Chrome asks for ttf when it cannot take woff2, which is what we want here.
const UA = "Mozilla/5.0 (Windows NT 6.1)";

async function ttf(family: string, weight: number): Promise<string | null> {
  try {
    const css = await fetch(`${CSS}?family=${family}:wght@${weight}`, {
      headers: { "User-Agent": UA },
    }).then((r) => r.text());
    return css.match(/src:\s*url\((https:[^)]+\.ttf)\)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function registerBrandFonts(): Promise<boolean> {
  registered ??= (async () => {
    try {
      const [display400, display600, body400, body600] = await Promise.all([
        ttf("Cormorant+Garamond", 400),
        ttf("Cormorant+Garamond", 600),
        ttf("Inter", 400),
        ttf("Inter", 600),
      ]);
      if (!display400 || !body400) return false;

      Font.register({
        family: "Cormorant",
        fonts: [
          { src: display400, fontWeight: 400 },
          ...(display600 ? [{ src: display600, fontWeight: 600 }] : []),
        ],
      });
      Font.register({
        family: "Inter",
        fonts: [
          { src: body400, fontWeight: 400 },
          ...(body600 ? [{ src: body600, fontWeight: 600 }] : []),
        ],
      });
      // Résumés are full of hyphenated titles; the default hyphenation splits
      // them in places that read as typos on a document going to a client.
      Font.registerHyphenationCallback((word) => [word]);
      return true;
    } catch {
      return false;
    }
  })();
  return registered;
}
