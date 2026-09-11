import { definePage, long, text } from "../fields.ts";

export const contact = definePage({
  label: "Contact",
  path: "/contact",
  description:
    "The Contact page. The address, phone and email themselves are under Site-wide, so they stay the same everywhere.",
  fields: {
    eyebrow: text("Small line above the headline", "Contact", { max: 60 }),
    title: text("Headline, first line", "Come sit down", { max: 60 }),
    titleAccent: text("Headline, second line (gold italic)", "with us.", { max: 60 }),
    intro: long(
      "Introduction",
      "Whether you’re hiring or looking, the first conversation is always the same: a real one. Coffee is on us.",
      { max: 500, rows: 3 },
    ),
    appointmentLead: text("Appointment note: bold opening", "We meet by appointment.", { max: 60 }),
    appointmentBody: long(
      "Appointment note: the rest",
      "Give us a call or send your résumé first, and we’ll set a time with a recruiter who has already read it. That way the conversation is actually worth your drive.",
      { max: 400, rows: 3 },
    ),

    officeLabel: text("Address label", "Office · by appointment", { max: 60 }),
    phoneLabel: text("Phone label", "Phone", { max: 30 }),
    emailLabel: text("Email label", "Email", { max: 30 }),

    candidateEyebrow: text("Job seekers: small line", "Looking for a role", { max: 60 }),
    candidateTitle: text("Job seekers: heading", "Submit your résumé", { max: 60 }),
    candidateBody: long(
      "Job seekers: text",
      "Send it over and a person here in Mobile will actually read it. We’ll reach out when something fits, including roles that never make it to the job board.",
      { max: 400, rows: 3 },
    ),
    candidateLink: text("Job seekers: link", "Submit résumé", { max: 40 }),

    hiringEyebrow: text("Employers: small line", "Hiring", { max: 60 }),
    hiringTitle: text("Employers: heading", "Start a search", { max: 60 }),
    hiringBody: long(
      "Employers: text",
      "Tell us about the role and the team. We’ll come meet you, learn the culture, and get to work on a short list of people worth your time.",
      { max: 400, rows: 3 },
    ),
    hiringLink: text("Employers: link", "Email us", { max: 40 }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "titleAccent", "intro", "appointmentLead", "appointmentBody"] },
    { title: "Contact details labels", keys: ["officeLabel", "phoneLabel", "emailLabel"] },
    { title: "For job seekers", keys: ["candidateEyebrow", "candidateTitle", "candidateBody", "candidateLink"] },
    { title: "For employers", keys: ["hiringEyebrow", "hiringTitle", "hiringBody", "hiringLink"] },
  ],
});
