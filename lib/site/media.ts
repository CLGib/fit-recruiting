import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Uploading and tidying the photos Fit puts on the website, for both the team
 * headshots and the page images. One place, so both follow the same rules.
 */

export const PHOTO_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/**
 * 4 MB. Vercel refuses request bodies over 4.5 MB before a server action even
 * runs, so this keeps the failure inside our own friendly message.
 */
export const MAX_PHOTO = 4 * 1024 * 1024;

/** A chosen file, if the form carried one. */
export function chosenFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

/** Why a photo cannot be used, or null if it can. Checked before anything uploads. */
export function photoProblem(file: File): string | null {
  if (!PHOTO_TYPES.has(file.type)) return "Use a JPG, PNG, or WebP photo.";
  if (file.size > MAX_PHOTO) return "That photo is larger than 4 MB. Please use a smaller copy.";
  return null;
}

/** Upload to the public site-media bucket and return its public address. */
export async function uploadPhoto(file: File, folder: "team" | "site"): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const path = `${folder}/${crypto.randomUUID()}.${PHOTO_TYPES.get(file.type)}`;
  const { error } = await supabase.storage
    .from("site-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}

/** The storage path of a photo Fit uploaded, or null for one shipped with the site. */
function uploadedPath(url: string | null | undefined): string | null {
  const marker = "/storage/v1/object/public/site-media/";
  if (!url || !url.includes(marker)) return null;
  return url.slice(url.indexOf(marker) + marker.length);
}

/**
 * Delete photos that are no longer used. Never touches a photo that shipped
 * with the site, and never fails the save that replaced it: an orphaned file
 * costs a few kilobytes, a failed save costs the edit.
 */
export async function removePhotos(urls: (string | null | undefined)[]): Promise<void> {
  const paths = urls.map(uploadedPath).filter((p): p is string => Boolean(p));
  if (!paths.length) return;
  const { error } = await createSupabaseAdminClient().storage.from("site-media").remove(paths);
  if (error) console.error("[media] could not remove old photos:", error);
}
