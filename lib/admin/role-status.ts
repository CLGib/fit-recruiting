/**
 * Role vocabulary. Shared by server and client, so this module carries no
 * server-only marker and no database access.
 */

export const ROLE_STATUSES = ["draft", "open", "closed"] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};

export const ROLE_STATUS_HINT: Record<RoleStatus, string> = {
  draft: "Not on the website. Only the team can see it.",
  open: "Live on the website and open to applications.",
  closed: "Filled or withdrawn. Off the website.",
};

export const EMPLOYMENT_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Temp-to-Hire",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/**
 * The channels a role can go out on.
 *
 * `connected` is what the deployment can actually reach today. The publish
 * panel reads it so the screen tells the truth about what is wired up rather
 * than showing a button that quietly does nothing.
 */
export type ChannelKey = "site" | "bullhorn" | "linkedin";

export const CHANNELS: {
  key: ChannelKey;
  label: string;
  blurb: string;
}[] = [
  {
    key: "site",
    label: "fitrecruiting.com",
    blurb: "The public job board. Goes live the moment the role is open.",
  },
  {
    key: "bullhorn",
    label: "Bullhorn",
    blurb: "Creates a job order so the role sits with the rest of your pipeline.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    blurb: "Posted through Bullhorn's LinkedIn connection, not separately.",
  },
];

/** Build a URL-safe slug from a title and location. */
export function toSlug(title: string, location: string): string {
  return `${title} ${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
