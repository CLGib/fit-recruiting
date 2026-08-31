/**
 * Brand token reference used to render /brand-guide.
 *
 * Values here are the single source of truth for the guide page and are kept
 * in sync with the `@theme` block in app/globals.css by hand. If you change a
 * token there, change it here.
 */

export type Swatch = {
  name: string;
  hex: string;
  /** Print reference, where the color originates from a spot color. */
  pantone?: string;
  role: string;
  /** Text color to use when set on top of this swatch. */
  on: "light" | "dark";
  locked?: boolean;
};

export const CORE: Swatch[] = [
  {
    name: "Fit Yellow",
    hex: "#FFB602",
    pantone: "PANTONE 116 U",
    role: "The primary brand color. Buttons, accents, and the logo field. Never used for body text.",
    on: "dark",
    locked: true,
  },
  {
    name: "Fit Black",
    hex: "#111820",
    pantone: "PANTONE Black 6 C",
    role: "The wordmark color. A blue-black rather than a true black. The whole navy scale derives from its hue.",
    on: "light",
    locked: true,
  },
  {
    name: "Navy",
    hex: "#17314F",
    role: "Primary dark surface. Full-bleed bands, cards, buttons, and headings on light ground.",
    on: "light",
  },
];

export const NAVY_SCALE: Swatch[] = [
  { name: "Navy 950", hex: "#0E1D2F", role: "Deepest shadow tone", on: "light" },
  { name: "Navy 900", hex: "#14283F", role: "Pressed states", on: "light" },
  { name: "Navy", hex: "#17314F", role: "Primary surface", on: "light" },
  { name: "Navy 700", hex: "#24456B", role: "Hover, numerals, small text on beige", on: "light" },
  { name: "Navy 500", hex: "#386394", role: "Mid tone, charts", on: "light" },
  { name: "Navy 100", hex: "#ACBED2", role: "Body copy on navy", on: "dark" },
];

export const CANVAS: Swatch[] = [
  { name: "Canvas", hex: "#FAF7F2", role: "Page ground", on: "dark" },
  { name: "Canvas Warm", hex: "#F2EBE0", role: "Cards and panels", on: "dark" },
  { name: "Canvas Deep", hex: "#E8DFD1", role: "Emphasis blocks, pull quotes", on: "dark" },
];

export const GOLD_TEXT: Swatch = {
  name: "Gold Deep",
  hex: "#AD7900",
  role:
    "The only gold permitted as text on the beige ground, and only at headline size. The brand yellow itself is a surface color and is never set as body text on light.",
  on: "dark",
};

export const GREYS: Swatch[] = [
  {
    name: "Body Grey",
    hex: "#666666",
    role: "All body copy and small labels on light ground.",
    on: "dark",
    locked: true,
  },
  {
    name: "Slate",
    hex: "#808080",
    role: "Borders, dividers, and decorative fills only. Fails contrast for small text on beige.",
    on: "dark",
    locked: true,
  },
];

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const v = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Pairings the guide measures and reports on, so the rules stay honest.
 *
 * `status` is stated explicitly rather than derived from a single threshold:
 * "large" pairings clear 3:1 but not 4.5:1, so they're valid for headlines and
 * invalid for body copy. "never" pairings are rendered as color chips rather
 * than as sample text — putting genuinely illegible text on the page to
 * demonstrate illegibility would itself be an accessibility failure.
 */
export type Pairing = {
  fg: string;
  bg: string;
  label: string;
  use: string;
  status: "ok" | "large" | "never";
};

export const PAIRINGS: Pairing[] = [
  { fg: "#17314F", bg: "#FAF7F2", label: "Navy on Canvas", use: "Headings", status: "ok" },
  { fg: "#666666", bg: "#FAF7F2", label: "Body Grey on Canvas", use: "Body copy", status: "ok" },
  { fg: "#FAF7F2", bg: "#17314F", label: "Canvas on Navy", use: "Headings on navy", status: "ok" },
  { fg: "#ACBED2", bg: "#17314F", label: "Navy 100 on Navy", use: "Body copy on navy", status: "ok" },
  { fg: "#FFB602", bg: "#17314F", label: "Yellow on Navy", use: "Accents and links on navy", status: "ok" },
  { fg: "#111820", bg: "#FFB602", label: "Fit Black on Yellow", use: "Text on yellow buttons", status: "ok" },
  {
    fg: "#AD7900",
    bg: "#FAF7F2",
    label: "Gold Deep on Canvas",
    use: "Headline emphasis only",
    status: "large",
  },
  {
    fg: "#808080",
    bg: "#FAF7F2",
    label: "Slate on Canvas",
    use: "Never as text. Borders only",
    status: "never",
  },
  {
    fg: "#FFB602",
    bg: "#FAF7F2",
    label: "Yellow on Canvas",
    use: "Never as text. Surfaces only",
    status: "never",
  },
];
