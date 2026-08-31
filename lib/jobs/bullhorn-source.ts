import { bhFetch } from "../bullhorn/client";
import { JOB_ORDER_FIELDS, mapJobOrder, type BullhornJobOrder } from "../bullhorn/map";
import type { Job, JobSource } from "./types";

export { isBullhornConfigured } from "../bullhorn/config";

/**
 * Bullhorn-backed job source.
 *
 * UNVERIFIED against a live instance: credentials are pending a Bullhorn support
 * ticket. The query and field mapping follow the documented JobOrder entity, but
 * expect to adjust `JOB_ORDER_FIELDS` and the category mapping on first contact
 * with real data. Until credentials exist, getJobSource() never selects this.
 */

type SearchResponse = { data: BullhornJobOrder[] };

/** Only open, public roles reach the website. */
const ACTIVE_QUERY = "isOpen:true AND isPublic:1";

async function fetchActive(): Promise<Job[]> {
  const res = await bhFetch<SearchResponse>("/search/JobOrder", {
    query: ACTIVE_QUERY,
    fields: JOB_ORDER_FIELDS,
    count: "200",
    sort: "-dateAdded",
  });
  return (res.data ?? []).map(mapJobOrder);
}

export const bullhornJobSource: JobSource = {
  async listActiveJobs() {
    return fetchActive();
  },

  async getJob(slug: string) {
    // The id is the slug's trailing segment, so a detail page costs one lookup
    // rather than fetching and scanning the whole board.
    const id = slug.split("-").pop();
    if (!id || !/^\d+$/.test(id)) return null;

    const res = await bhFetch<{ data: BullhornJobOrder }>(`/entity/JobOrder/${id}`, {
      fields: JOB_ORDER_FIELDS,
    });
    if (!res.data) return null;

    const job = mapJobOrder(res.data);
    // Guard against an id that resolves to a role that is no longer public.
    return job.status === "active" ? job : null;
  },
};
