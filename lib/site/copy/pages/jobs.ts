import { definePage, long, text } from "../fields.ts";

export const jobs = definePage({
  label: "Open roles and job pages",
  path: "/jobs",
  description:
    "The words around the job listings. The roles themselves, and each one's description, are edited under Roles.",
  fields: {
    eyebrow: text("Small line above the headline", "Now hiring", { max: 60 }),
    title: text("Headline", "Open", { max: 40 }),
    titleAccent: text("Headline, gold italic part", "positions.", { max: 40 }),
    intro: long(
      "Introduction",
      "A live look at what we’re working on right now. Don’t see the right one? Plenty of our placements never hit this page. Send your résumé and we’ll keep you in mind.",
      { max: 500, rows: 3 },
    ),

    searchLabel: text("Search label", "Search roles", { max: 40 }),
    searchPlaceholder: text("Search box hint", "Job title, location, or discipline", { max: 60 }),
    filterLabel: text("Filter label", "Filter by discipline", { max: 40 }),
    filterAll: text("Show-everything filter", "All", { max: 30 }),
    resultsOne: text("Result count, one role", "Showing 1 role", { max: 40 }),
    resultsMany: text("Result count, several roles", "Showing {count} roles", {
      max: 40,
      hint: "{count} is replaced with the number shown.",
    }),
    emptyHeading: text("No matches: heading", "No roles match that search.", { max: 80 }),
    emptyBody: long(
      "No matches: text",
      "We place plenty of roles that never make it to the board. Send us your résumé and we’ll reach out when something fits.",
      { max: 300, rows: 3 },
    ),
    emptyButton: text("No matches: button", "Submit your résumé", { max: 40 }),

    backLink: text("Back link", "All open roles", { max: 40 }),
    noSummary: long(
      "Shown when a role has no summary yet",
      "We’re actively placing this role. Reach out and we’ll walk you through the full description, the team, and what the client is really looking for, including the parts that never fit in a job posting.",
      { max: 500, rows: 3 },
    ),
    responsibilitiesHeading: text("Responsibilities heading", "What you’ll do", { max: 60 }),
    requirementsHeading: text("Requirements heading", "What we’re looking for", { max: 60 }),
    applyHeading: text("Apply box: heading", "Interested in this role?", { max: 60 }),
    applyBody: long(
      "Apply box: text",
      "Send your résumé and we’ll be in touch. Every application is read by a person here in Mobile, not by a filter.",
      { max: 300, rows: 3 },
    ),
    applyButton: text("Apply box: button", "Apply for this role", { max: 40 }),
    labelPosted: text("“Posted” label", "Posted", { max: 30 }),
    labelEmployment: text("“Employment” label", "Employment", { max: 30 }),
    labelLocation: text("“Location” label", "Location", { max: 30 }),
    labelPay: text("“Compensation” label", "Compensation", { max: 30 }),
    questions: text("Questions line", "Questions first? Call {phone}.", {
      max: 120,
      hint: "{phone} becomes a link to your phone number.",
    }),
    similarHeading: text("Similar roles heading", "Similar openings", { max: 60 }),
  },
  sections: [
    { title: "Open roles page", keys: ["eyebrow", "title", "titleAccent", "intro"] },
    {
      title: "Search and filters",
      keys: ["searchLabel", "searchPlaceholder", "filterLabel", "filterAll", "resultsOne", "resultsMany"],
    },
    { title: "When nothing matches", keys: ["emptyHeading", "emptyBody", "emptyButton"] },
    {
      title: "Every job page",
      hint: "The same on every role. The title, summary, responsibilities and requirements come from the role itself.",
      keys: [
        "backLink",
        "noSummary",
        "responsibilitiesHeading",
        "requirementsHeading",
        "applyHeading",
        "applyBody",
        "applyButton",
        "labelPosted",
        "labelEmployment",
        "labelLocation",
        "labelPay",
        "questions",
        "similarHeading",
      ],
    },
  ],
});
