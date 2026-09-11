import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { TEAM } from "@/lib/team";

export type TeamMemberRecord = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  photo_alt: string | null;
  linkedin: string | null;
  email: string | null;
  sort_order: number;
  visible: boolean;
  updated_at: string;
  updated_by: string;
};

/** The draft entries in lib/team.ts, shaped like database rows. */
function fallback(): TeamMemberRecord[] {
  return TEAM.map((m, i) => ({
    id: `builtin-${i}`,
    name: m.name,
    title: m.title ?? null,
    bio: m.bio ?? null,
    photo_url: m.photo ?? null,
    photo_alt: m.photoAlt ?? null,
    linkedin: m.linkedin ?? null,
    email: m.email ?? null,
    sort_order: i + 1,
    visible: true,
    updated_at: "",
    updated_by: "built-in",
  }));
}

/**
 * The team, in the order Fit set.
 *
 * Falls back to the built-in drafts on any failure, so the team page never
 * renders empty because of a database problem.
 */
export const listTeam = cache(
  async (opts: { includeHidden?: boolean } = {}): Promise<TeamMemberRecord[]> => {
    if (!isSupabaseConfigured()) return fallback();
    try {
      let query = createSupabaseAdminClient()
        .from("team_members")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (!opts.includeHidden) query = query.eq("visible", true);
      const { data, error } = await query;
      if (error) throw error;
      return data as TeamMemberRecord[];
    } catch (err) {
      console.error("[team] could not load, using built-in entries:", err);
      return fallback();
    }
  },
);

export async function getTeamMember(id: string): Promise<TeamMemberRecord | null> {
  if (!isSupabaseConfigured()) return fallback().find((m) => m.id === id) ?? null;
  const { data } = await createSupabaseAdminClient()
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as TeamMemberRecord) ?? null;
}
