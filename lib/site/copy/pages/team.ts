import { definePage, long, text, toggle } from "../fields.ts";

export const team = definePage({
  label: "Meet the Team",
  path: "/team",
  description: "The words around the team. The people themselves are edited just below.",
  fields: {
    published: toggle("The team page is ready to go public", false, {
      hint: "Everyone on it has approved their bio and headshot. While this is off, the page is hidden from search and shows a draft notice.",
    }),
    eyebrow: text("Small line above the headline", "Meet the team", { max: 60 }),
    title: text("Headline", "The people you’ll actually talk to.", { max: 80 }),
    intro: long(
      "Introduction",
      "We are a small team in Mobile, and you will work with the same person start to finish.",
      { max: 500, rows: 3 },
    ),
    closingBody: long(
      "Closing text",
      "We meet by appointment. Call us or send your résumé and we will set a time.",
      { max: 300, rows: 2 },
    ),
    closingButton: text("Closing button", "Submit your résumé", { max: 40 }),
    callButton: text("Call button", "Call {phone}", { max: 40, hint: "{phone} is replaced with your phone number." }),
  },
  sections: [
    { title: "Going public", keys: ["published"] },
    { title: "Top of the page", keys: ["eyebrow", "title", "intro"] },
    { title: "Closing", keys: ["closingBody", "closingButton", "callButton"] },
  ],
});
