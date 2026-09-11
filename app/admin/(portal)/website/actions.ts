"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview } from "@/lib/admin/preview";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isPageKey, pageDef, storageKey, type PageKey } from "@/lib/site/copy";
import {
  errorName,
  imageNames,
  readField,
  schemaFor,
  type ImageValue,
  type PageDef,
  type Section,
} from "@/lib/site/copy/fields";
import { chosenFile, photoProblem, removePhotos, uploadPhoto } from "@/lib/site/media";

export type SaveState = {
  status: "idle" | "saved" | "error";
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
  /**
   * Photos uploaded by this save, with their new addresses. The editor takes
   * these back so its next save posts the new address, not the old one.
   */
  images?: Record<string, ImageValue>;
};

const PREVIEW: SaveState = {
  status: "error",
  message: "This is the design preview, so nothing is saved. Sign in to the live portal to make changes.",
};

const OFFLINE: SaveState = { status: "error", message: "Not connected to the database." };

/**
 * Every edit changes the public site, and plenty of copy appears on more than
 * one page (the footer is on all of them), so a save clears the whole site
 * from the root layout. A dozen pages makes that cheaper and far safer than
 * keeping a map of which page shows which field.
 */
function publish() {
  revalidatePath("/", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

/** Which page and which section of it a form is for. */
function locate(fd: FormData): { key: PageKey; page: PageDef; section: Section } | null {
  const key = str(fd, "page");
  if (!isPageKey(key)) return null;
  const page = pageDef(key);
  const section = page.sections[Number(fd.get("section"))];
  return section ? { key, page, section } : null;
}

/** The photos a set of stored rows currently point at. */
async function currentPhotos(keys: string[]): Promise<string[]> {
  if (!keys.length) return [];
  const { data } = await createSupabaseAdminClient().from("site_content").select("value").in("key", keys);
  return (data ?? []).map((r) => (r.value as ImageValue | null)?.src ?? "").filter(Boolean);
}

/**
 * Save one section of one page.
 *
 * Each field is its own row, so saving a section only ever writes that
 * section's fields. Two people editing different sections of the same page
 * cannot overwrite each other, and nothing is read back and merged first.
 *
 * Photos are checked with everything else BEFORE any upload, so a mistake in
 * another field can never leave an orphaned file in storage.
 */
export async function saveSection(_prev: SaveState, formData: FormData): Promise<SaveState> {
  // A server action is its own entry point, reachable without the page.
  const author = await requireAdmin();

  const target = locate(formData);
  if (!target) return { status: "error", message: "Unknown page or section." };
  const { key, page, section } = target;

  // Validation runs before the preview and database checks. It is pure, and
  // it means the design preview shows real feedback on a bad value instead of
  // refusing before looking at it. Nothing is written until after both checks.
  const errors: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const uploads: { field: string; file: File }[] = [];

  for (const field of section.keys) {
    const def = page.fields[field];
    if (def.kind === "image") {
      const file = chosenFile(formData.get(imageNames(field).file));
      if (file) {
        const problem = photoProblem(file);
        if (problem) errors[field] = problem;
        else uploads.push({ field, file });
      }
    }
    const parsed = schemaFor(def).safeParse(readField(def, field, formData));
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors[errorName(field, issue.path)] ??= issue.message;
      }
      continue;
    }
    values[field] = parsed.data;
  }

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }
  if (isAdminPreview()) return PREVIEW;
  if (!isSupabaseConfigured()) return OFFLINE;

  const images: Record<string, ImageValue> = {};
  const uploaded: string[] = [];
  let replaced: string[] = [];

  try {
    // What each photo being replaced pointed at, so it can be tidied after.
    replaced = await currentPhotos(uploads.map((u) => storageKey(key, u.field)));

    for (const { field, file } of uploads) {
      const src = await uploadPhoto(file, "site");
      uploaded.push(src);
      images[field] = { ...(values[field] as ImageValue), src };
      values[field] = images[field];
    }

    const now = new Date().toISOString();
    const { error } = await createSupabaseAdminClient()
      .from("site_content")
      .upsert(
        Object.entries(values).map(([field, value]) => ({
          key: storageKey(key, field),
          value,
          updated_at: now,
          updated_by: author,
        })),
        { onConflict: "key" },
      );
    if (error) throw error;
  } catch (err) {
    console.error(`[saveSection:${key}] failed:`, err);
    // The save did not happen, so nothing points at what was just uploaded.
    await removePhotos(uploaded);
    return { status: "error", message: "That did not save. Please try again." };
  }

  await removePhotos(replaced);
  publish();
  return {
    status: "saved",
    message: "Saved. It is live on the website now.",
    ...(uploads.length ? { images } : {}),
  };
}

/**
 * Put a section back to the site's original wording, and photo.
 *
 * Deletes that section's rows, which is all "original" means: with no row, a
 * field shows its built-in default. The safety net that makes it reasonable to
 * hand every word on the site to people who are not developers.
 */
export async function resetSection(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  if (isAdminPreview()) return PREVIEW;
  if (!isSupabaseConfigured()) return OFFLINE;

  const target = locate(formData);
  if (!target) return { status: "error", message: "Unknown page or section." };
  const { key, page, section } = target;

  let photos: string[] = [];
  try {
    photos = await currentPhotos(
      section.keys.filter((f) => page.fields[f].kind === "image").map((f) => storageKey(key, f)),
    );
    const { error } = await createSupabaseAdminClient()
      .from("site_content")
      .delete()
      .in("key", section.keys.map((f) => storageKey(key, f)));
    if (error) throw error;
  } catch (err) {
    console.error(`[resetSection:${key}] failed:`, err);
    return { status: "error", message: "That did not restore. Please try again." };
  }

  await removePhotos(photos);
  publish();
  return { status: "saved", message: "Restored the original wording." };
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function saveTeamMember(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const author = await requireAdmin();
  if (isAdminPreview()) return PREVIEW;
  if (!isSupabaseConfigured()) return OFFLINE;

  const id = str(formData, "id");
  const name = str(formData, "name").trim();
  const title = str(formData, "title").trim();
  const bio = str(formData, "bio").trim();
  const linkedin = str(formData, "linkedin").trim();
  const email = str(formData, "email").trim().toLowerCase();
  const photoAlt = str(formData, "photo_alt").trim();
  const visible = formData.get("visible") === "on";
  const photo = chosenFile(formData.get("photo"));

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Every team member needs a name.";
  if (bio.length > 1200) errors.bio = "Keep bios under 1,200 characters.";
  if (linkedin && !/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(linkedin)) {
    errors.linkedin = "Paste the full LinkedIn address, starting https://www.linkedin.com/";
  }
  if (email && !EMAIL.test(email)) errors.email = "That does not look like an email address.";
  const problem = photo ? photoProblem(photo) : null;
  if (problem) errors.photo = problem;
  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  const supabase = createSupabaseAdminClient();
  let previous: string | null = null;
  let photoUrl: string | undefined;

  try {
    if (id) {
      const { data } = await supabase.from("team_members").select("photo_url").eq("id", id).maybeSingle();
      previous = (data?.photo_url as string | null) ?? null;
    }
    if (photo) photoUrl = await uploadPhoto(photo, "team");

    const row = {
      name,
      title: title || null,
      bio: bio || null,
      linkedin: linkedin || null,
      email: email || null,
      // Describe the photo for screen readers; default to the person's name.
      photo_alt: photoAlt || `${name}, Fit Recruiting`,
      visible,
      updated_at: new Date().toISOString(),
      updated_by: author,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    };

    if (id) {
      const { error } = await supabase.from("team_members").update(row).eq("id", id);
      if (error) throw error;
    } else {
      // New people go to the end of the list.
      const { data: last } = await supabase
        .from("team_members")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = await supabase
        .from("team_members")
        .insert({ ...row, sort_order: ((last?.sort_order as number) ?? 0) + 1 });
      if (error) throw error;
    }
  } catch (err) {
    console.error("[saveTeamMember] failed:", err);
    if (photoUrl) await removePhotos([photoUrl]);
    return { status: "error", message: "That did not save. Please try again." };
  }

  // A replaced headshot is tidied away. Never a photo shipped with the site.
  if (photoUrl) await removePhotos([previous]);
  publish();
  revalidatePath("/admin/website/team");
  return { status: "saved", message: id ? "Saved. It is live on the website now." : "Added." };
}

/** Move someone one place up or down the team page. */
export async function moveTeamMember(formData: FormData): Promise<void> {
  await requireAdmin();
  if (isAdminPreview() || !isSupabaseConfigured()) return;

  const id = str(formData, "id");
  const direction = str(formData, "direction") === "up" ? -1 : 1;
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("team_members")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  const list = (data ?? []) as { id: string; sort_order: number }[];

  const from = list.findIndex((m) => m.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= list.length) return;

  // Renumber the whole list rather than swapping two values, so duplicate or
  // missing sort orders (which the seed or a failed write could leave) are
  // repaired as a side effect instead of making the arrows skip.
  [list[from], list[to]] = [list[to], list[from]];
  await Promise.all(
    list.map((m, i) => supabase.from("team_members").update({ sort_order: i + 1 }).eq("id", m.id)),
  );

  publish();
  revalidatePath("/admin/website/team");
}
