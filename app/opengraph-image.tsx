import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Fit Recruiting, a boutique recruiting firm on the Gulf Coast";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Link-preview card for iMessage, Slack, LinkedIn, etc.
 *
 * Without this, clients fall back to the apple-touch-icon — which is the bare
 * logo PNG, scaled up and center-cropped. Navy ground is deliberate: it reads
 * correctly in both light and dark chat bubbles, and the near-black wordmark
 * sits in a cream card per the brand rule for dark surfaces.
 */

function logoDataUri() {
  // Reversed lockup: cream wordmark, yellow mark intact. No cream card needed.
  const file = path.join(process.cwd(), "public", "brand", "fit-lockup-reversed.png");
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}

/** Resolve a real TTF from the Google Fonts CSS API. Returns null on failure. */
async function loadFont(
  family: string,
  weight: number,
  italic = false,
): Promise<ArrayBuffer | null> {
  try {
    const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:${axis}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
    }).then((r) => r.text());
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

type Font = {
  name: string;
  data: ArrayBuffer;
  style: "normal" | "italic";
  weight: 400 | 600;
};

export default async function Image() {
  // The italic face is loaded separately — Satori will not synthesize one, so
  // "right fit." would render upright without it.
  const [serif, serifItalic, sans] = await Promise.all([
    loadFont("Cormorant+Garamond", 400),
    loadFont("Cormorant+Garamond", 400, true),
    loadFont("Inter", 600),
  ]);

  const fonts = [
    serif && { name: "Cormorant", data: serif, style: "normal", weight: 400 },
    serifItalic && { name: "Cormorant", data: serifItalic, style: "italic", weight: 400 },
    sans && { name: "Inter", data: sans, style: "normal", weight: 600 },
  ].filter(Boolean) as Font[];

  const display = serif ? "Cormorant" : "serif";
  const body = sans ? "Inter" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#17314F",
          padding: "72px 80px",
        }}
      >
        {/* Reversed lockup, per the brand rule for dark surfaces. */}
        <div style={{ display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri()} alt="" height={104} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Two explicit lines. Satori's flex row does not wrap by default, so
              a single 92px line would overflow the 1040px content width. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: display,
              fontSize: 92,
              color: "#FAF7F2",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            <div style={{ display: "flex" }}>The right people,</div>
            <div style={{ display: "flex" }}>
              <span>the&nbsp;</span>
              <span style={{ color: "#FFB602", fontStyle: "italic" }}>right fit.</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 40,
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", width: 56, height: 3, backgroundColor: "#FFB602" }} />
            <div
              style={{
                display: "flex",
                fontFamily: body,
                fontSize: 26,
                letterSpacing: "0.16em",
                color: "#ACBED2",
                textTransform: "uppercase",
              }}
            >
              Mobile, Alabama · Gulf Coast
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
