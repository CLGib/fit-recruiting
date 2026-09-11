import { z } from "zod";

/**
 * Everything on the public site that Fit can edit themselves.
 *
 * Shared by server and client: the portal validates as you type, the server
 * validates again on save, and the public pages validate on read so a bad row
 * can never take a page down. No server-only marker, no database access.
 *
 * The defaults ARE the site's current copy. A block with no row in the
 * database renders exactly as the site did before editing existed, so the
 * migration is a no-op for visitors until someone changes something.
 */

const text = (max: number) => z.string().trim().min(1, "This cannot be empty.").max(max);

/**
 * Each specialty picks its icon from this list rather than having one looked
 * up from its title. Keyed by title, renaming "Accounting & Finance" to
 * "Accounting and Finance" would have made the icon silently disappear, and
 * nobody editing the words would have known why.
 */
export const SPECIALTY_ICONS = [
  "accounting",
  "technology",
  "administration",
  "executive",
  "engineering",
  "none",
] as const;
export type SpecialtyIcon = (typeof SPECIALTY_ICONS)[number];

export const SPECIALTY_ICON_LABEL: Record<SpecialtyIcon, string> = {
  accounting: "Calculator",
  technology: "Computer screen",
  administration: "Folder",
  executive: "Magnifying glass",
  engineering: "Ruler",
  none: "No icon",
};

export const ContactSchema = z.object({
  street: text(120),
  city: text(120),
  phone: text(40),
  email: z.string().trim().email("That does not look like an email address.").max(120),
});

export const HomeSchema = z.object({
  heroTitle: text(60),
  heroTitleAccent: text(60),
  heroIntro: text(500),
});

export const IntroSchema = z.object({
  intro: text(800),
});

export const SpecialtiesSchema = z.object({
  items: z
    .array(
      z.object({
        title: text(60),
        body: text(240),
        // Defaulted so a row saved before icons existed still parses.
        icon: z.enum(SPECIALTY_ICONS).default("none"),
      }),
    )
    .min(1, "Keep at least one.")
    .max(8, "Eight at most, or the grid stops reading as a short list."),
});

export const TeamPageSchema = z.object({
  /** False keeps the team page out of search and shows a draft notice. */
  published: z.boolean(),
});

export type Contact = z.infer<typeof ContactSchema>;
export type Home = z.infer<typeof HomeSchema>;
export type Intro = z.infer<typeof IntroSchema>;
export type Specialties = z.infer<typeof SpecialtiesSchema>;
export type TeamPage = z.infer<typeof TeamPageSchema>;

export const DEFAULTS = {
  contact: {
    street: "2602 Dauphin Street",
    city: "Mobile, Alabama 36606",
    phone: "251.300.3584",
    email: "jobs@fitrecruiting.com",
  } satisfies Contact,
  home: {
    heroTitle: "The right people,",
    heroTitleAccent: "the right fit.",
    heroIntro:
      "A boutique recruiting firm placing accounting, IT, administrative, and executive talent across Mobile, Baldwin County, and the Gulf Coast. We have met these employers and walked into their offices, which is why our shortlists are short.",
  } satisfies Home,
  about: {
    intro:
      "Fit Recruiting places accounting, information technology, office administration, and executive talent across the Gulf Coast. Most of what we do is direct hire, full-time roles with real salaries and real career weight. We keep our client list small enough that you always talk to someone who knows your name.",
  } satisfies Intro,
  employers: {
    intro:
      "You will not get a stack to sort through. You will get a short list of people we have sat down with, screened, and would put our name behind.",
  } satisfies Intro,
  specialties: {
    items: [
      { title: "Accounting & Finance", body: "Controllers, staff accountants, AR and AP leadership, and CFOs.", icon: "accounting" },
      { title: "Information Technology", body: "Developers, sysadmins, infrastructure leads, and security professionals.", icon: "technology" },
      { title: "Office Administration", body: "Office managers, legal assistants, and executive support.", icon: "administration" },
      { title: "Executive Search", body: "Discreet placement of senior leaders, directors, and C-suite roles.", icon: "executive" },
    ],
  } satisfies Specialties,
  team_page: { published: false } satisfies TeamPage,
};

export const SCHEMAS = {
  contact: ContactSchema,
  home: HomeSchema,
  about: IntroSchema,
  employers: IntroSchema,
  specialties: SpecialtiesSchema,
  team_page: TeamPageSchema,
} as const;

export type ContentKey = keyof typeof SCHEMAS;
export type ContentValue<K extends ContentKey> = z.infer<(typeof SCHEMAS)[K]>;

export const CONTENT_KEYS = Object.keys(SCHEMAS) as ContentKey[];

export function isContentKey(value: string): value is ContentKey {
  return value in SCHEMAS;
}

/** "251.300.3584" -> "+12513003584", for tel: links. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}
