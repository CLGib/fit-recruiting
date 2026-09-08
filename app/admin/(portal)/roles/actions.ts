"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAiConfigured } from "@/lib/ai/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  EMPLOYMENT_TYPES,
  ROLE_STATUSES,
  toSlug,
  type EmploymentType,
  type RoleStatus,
} from "@/lib/admin/role-status";

export type RoleFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
};

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function splitCommas(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Create a draft and go straight to it. Everything else is edited in place. */
export async function createRole(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const author = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const employmentType = String(formData.get("employment_type") ?? "Full Time");

  const errors: Record<string, string> = {};
  if (!title) errors.title = "Give the role a title.";
  if (!location) errors.location = "Where is it based?";
  if (!EMPLOYMENT_TYPES.includes(employmentType as EmploymentType)) {
    errors.employment_type = "Pick an employment type.";
  }
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Not connected to the database." };
  }

  let id: string;
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("roles")
      .insert({
        slug: toSlug(title, location),
        title,
        location,
        employment_type: employmentType,
        salary: String(formData.get("salary") ?? "").trim() || null,
        categories: splitCommas(formData.get("categories")),
        intake_notes: String(formData.get("intake_notes") ?? "").trim() || null,
        status: "draft",
        created_by: author,
      })
      .select("id")
      .single();

    if (error) {
      // A duplicate slug is the one failure worth explaining precisely, because
      // the fix is the recruiter's, not ours.
      if (error.code === "23505") {
        return {
          status: "error",
          message:
            "A role with that title and location already exists. Open it instead, or change the title.",
        };
      }
      throw error;
    }
    id = data.id as string;
  } catch (err) {
    console.error("[createRole] failed:", err);
    return { status: "error", message: "The role could not be created. Please try again." };
  }

  revalidatePath("/admin/roles");
  redirect(`/admin/roles/${id}`);
}

export async function updateRole(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing role." };
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Not connected to the database." };
  }

  const status = String(formData.get("status") ?? "draft") as RoleStatus;
  if (!ROLE_STATUSES.includes(status)) {
    return { status: "error", message: "Unknown status." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("roles")
      .update({
        title: String(formData.get("title") ?? "").trim(),
        location: String(formData.get("location") ?? "").trim(),
        employment_type: String(formData.get("employment_type") ?? "Full Time"),
        salary: String(formData.get("salary") ?? "").trim() || null,
        categories: splitCommas(formData.get("categories")),
        intake_notes: String(formData.get("intake_notes") ?? "").trim() || null,
        summary: String(formData.get("summary") ?? "").trim() || null,
        responsibilities: splitLines(formData.get("responsibilities")),
        requirements: splitLines(formData.get("requirements")),
        status,
        // Publishing to the site is a consequence of being open, not a separate
        // switch. Anything else drifts out of sync immediately.
        site_published_at: status === "open" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("[updateRole] failed:", err);
    return { status: "error", message: "The role could not be saved. Please try again." };
  }

  revalidatePath("/admin/roles");
  revalidatePath(`/admin/roles/${id}`);
  // The public job board reads the same rows.
  revalidatePath("/jobs");
  return { status: "idle" };
}

export type DraftState = { status: "idle" | "error"; message?: string };

/** Have Claude draft the summary, responsibilities, and requirements. */
export async function draftDescription(
  _prev: DraftState,
  formData: FormData,
): Promise<DraftState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing role." };
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Not connected to the database." };
  }
  if (!isAiConfigured()) {
    return { status: "error", message: "No Anthropic API key is set on this deployment." };
  }

  const { getRole } = await import("@/lib/admin/roles");
  const { draftJobDescription } = await import("@/lib/ai/job-description");

  const role = await getRole(id);
  if (!role) return { status: "error", message: "That role no longer exists." };

  try {
    const { description, model } = await draftJobDescription({
      title: role.title,
      location: role.location,
      employmentType: role.employment_type,
      salary: role.salary,
      categories: role.categories,
      notes: role.intake_notes,
    });

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("roles")
      .update({
        summary: description.summary,
        responsibilities: description.responsibilities,
        requirements: description.requirements,
        description_model: model,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("[draftDescription] failed:", err);
    return {
      status: "error",
      message: "The draft could not be written. Please try again, or write it yourself.",
    };
  }

  revalidatePath(`/admin/roles/${id}`);
  return { status: "idle" };
}

export type PublishState = { status: "idle" | "error"; message?: string };

/**
 * Send a role to Bullhorn, and through Bullhorn to LinkedIn.
 *
 * NOT WIRED UP. Bullhorn issues API credentials through a support ticket and
 * Fit does not have them yet, so there is nothing to call. This exists as the
 * seam: the adapter in lib/bullhorn/ is written, and the moment credentials
 * land this becomes a real call with the surrounding UI already built and
 * tested. Until then it refuses honestly rather than pretending to have
 * published, because a role that says "posted" and is not is worse than one
 * that says it could not go.
 */
export async function publishToBullhorn(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing role." };

  const { isBullhornConfigured } = await import("@/lib/bullhorn/config");
  if (!isBullhornConfigured()) {
    return {
      status: "error",
      message:
        "Bullhorn is not connected yet. It needs an API user, which Bullhorn issues through a support ticket, plus write access to job orders.",
    };
  }

  return {
    status: "error",
    message: "Bullhorn publishing is not implemented yet.",
  };
}
