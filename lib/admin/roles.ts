import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { EmploymentType, RoleStatus } from "./role-status";

export type { EmploymentType, RoleStatus } from "./role-status";

export type Role = {
  id: string;
  slug: string;
  title: string;
  location: string;
  employment_type: EmploymentType;
  categories: string[];
  salary: string | null;
  intake_notes: string | null;
  summary: string | null;
  responsibilities: string[];
  requirements: string[];
  status: RoleStatus;
  site_published_at: string | null;
  bullhorn_job_order_id: string | null;
  bullhorn_synced_at: string | null;
  linkedin_urn: string | null;
  linkedin_synced_at: string | null;
  description_model: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export async function listRoles(): Promise<Role[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Role[];
}

export async function getRole(id: string): Promise<Role | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("roles").select("*").eq("id", id).maybeSingle();
  return (data as Role) ?? null;
}

/** Roles a candidate could be matched against. */
export async function listOpenRoles(): Promise<Role[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("roles")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  return (data ?? []) as Role[];
}
