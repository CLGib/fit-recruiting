import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Role, RoleStatus } from "@/lib/admin/roles";
import type { Job, JobSource, JobStatus } from "./types";

/**
 * The public job board, read from the roles Fit writes in the portal.
 *
 * This is the whole of "100% control over job postings": a role set to Open in
 * the portal is on the website, and closing it takes it off. There is no second
 * system to keep in step.
 */

const STATUS: Record<RoleStatus, JobStatus> = {
  open: "active",
  draft: "pending",
  closed: "expired",
};

function toJob(r: Role): Job {
  return {
    slug: r.slug,
    title: r.title,
    location: r.location,
    type: r.employment_type,
    categories: r.categories,
    salary: r.salary,
    postedAt: (r.site_published_at ?? r.created_at).slice(0, 10),
    status: STATUS[r.status],
    summary: r.summary ?? undefined,
    responsibilities: r.responsibilities.length ? r.responsibilities : undefined,
    requirements: r.requirements.length ? r.requirements : undefined,
  };
}

/**
 * Errors are THROWN, not swallowed into an empty list.
 *
 * These pages are statically generated and revalidated every five minutes.
 * When a revalidation throws, Next keeps serving the last good page, which is
 * exactly right for a database blip: candidates keep seeing real openings.
 * Returning [] instead would publish an empty job board until the next
 * successful run, which looks to a candidate like Fit has nothing open.
 */
export const rolesJobSource: JobSource = {
  async listActiveJobs() {
    const { data, error } = await createSupabaseAdminClient()
      .from("roles")
      .select("*")
      .eq("status", "open")
      .order("site_published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not load open roles: ${error.message}`);
    return (data as Role[]).map(toJob);
  },

  async getJob(slug) {
    const { data, error } = await createSupabaseAdminClient()
      .from("roles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Could not load role ${slug}: ${error.message}`);
    return data ? toJob(data as Role) : null;
  },
};
