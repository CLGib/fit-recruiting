import type { Job } from "../jobs/types";
import { toSlug } from "../jobs/types";

/** The JobOrder fields we request. Keep in sync with BullhornJobOrder below. */
export const JOB_ORDER_FIELDS = [
  "id",
  "title",
  "isOpen",
  "isPublic",
  "employmentType",
  "dateAdded",
  "dateEnd",
  "address(city,state)",
  "categories(name)",
  "salary",
  "publicDescription",
].join(",");

export type BullhornJobOrder = {
  id: number;
  title: string;
  isOpen: boolean;
  isPublic: number;
  employmentType: string | null;
  dateAdded: number;
  dateEnd: number | null;
  address?: { city?: string | null; state?: string | null };
  categories?: { data?: { name: string }[] };
  salary?: number | null;
  publicDescription?: string | null;
};

/** Bullhorn's employmentType strings do not match our union, so map explicitly. */
function mapType(v: string | null): Job["type"] {
  switch ((v ?? "").toLowerCase()) {
    case "contract":
      return "Contract";
    case "contract to hire":
    case "temp to hire":
      return "Temp-to-Hire";
    case "part time":
      return "Part Time";
    default:
      return "Full Time";
  }
}

function isoDate(ms: number | null | undefined, fallback: string): string {
  if (!ms) return fallback;
  return new Date(ms).toISOString().slice(0, 10);
}

/** publicDescription is HTML. The site renders plain text, so strip tags. */
function toText(html: string | null | undefined): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || undefined;
}

export function mapJobOrder(jo: BullhornJobOrder): Job {
  const city = jo.address?.city?.trim();
  const state = jo.address?.state?.trim();
  const location = [city, state].filter(Boolean).join(", ") || "Gulf Coast";
  const posted = isoDate(jo.dateAdded, new Date().toISOString().slice(0, 10));

  return {
    // Slug includes the id so two roles with the same title and city cannot
    // collide and silently overwrite each other on the job board.
    slug: `${toSlug(jo.title, location)}-${jo.id}`,
    title: jo.title,
    location,
    type: mapType(jo.employmentType),
    categories: jo.categories?.data?.map((c) => c.name) ?? [],
    salary: null, // Bullhorn stores a number; Fit does not publish salary. See note.
    postedAt: posted,
    expiresAt: isoDate(jo.dateEnd, posted),
    status: jo.isOpen ? "active" : "expired",
    summary: toText(jo.publicDescription),
  };
}
