"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview } from "@/lib/admin/preview";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { SCHEMAS, isContentKey, type ContentKey } from "@/lib/site/schema";

export type SaveState = {
  status: "idle" | "saved" | "error";
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
};

const PREVIEW: SaveState = {
  status: "error",
  message: "This is the design preview, so nothing is saved. Sign in to the live portal to make changes.",
};

const OFFLINE: SaveState = { status: "error", message: "Not connected to the database." };

/**
 * Every edit changes the public site, and most blocks appear on more than one
 * page (contact details are in the footer of all of them), so a save clears
 * the whole site from the root layout. The site is a dozen pages, so this is
 * cheaper and far safer than keeping a map of which page shows which field.
 */
function publish() {
  revalidatePath("/", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

/** Read a block's fields out of the form, in the shape its schema expects. */
function readBlock(key: ContentKey, fd: FormData): unknown {
  switch (key) {
    case "contact":
      return {
        street: str(fd, "street"),
        city: str(fd, "city"),
        phone: str(fd, "phone"),
        email: str(fd, "email"),
      };
    case "home":
      return {
        heroTitle: str(fd, "heroTitle"),
        heroTitleAccent: str(fd, "heroTitleAccent"),
        heroIntro: str(fd, "heroIntro"),
      };
    case "about":
    case "employers":
      return { intro: str(fd, "intro") };
    case "specialties": {
      const count = Math.min(Number(fd.get("count") ?? 0), 8);
      const items = [];
      for (let i = 0; i < count; i++) {
        const title = str(fd, `title_${i}`).trim();
        const body = str(fd, `body_${i}`).trim();
        const icon = str(fd, `icon_${i}`) || "none";
        // A row cleared out entirely is a removal, not an error.
        if (title || body) items.push({ title, body, icon });
      }
      return { items };
    }
    case "team_page":
      return { published: fd.get("published") === "on" };
  }
}

/** "items.0.title" -> "title_0", so errors land next to the right input. */
function fieldName(path: PropertyKey[]): string {
  if (path[0] === "items" && typeof path[1] === "number" && typeof path[2] === "string") {
    return `${path[2]}_${path[1]}`;
  }
  return path.map(String).join(".") || "form";
}

export async function saveContent(_prev: SaveState, formData: FormData): Promise<SaveState> {
  // A server action is its own entry point, reachable without the page.
  const author = await requireAdmin();
  if (isAdminPreview()) return PREVIEW;
  if (!isSupabaseConfigured()) return OFFLINE;

  const key = str(formData, "key");
  if (!isContentKey(key)) return { status: "error", message: "Unknown section." };

  const parsed = SCHEMAS[key].safeParse(readBlock(key, formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[fieldName(issue.path)] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  try {
    const { error } = await createSupabaseAdminClient()
      .from("site_content")
      .upsert(
        { key, value: parsed.data, updated_at: new Date().toISOString(), updated_by: author },
        { onConflict: "key" },
      );
    if (error) throw error;
  } catch (err) {
    console.error(`[saveContent:${key}] failed:`, err);
    return { status: "error", message: "That did not save. Please try again." };
  }

  publish();
  return { status: "saved", message: "Saved. It is live on the website now." };
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

const PHOTO_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/**
 * 4 MB, matching the résumé form. Vercel refuses request bodies over 4.5 MB
 * before this runs, so this keeps the failure inside our own friendly message.
 * NOT exported: a "use server" module may only export async functions.
 */
const MAX_PHOTO = 4 * 1024 * 1024;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Only ever delete files we uploaded, never a photo shipped with the site. */
function uploadedPath(url: string | null): string | null {
  const marker = "/storage/v1/object/public/site-media/";
  if (!url || !url.includes(marker)) return null;
  return url.slice(url.indexOf(marker) + marker.length);
}

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
  const photo = formData.get("photo");

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Every team member needs a name.";
  if (bio.length > 1200) errors.bio = "Keep bios under 1,200 characters.";
  if (linkedin && !/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(linkedin)) {
    errors.linkedin = "Paste the full LinkedIn address, starting https://www.linkedin.com/";
  }
  if (email && !EMAIL.test(email)) errors.email = "That does not look like an email address.";

  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto) {
    if (!PHOTO_TYPES.has(photo.type)) errors.photo = "Use a JPG, PNG, or WebP photo.";
    else if (photo.size > MAX_PHOTO) errors.photo = "That photo is larger than 4 MB. Please use a smaller copy.";
  }
  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  const supabase = createSupabaseAdminClient();

  try {
    let previous: string | null = null;
    if (id) {
      const { data } = await supabase.from("team_members").select("photo_url").eq("id", id).maybeSingle();
      previous = (data?.photo_url as string | null) ?? null;
    }

    let photoUrl: string | undefined;
    if (hasPhoto) {
      const file = photo as File;
      const path = `team/${crypto.randomUUID()}.${PHOTO_TYPES.get(file.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("site-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      photoUrl = supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
    }

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

    // Replaced photo: tidy up the old file. Never fails the save, and never
    // touches a photo that shipped with the site rather than being uploaded.
    const stale = photoUrl ? uploadedPath(previous) : null;
    if (stale) {
      const { error } = await supabase.storage.from("site-media").remove([stale]);
      if (error) console.error("[saveTeamMember] could not remove old photo:", error);
    }
  } catch (err) {
    console.error("[saveTeamMember] failed:", err);
    return { status: "error", message: "That did not save. Please try again." };
  }

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
