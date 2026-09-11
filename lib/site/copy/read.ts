import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { schemaFor, type Field } from "./fields";
import { PAGES, allDefaults, isPageKey, type Copy, type PageKey } from "./index";

/**
 * All the site's copy: Fit's edits laid over the built-in wording.
 *
 * Merged field by field, not page by page. Each field is its own row, and one
 * that fails validation falls back to its default on its own, so a single bad
 * value can never take a page's other copy down with it. Failures never throw:
 * the defaults are the site's real wording, so the worst case is the site as it
 * read before anyone edited it.
 *
 * cache() shares one query between the header, footer and page body of a
 * single render.
 */
export const getCopy = cache(async (): Promise<Copy> => {
  const copy = allDefaults();
  if (!isSupabaseConfigured()) return copy;

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("site_content")
      .select("key, value");
    if (error) throw error;

    for (const row of data ?? []) {
      const key = String(row.key);
      const dot = key.indexOf(".");
      if (dot < 1) continue; // Not a "page.field" row.
      const page = key.slice(0, dot);
      const field = key.slice(dot + 1);
      if (!isPageKey(page)) continue;
      const def = (PAGES[page].fields as Record<string, Field>)[field];
      if (!def) continue; // A field since removed from the site.

      const parsed = schemaFor(def).safeParse(row.value);
      if (parsed.success) {
        (copy[page] as Record<string, unknown>)[field] = parsed.data;
      } else {
        console.error(`[copy] "${key}" failed validation, showing the default.`);
      }
    }
  } catch (err) {
    console.error("[copy] could not load edits, showing the built-in wording:", err);
  }

  return copy;
});

export async function getPageCopy<K extends PageKey>(page: K): Promise<Copy[K]> {
  return (await getCopy())[page];
}

export type CopyMeta = Record<string, { updated_at: string; updated_by: string }>;

/** Who last changed each field, and when. Keyed "page.field". */
export async function getCopyMeta(): Promise<CopyMeta> {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data } = await createSupabaseAdminClient()
      .from("site_content")
      .select("key, updated_at, updated_by");
    return Object.fromEntries(
      (data ?? []).map((r) => [String(r.key), { updated_at: r.updated_at, updated_by: r.updated_by }]),
    );
  } catch {
    return {};
  }
}
