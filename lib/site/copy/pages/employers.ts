import { definePage, items, lines, long, text } from "../fields.ts";

export const employers = definePage({
  label: "For Employers",
  path: "/employers",
  description: "How Fit works with companies: screening, the process, and fees. The one place the process is explained.",
  fields: {
    eyebrow: text("Small line above the headline", "For employers", { max: 60 }),
    title: text("Headline, first line", "We send fewer people.", { max: 60 }),
    titleAccent: text("Headline, second line (gold italic)", "On purpose.", { max: 60 }),
    intro: long(
      "Introduction",
      "You will not get a stack to sort through. You will get a short list of people we have sat down with, screened, and would put our name behind.",
      { max: 500, rows: 3 },
    ),
    heroButton: text("Button", "Start a search", { max: 40 }),
    callButton: text("Call button", "Call {phone}", { max: 40, hint: "{phone} is replaced with your phone number." }),

    screeningEyebrow: text("Small line above the heading", "What's included", { max: 60 }),
    screeningTitle: text("Heading", "Everyone we send has been through all of this.", { max: 80 }),
    screeningBody: long("Text", "You are meeting people who have been checked, not just sourced.", { max: 300, rows: 2 }),
    screening: lines(
      "Checks",
      [
        "Reference checks",
        "Background checks",
        "Skills testing",
        "Personality assessments",
        "Drug screening on request",
        "An in-person interview with Fit",
      ],
      { maxItems: 12, itemMax: 80, rows: 6, hint: "One per line." },
    ),

    processEyebrow: text("Small line above the heading", "How it goes", { max: 60 }),
    processTitle: text("Heading", "From job order to hire.", { max: 80 }),
    // Was "This is the whole process. It is not repeated anywhere else on the
    // site.", which was a note to Christina that ended up in public copy.
    processBody: long("Text", "", { max: 300, rows: 2, optional: true, hint: "Optional." }),
    steps: items(
      "Steps",
      "step",
      { title: text("Title", "", { max: 60 }), body: long("Description", "", { max: 400, rows: 3 }) },
      [
        {
          title: "We meet you in person",
          body: "We come to your office, meet the team, and get a feel for how the place actually runs. It is the part most firms skip, and it is the reason our shortlists land.",
        },
        {
          title: "We get selective",
          body: "Reference checks, background checks, skills testing, and personality assessments, with drug screening available on request.",
        },
        {
          title: "We move quickly",
          body: "Most searches have qualified people in front of you within a few days. When a role is genuinely niche, we tell you that up front instead of sending filler.",
        },
        {
          title: "You make the hire",
          body: "Our fees are negotiable and structured around what actually works for your business.",
        },
      ],
      { maxItems: 6, hint: "Numbered automatically, in this order." },
    ),

    engagementEyebrow: text("Small line above the heading", "Engagement", { max: 60 }),
    engagementTitle: text("Heading", "Fees that fit the business.", { max: 80 }),
    engagementBody: long(
      "Text",
      "Mostly direct hire, with room to flex. Our fees are negotiable and structured around what works for you.",
      { max: 300, rows: 2 },
    ),
    models: items(
      "Ways to work with Fit",
      "option",
      { title: text("Title", "", { max: 60 }), body: long("Description", "", { max: 300, rows: 3 }) },
      [
        {
          title: "Direct hire",
          body: "The core of what we do. Full-time, salaried placements from individual contributors through senior leadership.",
        },
        {
          title: "Temp-to-hire",
          body: "Work together before either side commits, then convert when the fit is proven.",
        },
        {
          title: "Contract",
          body: "Occasional short-term coverage when a client needs it, with payroll handled by Fit.",
        },
      ],
      { maxItems: 4, hint: "The first one is highlighted in gold, so keep the main service first." },
    ),

    closingHeading: text("Heading", "Tell us about the role. We’ll take it from there.", { max: 100 }),
    closingButton: text("Button", "Start a search", { max: 40 }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "titleAccent", "intro", "heroButton", "callButton"] },
    { title: "Screening", keys: ["screeningEyebrow", "screeningTitle", "screeningBody", "screening"] },
    { title: "The process", keys: ["processEyebrow", "processTitle", "processBody", "steps"] },
    { title: "Fees", keys: ["engagementEyebrow", "engagementTitle", "engagementBody", "models"] },
    { title: "Closing", keys: ["closingHeading", "closingButton"] },
  ],
});
