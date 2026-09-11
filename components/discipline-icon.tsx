import type { SpecialtyIcon } from "@/lib/site/schema";

/**
 * Thin-stroke line icons, one per discipline.
 *
 * Each icon depicts the actual work rather than a generic marker: a
 * calculator for accounting, a folder for administration. Keyed by an icon id
 * the team picks in the portal, NOT by the specialty's title, so editing the
 * wording can never make an icon vanish. "none" renders nothing.
 */

const PATHS: Record<Exclude<SpecialtyIcon, "none">, React.ReactNode> = {
  accounting: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9 7.5h6" />
      <path d="M9.2 12h.01M12 12h.01M14.8 12h.01M9.2 16h.01M12 16h.01M14.8 16h.01" />
    </>
  ),
  technology: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
      <path d="M9 21h6M12 17v4" />
      <path d="m7.5 8.5 2.2 2-2.2 2" />
      <path d="M12.5 12.5h4" />
    </>
  ),
  administration: (
    <>
      <path d="M3 6.5A2 2 0 0 1 5 4.5h3.6a2 2 0 0 1 1.6.8l1 1.4H19a2 2 0 0 1 2 2v8.8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 10.5h18" />
    </>
  ),
  engineering: (
    <>
      <rect x="2.5" y="8" width="19" height="8" rx="2" />
      <path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
    </>
  ),
  executive: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m19.5 19.5-4.2-4.2" />
    </>
  ),
};

export default function DisciplineIcon({ icon }: { icon: SpecialtyIcon }) {
  if (icon === "none") return null;
  const paths = PATHS[icon];
  if (!paths) return null;

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}
