/**
 * The shape the site renders. Deliberately independent of any backing system so
 * the source can change (fixtures today, Bullhorn next, something else later)
 * without touching a single page.
 */

export type JobStatus = "active" | "pending" | "expired";

export type Job = {
  slug: string;
  title: string;
  location: string;
  type: "Full Time" | "Part Time" | "Contract" | "Temp-to-Hire";
  /** Industry verticals. */
  categories: string[];
  salary: string | null;
  /** ISO date, YYYY-MM-DD. */
  postedAt: string;
  expiresAt: string;
  status: JobStatus;
  /**
   * Long-form fields are OPTIONAL and may be absent. The real descriptions live
   * in WordPress and must be imported rather than written. Every consumer
   * degrades gracefully when they are missing, so nothing invented ever ships
   * against a real role.
   */
  summary?: string;
  responsibilities?: string[];
  requirements?: string[];
};

/** Contract every backing system implements. */
export interface JobSource {
  /** Public-facing roles only. Never returns pending or expired. */
  listActiveJobs(): Promise<Job[]>;
  getJob(slug: string): Promise<Job | null>;
}

/** Build a URL-safe slug. Used by adapters that have no slug of their own. */
export function toSlug(title: string, location: string): string {
  return `${title} ${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
