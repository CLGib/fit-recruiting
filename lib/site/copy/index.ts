/**
 * Every page's editable copy, in the order the portal lists them.
 *
 * WRITING DEFAULTS. Fit's copy rules, from two rounds of client review. The
 * defaults here should follow them, and they are worth passing on to whoever
 * at Fit edits the site:
 *  - No "48 hour" guarantee. Speed is a strength, never a promise.
 *  - No "75%" stat and no "first two candidates" claim.
 *  - Direct hire is the majority of the business; contract work is minimal.
 *  - Avoid the words "hard" and "deep", and avoid em dashes.
 *  - No positioning against national agencies.
 *  - By appointment only. Never invite people to drop in.
 *  - Shorter and sharper over complete. Say each thing once, in one place.
 *  - One two-part italic headline per page at most. Eight of them on one page
 *    is what made the first draft read as AI written.
 */
import type { PageCopy, PageDef } from "./fields.ts";
import { defaultsOf } from "./fields.ts";
import { about } from "./pages/about.ts";
import { audit } from "./pages/audit.ts";
import { candidates } from "./pages/candidates.ts";
import { contact } from "./pages/contact.ts";
import { employers } from "./pages/employers.ts";
import { guide } from "./pages/guide.ts";
import { home } from "./pages/home.ts";
import { jobs } from "./pages/jobs.ts";
import { privacy } from "./pages/privacy.ts";
import { site } from "./pages/site.ts";
import { submit } from "./pages/submit.ts";
import { team } from "./pages/team.ts";

export const PAGES = {
  site,
  home,
  candidates,
  jobs,
  submit,
  audit,
  guide,
  employers,
  about,
  contact,
  team,
  privacy,
} as const;

export type PageKey = keyof typeof PAGES;
export type Copy = { [K in PageKey]: PageCopy<(typeof PAGES)[K]> };

export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

export function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(PAGES, value);
}

/** Every page's defaults: the site exactly as written, before any edits. */
export function allDefaults(): Copy {
  // Built with a plain loop and cast once at the end: PAGES[k] across every
  // key is a union of twelve page types, and TypeScript cannot infer one
  // generic for defaultsOf from a union. Each value is still exactly that
  // page's defaults; only the compiler's view of the whole object is widened.
  const out: Record<string, unknown> = {};
  for (const k of PAGE_KEYS) out[k] = defaultsOf(pageDef(k));
  return out as unknown as Copy;
}

/**
 * A page's definition, for code that works across every page generically: the
 * editor, the save action, the reader.
 *
 * PAGES[key] for a key only known at runtime is a union of twelve specific page
 * types, and TypeScript will not compare a union like that with the generic
 * PageDef. Every page IS a PageDef, so the cast is sound; routing it through
 * this one function keeps it in one place instead of scattered across callers.
 */
export function pageDef(key: PageKey): PageDef {
  return PAGES[key] as unknown as PageDef;
}

/** Storage keys are "page.field", so a field key may not contain a dot. */
export const storageKey = (page: PageKey, field: string) => `${page}.${field}`;
