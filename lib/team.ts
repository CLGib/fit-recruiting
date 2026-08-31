/**
 * Meet the Team.
 *
 * SOURCES
 * -------
 * Names, titles and "About" text were read from LinkedIn profile screenshots
 * supplied by Christina on 2026-08-31. Nothing was scraped: LinkedIn returns
 * HTTP 999 to automated requests.
 *
 * PHOTO ASSIGNMENTS — confidence differs, do not treat these as equal:
 *   team-02 -> Chambliss.  CONFIRMED. Christina identified her as the owner,
 *              and her LinkedIn thumbnail shows the same floral outfit.
 *   team-01 -> Laura.      CONFIRMED. Same olive top and cream sofa as her
 *              LinkedIn profile photo.
 *   team-03 -> Anna.       INFERRED by elimination only: Lesley is dark-haired
 *              and this subject is blonde, leaving Anna as the only candidate.
 *              TODO(christina): eyeball this before the page goes live.
 *   Lesley has NO photo on file. A headshot is still needed.
 *
 * BIOS ARE DRAFTS. They are adapted from each person's own public LinkedIn
 * "About" text into the site's voice, so there is something concrete to react
 * to rather than a blank page. Nobody has approved their own bio yet, which is
 * why every entry is still `draft: true`. Publishing a bio and headshot is a
 * consent question, so each person should sign off on her own wording.
 *
 * The page shows a draft notice, stays out of the nav, and is noindexed while
 * any entry is `draft: true`.
 */

export type TeamMember = {
  name: string;
  title?: string;
  /** Path under /public. Omit to render an initials monogram. */
  photo?: string;
  photoAlt?: string;
  /** Photo match is a guess rather than a confirmation. */
  photoUnconfirmed?: boolean;
  specialty?: string;
  /** Two or three sentences, in their own voice. */
  bio?: string;
  /** One personal line. This is where the personality lives. */
  askMeAbout?: string;
  email?: string;
  linkedin?: string;
  /** True while any detail is still unapproved. */
  draft?: boolean;
};

export const TEAM: TeamMember[] = [
  {
    name: "Chambliss Brister",
    // CONFLICT: Christina identified her as the Owner; her LinkedIn headline
    // reads "Manager at Fit Recruiting". Using Owner on Christina's word.
    // TODO(christina): confirm the title she wants published.
    title: "Owner",
    photo: "/photos/team-02.jpg",
    photoAlt: "Chambliss Brister at the Fit Recruiting office in Mobile",
    bio: "I'm in the people business, and it is both rewarding and genuinely fun. Every day I get to build real relationships, whether that means helping a company find the right person for their team or helping someone think through their own next step. I see the work as a partnership. It is the best job in the world and I am grateful to do it.",
    linkedin: "https://www.linkedin.com/in/cbrister/",
    draft: true,
  },
  {
    name: "Anna Middleton",
    title: "Business Development Manager",
    photo: "/photos/team-03.jpg",
    photoAlt: "Anna Middleton at her desk in the Fit Recruiting office",
    photoUnconfirmed: true,
    // NOTE: Anna's and Chambliss's LinkedIn "About" text open almost
    // identically ("I'm in the people business"). Running both verbatim would
    // read as copy-paste, so Anna's is angled toward her business development
    // role instead. Both still need their own approval.
    bio: "I spend my time getting to know the companies we work with, what they actually need, and where someone would genuinely thrive. Partnering with people to help them find a Fit is the best part of this job.",
    linkedin: "https://www.linkedin.com/in/anna-middleton-658472bb/",
    draft: true,
  },
  {
    name: "Lesley Chapman",
    title: "Recruiter",
    bio: "I connect strong candidates with growing companies around Mobile. Building a team is one of the most consequential things a business does, and getting to help with that is a good way to spend a day. The right people really do change everything.",
    linkedin: "https://www.linkedin.com/in/lesley-chapman-821242413/",
    draft: true, // headshot still needed
  },
  {
    name: "Laura Griffith",
    title: "Recruiter",
    photo: "/photos/team-01.jpg",
    photoAlt: "Laura Griffith at the Fit Recruiting office in Mobile",
    bio: "I spend my days bridging the gap between good people and growing companies here in the Mobile area.",
    linkedin: "https://www.linkedin.com/in/laura-griffith-4b368b190/",
    draft: true,
  },
];

export const TEAM_IS_DRAFT = TEAM.some((m) => m.draft);

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
