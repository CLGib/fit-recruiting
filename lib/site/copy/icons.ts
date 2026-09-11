/**
 * The icons a specialty can show. Chosen per specialty in the portal rather
 * than looked up from its title, so rewording a specialty can never make its
 * icon silently disappear.
 */
export const SPECIALTY_ICONS = [
  "accounting",
  "technology",
  "administration",
  "executive",
  "engineering",
  "none",
] as const;

export type SpecialtyIcon = (typeof SPECIALTY_ICONS)[number];

export const SPECIALTY_ICON_OPTIONS: readonly { value: SpecialtyIcon; label: string }[] = [
  { value: "accounting", label: "Calculator" },
  { value: "technology", label: "Computer screen" },
  { value: "administration", label: "Folder" },
  { value: "executive", label: "Magnifying glass" },
  { value: "engineering", label: "Ruler" },
  { value: "none", label: "No icon" },
];

export function isSpecialtyIcon(value: string): value is SpecialtyIcon {
  return (SPECIALTY_ICONS as readonly string[]).includes(value);
}
