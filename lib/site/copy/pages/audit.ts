import { definePage, items, long, text } from "../fields.ts";

export const audit = definePage({
  label: "Free résumé review",
  path: "/resume-audit",
  description:
    "The page where candidates upload a résumé for instant written feedback. The feedback itself is written fresh for each résumé.",
  fields: {
    eyebrow: text("Small line above the headline", "For candidates", { max: 60 }),
    title: text("Headline", "Free résumé review.", { max: 60 }),
    intro: long(
      "Introduction",
      "Upload your résumé and you will get written notes back on this page in about a minute: what a recruiter takes from it in the first ten seconds, what is already working, and specific changes to make before you send it anywhere else.",
      { max: 600, rows: 4 },
    ),
    points: items(
      "What to know",
      "point",
      {
        lead: text("Bold opening", "", { max: 60 }),
        body: long("The rest of the sentence", "", { max: 300, rows: 2 }),
      },
      [
        { lead: "It is free", body: "and there is no account to create." },
        {
          lead: "Nothing is stored.",
          body: "Your file is read once and then discarded, so this is not an application and nobody at Fit sees it.",
        },
        {
          lead: "It is written by Claude, not by a recruiter.",
          body: "If what you want is a person here in Mobile to read your résumé and talk to you about what you are looking for, send it to us instead.",
        },
      ],
      { maxItems: 5 },
    ),
    formHint: text("Under the upload box", "PDF, up to 4 MB.", { max: 60 }),
    formButton: text("Upload button", "Review my résumé", { max: 40 }),

    personHeading: text("Heading", "Want a person to read it?", { max: 60 }),
    personBody: long(
      "Text",
      "Send it through the résumé form and a recruiter here reads it. That is the one that reaches us and puts you on our radar for roles that never get posted.",
      { max: 400, rows: 3 },
    ),
    personLink: text("Link", "Submit your résumé", { max: 40 }),

    resultImpression: text("First section", "First impression", { max: 60 }),
    resultWorking: text("What is working", "What is already working", { max: 60 }),
    resultFixes: text("What to change", "What to change first", { max: 60 }),
    resultTry: text("Label before each suggested rewrite", "Try", { max: 20 }),
    resultMissing: text("What is missing", "What a recruiter will look for and not find", { max: 80 }),
    resultLayout: text("Layout notes", "Layout and readability", { max: 60 }),
    resultPersonHeading: text("Closing heading", "Want a person to look at it?", { max: 60 }),
    resultPersonBody: long(
      "Closing text",
      "This was written by Claude, not by a recruiter. If you would like someone here in Mobile to read it and talk to you about what you are looking for, send it over.",
      { max: 400, rows: 3 },
    ),
    resultPersonButton: text("Closing button", "Submit your résumé", { max: 40 }),
    resultNotKept: text("Final line", "We did not keep a copy of your file. Nothing you uploaded was saved.", { max: 160 }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "intro", "points", "formHint", "formButton"] },
    { title: "Below the upload", keys: ["personHeading", "personBody", "personLink"] },
    {
      title: "Headings on the feedback",
      hint: "The feedback is written for each résumé. These are the headings it sits under.",
      keys: [
        "resultImpression",
        "resultWorking",
        "resultFixes",
        "resultTry",
        "resultMissing",
        "resultLayout",
        "resultPersonHeading",
        "resultPersonBody",
        "resultPersonButton",
        "resultNotKept",
      ],
    },
  ],
});
