import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  CONTENT_KEYS,
  DEFAULTS,
  SCHEMAS,
  type ContentKey,
  type ContentValue,
} from "./schema";

export type SiteContent = { [K in ContentKey]: ContentValue<K> };

/**
 * Every editable block, with the built-in copy filling any gap.
 *
 * Unlike the job board, failures here fall back rather than throw. The
 * defaults are the site's real copy, not placeholders, so a missing table or a
 * database blip renders the site exactly as it looked before editing existed.
 * A single bad row falls back on its own without taking the others with it.
 *
 * Wrapped in React's cache() so the footer, the header props and the page
 * body share one query per render instead of making one each.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const content = structuredClone(DEFAULTS) as SiteContent;
  if (!isSupabaseConfigured()) return content;

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("site_content")
      .select("key, value");
    if (error) throw error;

    for (const row of data ?? []) {
      const key = row.key as string;
      if (!(CONTENT_KEYS as string[]).includes(key)) continue;
      const parsed = SCHEMAS[key as ContentKey].safeParse(row.value);
      if (parsed.success) {
        (content as Record<string, unknown>)[key] = parsed.data;
      } else {
        console.error(`[site-content] ignoring invalid "${key}" row, using the default.`);
      }
    }
  } catch (err) {
    console.error("[site-content] could not load, using built-in copy:", err);
  }

  return content;
});

/** One block, for pages that only need the one. */
export async function getContent<K extends ContentKey>(key: K): Promise<ContentValue<K>> {
  return (await getSiteContent())[key];
}

/** When each block was last changed, and by whom, for the portal. */
export async function getContentMeta(): Promise<
  Partial<Record<ContentKey, { updated_at: string; updated_by: string }>>
> {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data } = await createSupabaseAdminClient()
      .from("site_content")
      .select("key, updated_at, updated_by");
    return Object.fromEntries(
      (data ?? []).map((r) => [r.key, { updated_at: r.updated_at, updated_by: r.updated_by }]),
    );
  } catch {
    return {};
  }
}
