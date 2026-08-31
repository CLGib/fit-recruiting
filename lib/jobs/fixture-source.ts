import type { Job, JobSource } from "./types";

/**
 * Fixture-backed job source.
 *
 * Titles, locations, types, categories, dates and statuses were transcribed
 * from the live WP Job Manager admin (2026-08-26). Long-form descriptions are
 * intentionally unset: they live in WordPress and must be imported, not
 * rewritten.
 *
 * This is the default source until Bullhorn credentials land, which keeps the
 * whole site buildable and testable with no external dependency.
 */

export const JOBS: Job[] = [
  {
    slug: "tax-accountant-mobile-al",
    title: "Tax Accountant",
    location: "Mobile, AL",
    type: "Full Time",
    categories: ["Wholesale Building Materials"],
    salary: null,
    postedAt: "2026-06-24",
    expiresAt: "2026-08-31",
    status: "active",
  },
  {
    slug: "senior-purchasing-manager-spanish-fort-al",
    title: "Senior Purchasing Manager",
    location: "Spanish Fort, AL",
    type: "Full Time",
    categories: ["Manufacturing"],
    salary: null,
    postedAt: "2026-06-24",
    expiresAt: "2026-08-31",
    status: "active",
  },
  {
    slug: "inside-sales-representative-spanish-fort-al",
    title: "Inside Sales Representative",
    location: "Spanish Fort, AL",
    type: "Full Time",
    categories: ["Manufacturing", "Sales & Marketing"],
    salary: null,
    postedAt: "2026-06-24",
    expiresAt: "2026-08-31",
    status: "active",
  },
  {
    slug: "accounts-receivable-supervisor-mobile-al",
    title: "Accounts Receivable Supervisor",
    location: "Mobile, AL",
    type: "Full Time",
    categories: [
      "Accounting / Finance",
      "Construction / Facilities",
      "Manufacturing",
    ],
    salary: null,
    postedAt: "2026-06-24",
    expiresAt: "2026-08-31",
    status: "active",
  },
  {
    slug: "legal-assistant-mobile-al",
    title: "Legal Assistant",
    location: "Mobile, AL",
    type: "Full Time",
    categories: ["Legal Services"],
    salary: null,
    postedAt: "2026-06-24",
    expiresAt: "2026-08-31",
    status: "active",
  },
  {
    slug: "business-operations-analyst-mobile-al",
    title: "Business Operations Analyst",
    location: "Mobile, AL",
    type: "Full Time",
    categories: ["Insurance"],
    salary: null,
    postedAt: "2026-06-24",
    expiresAt: "2026-08-31",
    status: "active",
  },
  {
    slug: "accounts-payable-supervisor-mobile-al",
    title: "Accounts Payable Supervisor",
    location: "Mobile, AL",
    type: "Full Time",
    categories: ["Accounting / Finance"],
    salary: null,
    postedAt: "2026-05-29",
    expiresAt: "2026-08-31",
    status: "pending",
  },
  {
    slug: "operations-manager-mobile-al",
    title: "Operations Manager",
    location: "Mobile, AL",
    type: "Full Time",
    categories: ["Construction / Facilities", "Wholesale Building Materials"],
    salary: null,
    postedAt: "2026-05-28",
    expiresAt: "2026-06-30",
    status: "expired",
  },
  {
    slug: "executive-director-mobile-al",
    title: "Executive Director",
    location: "Mobile, AL",
    type: "Full Time",
    categories: ["Executive", "Non-Profit"],
    salary: null,
    postedAt: "2026-03-25",
    expiresAt: "2026-06-30",
    status: "expired",
  },
];

export const fixtureJobSource: JobSource = {
  async listActiveJobs() {
    return JOBS.filter((j) => j.status === "active");
  },
  async getJob(slug: string) {
    return JOBS.find((j) => j.slug === slug) ?? null;
  },
};
