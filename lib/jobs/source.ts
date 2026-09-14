import { isSupabaseConfigured } from "@/lib/supabase/config";
import { bullhornJobSource, isBullhornConfigured } from "./bullhorn-source";
import { fixtureJobSource } from "./fixture-source";
import { rolesJobSource } from "./roles-source";
import type { Job, JobSource } from "./types";

/**
 * Where the public job board reads from.
 *
 * BULLHORN FIRST, per Fit (2026-09-14): Fit posts jobs in Bullhorn, where their
 * team already works, and the website reflects it. They do not want to manage
 * postings in the portal. So whenever Bullhorn credentials are configured, the
 * board is Bullhorn and nothing else.
 *
 * Until then, the roles in the portal fill in, so the site is never empty while
 * API access is pending. Fixtures only on a machine with no database at all.
 *
 * CAUTION: the Bullhorn adapter has never run against a real account. Setting
 * the credentials in Production switches the live board over immediately, so
 * add them to a Preview deployment first and check the board matches Bullhorn.
 */
export function getJobSource(): JobSource {
  if (isBullhornConfigured()) return bullhornJobSource;
  return isSupabaseConfigured() ? rolesJobSource : fixtureJobSource;
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
