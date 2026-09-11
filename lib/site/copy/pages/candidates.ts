import { definePage, long, text } from "../fields.ts";

export const candidates = definePage({
  label: "For Candidates",
  path: "/for-candidates",
  description: "The front door for job seekers: what is open, and the three ways Fit can help.",
  fields: {
    eyebrow: text("Small line above the headline", "For candidates", { max: 60 }),
    title: text("Headline", "Start here.", { max: 60 }),
    intro: long(
      "Introduction",
      "Working with us never costs you anything. Companies pay our fees. Below is everything open right now, and three ways we can help whether or not one of them is right for you.",
      { max: 500, rows: 3 },
    ),

    rolesHeading: text("Heading", "Open roles", { max: 60 }),
    rolesLink: text("Link to all roles", "Search all {count}", {
      max: 60,
      hint: "{count} is replaced with the number of open roles.",
    }),

    submitTitle: text("Submit a résumé: title", "Send us your résumé", { max: 60 }),
    submitBody: long(
      "Submit a résumé: text",
      "A recruiter here in Mobile reads it. A good portion of what we fill never reaches a job board, so this is how you hear about those.",
      { max: 300, rows: 3 },
    ),
    auditTitle: text("Résumé review: title", "Get your résumé reviewed, free", { max: 60 }),
    auditBody: long(
      "Résumé review: text",
      "Upload it and get written notes back in about a minute on what to change. No account, and we do not keep the file.",
      { max: 300, rows: 3 },
    ),
    guideTitle: text("Interview guide: title", "Read the interview guide", { max: 60 }),
    guideBody: long(
      "Interview guide: text",
      "What to bring, what to ask, and the questions worth rehearsing before you walk in.",
      { max: 300, rows: 3 },
    ),

    talkHeading: text("Heading", "Rather just talk to someone?", { max: 60 }),
    talkBody: long(
      "Text",
      "Call the office and we will set up a time. Appointments only, so whoever you meet has read your résumé first.",
      { max: 300, rows: 2 },
    ),
    talkButton: text("Button", "Get in touch", { max: 40 }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "intro"] },
    { title: "Open roles", keys: ["rolesHeading", "rolesLink"] },
    {
      title: "Three ways we help",
      hint: "Each card always links to the same page. You are changing the words, not where it goes.",
      keys: ["submitTitle", "submitBody", "auditTitle", "auditBody", "guideTitle", "guideBody"],
    },
    { title: "Closing", keys: ["talkHeading", "talkBody", "talkButton"] },
  ],
});
