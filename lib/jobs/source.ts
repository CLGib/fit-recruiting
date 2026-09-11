import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fixtureJobSource } from "./fixture-source";
import { rolesJobSource } from "./roles-source";
import type { Job, JobSource } from "./types";

/**
 * Where the public job board reads from.
 *
 * The roles Fit manages in the portal, whenever the database is configured.
 * Fixtures only on a machine with no credentials, so the site still builds and
 * renders locally.
 *
 * Bullhorn is deliberately NOT a source here any more. It used to switch in
 * automatically the moment credentials were set, which would have silently
 * replaced every posting Fit had written with whatever Bullhorn held. Bullhorn
 * is now a place a role is SENT to from the portal (the publish panel), not a
 * competing source of truth. One place to edit a posting is the point.
 */
export function getJobSource(): JobSource {
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
