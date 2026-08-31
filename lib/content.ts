/**
 * Static content for the marketing site.
 *
 * COPY CONSTRAINTS (from client review, 2026-08-28) — please preserve these:
 *  - No "48 hour" guarantee. Speed is a strength, never a promise.
 *  - No "75%" stat and no "first two candidates" claim. Both are stale/absolute.
 *  - Direct hire is the majority of the business. Contract work is minimal and
 *    must not read as the headline service.
 *  - Avoid the words "hard" and "deep", and avoid em dashes in visible copy.
 *  - No positioning against national agencies.
 *  - By appointment only. Never invite people to drop in.
 *
 * Job data lives in lib/jobs/, behind a JobSource adapter.
 */

export const CONTACT = {
  street: "2602 Dauphin Street",
  city: "Mobile, Alabama 36606",
  phone: "251.300.3584",
  phoneRaw: "+12513003584",
  email: "jobs@fitrecruiting.com",
  /** Visits are scheduled so a recruiter has read the résumé beforehand. */
  byAppointment: true,
  // TODO(chambliss): confirm founding year. Nothing is published anywhere, so
  // nothing is claimed on the site.
  founded: null as string | null,
} as const;

/** Secondary brand stamp. Recurring, not the primary tagline. */
export const BRAND_STAMP = ["Local.", "Trusted.", "Connected."] as const;

/** Lead message for job seekers. Appears high on the homepage. */
export const CANDIDATE_PROMISE = {
  hook: "Looking for what's next?",
  line: "Working with Fit never costs you a thing.",
} as const;

/**
 * Functional disciplines Fit recruits for.
 *
 * Engineering was removed at the client's request: they can recruit for it, but
 * it is not an area they would claim as a specialty.
 *
 * TODO(chambliss): several currently-open roles do not map to these four
 * (Inside Sales Representative, Senior Purchasing Manager, Business Operations
 * Analyst). Worth deciding whether Sales and Operations should be listed too.
 */
export const SPECIALTIES = [
  {
    title: "Accounting & Finance",
    body: "Controllers, staff accountants, AR and AP leadership, and CFOs.",
  },
  {
    title: "Information Technology",
    body: "Developers, sysadmins, infrastructure leads, and security professionals.",
  },
  {
    title: "Office Administration",
    body: "Office managers, legal assistants, and executive support.",
  },
  {
    title: "Executive Search",
    body: "Discreet placement of senior leaders, directors, and C-suite roles.",
  },
] as const;

/**
 * How Fit engages. Direct hire leads deliberately: it is the majority of the
 * business, and the site should never read as a temp staffing agency.
 */
export const STAFFING_MODELS = [
  {
    title: "Direct hire",
    body: "The core of what we do. Full-time, salaried placements from individual contributors through senior leadership.",
    primary: true,
  },
  {
    title: "Temp-to-hire",
    body: "Work together before either side commits, then convert when the fit is proven.",
    primary: false,
  },
  {
    title: "Contract",
    body: "Occasional short-term coverage when a client needs it, with payroll handled by Fit.",
    primary: false,
  },
] as const;

export const PROCESS = [
  {
    step: "01",
    title: "We meet you in person",
    body: "We come to your office, meet the team, and get a feel for how the place actually runs. It is the part most firms skip, and it is the reason our shortlists land.",
  },
  {
    step: "02",
    title: "We get selective",
    body: "Reference checks, background checks, skills testing, and personality assessments, with drug screening available on request.",
  },
  {
    step: "03",
    title: "We move quickly",
    body: "Most searches have qualified people in front of you within a few days. When a role is genuinely niche, we tell you that up front instead of sending filler.",
  },
  {
    step: "04",
    title: "You make the hire",
    body: "Our fees are negotiable and structured around what actually works for your business.",
  },
] as const;

/** Why a candidate should use Fit. Job seekers are the primary web audience. */
export const CANDIDATE_POINTS = [
  {
    title: "It never costs you a thing",
    body: "Our fees are paid by the companies hiring. You are never charged to work with us.",
  },
  {
    title: "A real person reads it",
    body: "Every résumé that comes in is read by a recruiter here in Mobile, not filtered by software.",
  },
  {
    title: "We know these employers",
    body: "We have walked into these offices and met these teams. We can tell you what a place is actually like to work.",
  },
  {
    title: "Roles you will not see posted",
    body: "A good portion of what we fill never reaches a job board. Being on our radar is how you hear about those.",
  },
] as const;
