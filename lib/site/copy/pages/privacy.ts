import { definePage, items, long, text } from "../fields.ts";

/**
 * DRAFT. Describes the data practices this site actually implements, so it is
 * accurate rather than boilerplate. It has NOT been reviewed by counsel.
 */
export const privacy = definePage({
  label: "Privacy policy",
  path: "/privacy",
  description: "How Fit handles the information people send. Worth having an attorney review before launch.",
  fields: {
    eyebrow: text("Small line above the headline", "Privacy", { max: 60 }),
    title: text("Headline, first line", "What we do with", { max: 60 }),
    titleAccent: text("Headline, second line (gold italic)", "your information.", { max: 60 }),
    intro: long(
      "Introduction",
      "Short version: we use it to help you find work, we keep it private, and we’ll delete it if you ask.",
      { max: 500, rows: 3 },
    ),
    sections: items(
      "Sections",
      "section",
      {
        title: text("Heading", "", { max: 80 }),
        body: long("Text", "", { max: 3000, rows: 6, hint: "One paragraph per line." }),
      },
      [
        {
          title: "What we collect",
          body: [
            "When you submit a résumé, we collect your name, email address, optional phone number, the role you're interested in, anything you write in the message field, and the résumé file itself.",
            "When you contact us by email or phone, we keep that correspondence so we can follow up.",
            "We do not use advertising trackers, and we do not sell any information you give us.",
          ].join("\n"),
        },
        {
          title: "How we use it",
          body: [
            "To evaluate you for current and future openings, and to contact you about opportunities.",
            "To share your qualifications with a prospective employer, only when you're being considered for a specific role and never without your knowledge.",
            "To keep our own records of who we've spoken with and when.",
          ].join("\n"),
        },
        {
          title: "How it's stored",
          body: [
            "Résumé files are held in private storage. They are not publicly accessible and cannot be reached by guessing a URL.",
            "Access is limited to Fit Recruiting staff who are signed in to our internal system.",
            "We sign in using one-time email links rather than passwords, so there is no password to be reused or leaked.",
          ].join("\n"),
        },
        {
          title: "How long we keep it",
          body: [
            "We keep candidate records so we can reach out when a fitting role comes along, often long after your first submission.",
            "You can ask us to delete your information at any time, and we will.",
          ].join("\n"),
        },
        {
          title: "Your choices",
          body: "Ask us what we have on file, ask us to correct it, or ask us to delete it. Email or call us using the details below and we'll take care of it.",
        },
      ],
      { maxItems: 15 },
    ),
    contactHeading: text("Contact box: heading", "Questions, or want your data removed?", { max: 80 }),
    contactBody: text("Contact box: text", "Email {email} or call {phone}. Our office is at {address}.", {
      max: 300,
      hint: "{email} and {phone} become links. {address} is replaced with your street address and city.",
    }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "titleAccent", "intro"] },
    { title: "The policy", keys: ["sections"] },
    { title: "Contact box", keys: ["contactHeading", "contactBody"] },
  ],
});
