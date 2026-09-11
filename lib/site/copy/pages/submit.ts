import { definePage, lines, long, text } from "../fields.ts";

export const submit = definePage({
  label: "Submit a résumé",
  path: "/submit-resume",
  description: "The résumé form page, and the thank-you message people see after sending one.",
  fields: {
    eyebrow: text("Small line above the headline", "Candidates", { max: 60 }),
    title: text("Headline, first line", "Send us your", { max: 60 }),
    titleAccent: text("Headline, second line (gold italic)", "résumé.", { max: 60 }),
    intro: long(
      "Introduction",
      "You don’t need an open role to send one. A good portion of what we place never reaches the job board. We go find someone because we already knew who to call.",
      { max: 500, rows: 3, hint: "Shown when someone is not applying for a specific role." },
    ),
    applyingFor: text("Label when applying for a specific role", "Applying for", { max: 40 }),

    points: lines(
      "Reassurances",
      [
        "A person here in Mobile reads every submission.",
        "We'll tell you honestly if we don't have a fit right now.",
        "Your résumé is stored privately and never sold or shared without your say-so.",
      ],
      { maxItems: 6, itemMax: 200, rows: 4, hint: "One per line." },
    ),
    alternative: text("Email or call line", "Rather do it the old-fashioned way? Email {email} or call {phone}.", {
      max: 200,
      hint: "{email} and {phone} become links to your contact details.",
    }),

    success: long(
      "Thank-you message",
      "Thank you. Your résumé is in, a real person here in Mobile will read it, and we'll reach out when something fits.",
      { max: 400, rows: 3, hint: "Shown on screen as soon as someone sends their résumé." },
    ),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "titleAccent", "intro", "applyingFor"] },
    { title: "Beside the form", keys: ["points", "alternative"] },
    { title: "After sending", keys: ["success"] },
  ],
});
