import { bullhornJobSource, isBullhornConfigured } from "./bullhorn-source";
import { fixtureJobSource } from "./fixture-source";
import type { Job, JobSource } from "./types";

/**
 * Chooses the backing system at runtime.
 *
 * Falls back to fixtures whenever Bullhorn is not configured, so the site
 * builds and renders correctly on a machine with no credentials. This is what
 * keeps the Bullhorn decision reversible: swapping the system of record means
 * writing one adapter, not touching any page.
 */
export function getJobSource(): JobSource {
  return isBullhornConfigured() ? bullhornJobSource : fixtureJobSource;
}

export async function listActiveJobs(): Promise<Job[]> {
  return getJobSource().listActiveJobs();
}

export async function getJob(slug: string): Promise<Job | null> {
  return getJobSource().getJob(slug);
}

/** Industry verticals present in the current active roles. */
export async function listIndustries(): Promise<string[]> {
  const jobs = await listActiveJobs();
  return Array.from(new Set(jobs.flatMap((j) => j.categories))).sort();
}

export type { Job, JobSource, JobStatus } from "./types";
