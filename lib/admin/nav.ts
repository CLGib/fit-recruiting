/**
 * Single source of truth for the team portal's sidebar.
 *
 * Plain data, no JSX, so the server layout and the client sidebar can both
 * import it. Add a destination here and it appears in the nav and in search.
 */
export type NavItem = {
  href: string;
  label: string;
  /**
   * What someone would TYPE when they do not know the page's name — the task,
   * not the destination. Nobody looking for a candidate thinks "Submissions";
   * they think "who applied". Search reads these; they never render as nav.
   */
  keywords?: string[];
  /** Shown greyed with a note, for work that is waiting on something external. */
  pending?: string;
};

export type NavSection = { title: string; items: NavItem[] };

export const PORTAL_NAV: NavSection[] = [
  {
    title: "Candidates",
    items: [
      {
        href: "/admin",
        label: "Résumés",
        keywords: [
          "who applied",
          "new applicant",
          "resume",
          "submissions",
          "read a resume",
          "candidate notes",
          "briefing",
          "add a note",
          "change a stage",
        ],
      },
    ],
  },
  {
    title: "Roles",
    items: [
      {
        href: "/admin/roles",
        label: "Open roles",
        keywords: [
          "job posting",
          "post a job",
          "write a job description",
          "new role",
          "close a role",
          "what is open",
          "job order",
        ],
      },
    ],
  },
];

/** True when `pathname` is inside (or exactly at) the given nav href. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    // /admin is the résumé list, not a parent of everything under it.
    return pathname === "/admin" || pathname.startsWith("/admin/submissions");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type NavSearchHit = {
  item: NavItem;
  section: string;
  /** The keyword that matched, when the label did not — rendered as context. */
  matchedKeyword?: string;
};

/**
 * Rank destinations against a typed query.
 *
 * A label match always outranks a keyword match, so typing "roles" lands on
 * Open roles rather than a page that merely mentions them. Substring, not
 * fuzzy: with a handful of destinations, fuzzy matching mostly produces
 * confident nonsense, and a wrong first result that Enter jumps straight to is
 * worse than showing nothing.
 */
export function searchNav(query: string): NavSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: Array<NavSearchHit & { score: number }> = [];

  for (const section of PORTAL_NAV) {
    for (const item of section.items) {
      const label = item.label.toLowerCase();
      let score = -1;
      let matchedKeyword: string | undefined;

      if (label.startsWith(q)) score = 0;
      else if (label.includes(q)) score = 1;
      else if (section.title.toLowerCase().includes(q)) score = 2;
      else {
        const hit = item.keywords?.find((k) => k.includes(q));
        if (hit) {
          score = 3;
          matchedKeyword = hit;
        }
      }

      if (score >= 0) scored.push({ item, section: section.title, matchedKeyword, score });
    }
  }

  return scored
    .sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label))
    .map(({ item, section, matchedKeyword }) => ({ item, section, matchedKeyword }));
}
