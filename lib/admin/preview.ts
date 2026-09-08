/**
 * Local-only preview of the admin dashboard.
 *
 * SAFETY: gated on NODE_ENV === "development", which `next build` and every
 * Vercel deployment set to "production". The branch is therefore unreachable in
 * any deployed build, not merely discouraged. It additionally requires an
 * explicit ADMIN_DEV_PREVIEW=1 opt-in, so it stays off during normal local work.
 *
 * The rows below are invented sample data. This never reads real candidate
 * records, so previewing the layout cannot expose anyone's résumé or PII.
 */

export function isAdminPreview(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_PREVIEW === "1";
}

export type PreviewRow = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role_slug: string | null;
  message: string | null;
  resume_path: string | null;
  resume_filename: string | null;
  status: string;
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const PREVIEW_ROWS: PreviewRow[] = [
  {
    id: "sample-1",
    created_at: hoursAgo(3),
    first_name: "Sample",
    last_name: "Candidate",
    email: "sample.candidate@example.com",
    phone: "251.555.0142",
    role_slug: "tax-accountant-mobile-al",
    message:
      "I have four years in public accounting and I'm looking to move in-house. Available to start in about three weeks.",
    resume_path: "sample-1/resume.pdf",
    resume_filename: "sample-candidate-resume.pdf",
    status: "new",
  },
  {
    id: "sample-2",
    created_at: hoursAgo(28),
    first_name: "Second",
    last_name: "Example",
    email: "second.example@example.com",
    phone: null,
    role_slug: null,
    message: null,
    resume_path: "sample-2/resume.docx",
    resume_filename: "second-example-resume.docx",
    status: "reviewing",
  },
  {
    id: "sample-4",
    created_at: hoursAgo(9),
    first_name: "Fourth",
    last_name: "Sample",
    email: "fourth.sample@example.com",
    phone: "251.555.0176",
    role_slug: "inside-sales-representative-spanish-fort-al",
    message: null,
    resume_path: "sample-4/resume.pdf",
    resume_filename: "fourth-sample-resume.pdf",
    status: "new",
  },
  {
    id: "sample-3",
    created_at: hoursAgo(76),
    first_name: "Third",
    last_name: "Placeholder",
    email: "third.placeholder@example.com",
    phone: "251.555.0198",
    role_slug: "legal-assistant-mobile-al",
    message:
      "Six years as a legal assistant, currently in Baldwin County and happy to commute to Mobile.",
    resume_path: null,
    resume_filename: null,
    status: "contacted",
  },
];

/**
 * A sample briefing, so the detail layout can be reviewed without an API key
 * and without opening a real candidate's résumé. Invented, like the rows above.
 */
export const PREVIEW_ANALYSIS = {
  headline:
    "A staff accountant with four years in public accounting looking to move in-house on the Gulf Coast.",
  current_title: "Staff Accountant",
  years_experience: 4,
  location: "Mobile, AL",
  skills: ["QuickBooks", "NetSuite", "Excel", "Month-end close", "1120S and 1065 returns", "Sales tax filings"],
  employment: [
    { employer: "Regional CPA firm, Mobile", title: "Staff Accountant", start: "Mar 2022", end: "Present" },
    { employer: "Regional CPA firm, Mobile", title: "Accounting Associate", start: "Jun 2021", end: "Mar 2022" },
    { employer: "Gulf Coast retail group", title: "Accounting Intern", start: "Jan 2021", end: "May 2021" },
  ],
  education: ["B.S. Accounting, University of South Alabama", "CPA candidate, three sections passed"],
  strengths: [
    "Cut month-end close from twelve days to five after rebuilding the reconciliation workbook.",
    "Carried a book of roughly forty small business clients through two full tax seasons.",
    "Named as the firm's NetSuite point of contact during its migration.",
  ],
  things_to_ask_about: [
    {
      observation: "Both listed roles are at the same firm, and the résumé does not say why they are looking to move.",
      question: "What is drawing you toward an in-house role rather than staying in public accounting?",
    },
    {
      observation: "The résumé says CPA candidate with three sections passed but gives no date for the fourth.",
      question: "Where are you with the last section, and what timeline are you working toward?",
    },
  ],
  missing_information: [
    "No salary expectation stated.",
    "No notice period or availability date.",
    "No mention of whether they would consider Baldwin County.",
  ],
};

/**
 * Sample roles, so the roles screens can be walked through end to end without
 * a database. Invented, like everything else in this file. The three cover the
 * states that look different: published everywhere, open but not yet sent to
 * Bullhorn, and a bare draft with no description written.
 */
export const PREVIEW_ROLES = [
  {
    id: "role-1",
    slug: "senior-staff-accountant-mobile-al",
    title: "Senior Staff Accountant",
    location: "Mobile, AL",
    employment_type: "Full Time",
    categories: ["Accounting & Finance"],
    salary: "$70,000 to $82,000",
    intake_notes:
      "Reports to the controller, team of four. Lost someone to a competitor in June and they are behind on close. Wants someone who has owned a month-end close start to finish. Hybrid, three days in the office.",
    summary:
      "A manufacturer on the western side of Mobile is adding a senior accountant to a team of four. You would own month-end close, work directly with the controller, and have real say in how the close gets rebuilt after a stretch of running behind.",
    responsibilities: [
      "Own the month-end close and the reconciliations that feed it",
      "Prepare monthly financial statements and the variance commentary that goes with them",
      "Work with operations on inventory and cost accounting",
      "Support the annual audit and the external accountants",
      "Take a first pass at rebuilding the close calendar",
    ],
    requirements: [
      "Bachelor's degree in accounting",
      "Four or more years in a full-cycle accounting role",
      "Has run a month-end close start to finish",
      "Comfortable in Excel beyond pivot tables",
    ],
    status: "open",
    site_published_at: hoursAgo(50),
    bullhorn_job_order_id: "18442",
    bullhorn_synced_at: hoursAgo(49),
    linkedin_urn: "urn:li:jobPosting:4102938471",
    linkedin_synced_at: hoursAgo(48),
    description_model: "claude-opus-5",
    created_at: hoursAgo(52),
    updated_at: hoursAgo(48),
    created_by: "chambliss@fitrecruiting.com",
  },
  {
    id: "role-2",
    slug: "it-support-specialist-daphne-al",
    title: "IT Support Specialist",
    location: "Daphne, AL",
    employment_type: "Full Time",
    categories: ["Information Technology"],
    salary: null,
    intake_notes:
      "Small office, about 60 users across two sites. They have never had anyone internal, everything has been outsourced and they are tired of waiting on tickets.",
    summary:
      "A professional services firm on the Eastern Shore is hiring its first internal IT person. Right now everything runs through an outside vendor and the team is tired of waiting. You would be the person who fixes things the same day.",
    responsibilities: [
      "Handle day to day support for about sixty people across two offices",
      "Manage laptops, phones, and accounts from setup through retirement",
      "Take over the relationship with the outside vendor for anything you do not own",
      "Write down how things work, since none of it is documented today",
    ],
    requirements: [
      "Two or more years supporting end users directly",
      "Comfortable with Windows, Microsoft 365, and basic networking",
      "Able to be on site in Daphne",
    ],
    status: "open",
    site_published_at: hoursAgo(20),
    bullhorn_job_order_id: null,
    bullhorn_synced_at: null,
    linkedin_urn: null,
    linkedin_synced_at: null,
    description_model: "claude-opus-5",
    created_at: hoursAgo(22),
    updated_at: hoursAgo(20),
    created_by: "chambliss@fitrecruiting.com",
  },
  {
    id: "role-3",
    slug: "executive-assistant-mobile-al",
    title: "Executive Assistant",
    location: "Mobile, AL",
    employment_type: "Full Time",
    categories: ["Administrative"],
    salary: null,
    intake_notes:
      "Call with the CEO Friday. Supporting two executives. Heavy calendar and travel. She mentioned discretion several times.",
    summary: null,
    responsibilities: [],
    requirements: [],
    status: "draft",
    site_published_at: null,
    bullhorn_job_order_id: null,
    bullhorn_synced_at: null,
    linkedin_urn: null,
    linkedin_synced_at: null,
    description_model: null,
    created_at: hoursAgo(5),
    updated_at: hoursAgo(5),
    created_by: "chambliss@fitrecruiting.com",
  },
];

/** A sample match run for the preview candidate, against PREVIEW_ROLES. */
export const PREVIEW_MATCH = {
  overall:
    "Strongest against the senior accountant role in Mobile, where the month-end close experience lines up almost exactly. Worth a call this week.",
  matches: [
    {
      role_slug: "senior-staff-accountant-mobile-al",
      verdict: "worth_a_call",
      reasons: [
        "Has run a month-end close start to finish, which is the role's central requirement.",
        "Cut a close from twelve days to five, so they have done the rebuild this client is asking for.",
        "Already in Mobile, so the three-day hybrid schedule is not a hurdle.",
        "Public accounting background matches the client's preference for someone who has seen more than one set of books.",
      ],
      gaps: [
        "No stated experience with inventory or cost accounting, which the role lists.",
        "CPA is in progress rather than complete.",
      ],
      ask: "Have you worked anywhere with inventory on the balance sheet?",
    },
    {
      role_slug: "it-support-specialist-daphne-al",
      verdict: "not_this_one",
      reasons: [],
      gaps: [
        "No end user support experience on the résumé.",
        "Background is accounting rather than IT.",
      ],
      ask: null,
    },
  ],
};
