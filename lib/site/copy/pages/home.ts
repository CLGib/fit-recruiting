import { definePage, items, lines, long, text } from "../fields.ts";

export const home = definePage({
  label: "Homepage",
  path: "/",
  description: "The first thing anyone sees: who Fit is, what is open this week, and what makes Fit different.",
  fields: {
    heroEyebrow: text("Small line above the headline", "Mobile, Alabama · Gulf Coast", { max: 60 }),
    heroTitle: text("Headline, first line", "The right people,", { max: 60 }),
    heroTitleAccent: text("Headline, second line (gold italic)", "the right fit.", { max: 60 }),
    heroIntro: long(
      "Introduction",
      "A boutique recruiting firm placing accounting, IT, administrative, and executive talent across Mobile, Baldwin County, and the Gulf Coast. We have met these employers and walked into their offices, which is why our shortlists are short.",
      { max: 500, rows: 4 },
    ),
    heroButtonCandidates: text("Job seeker button", "I am looking for a job", { max: 40 }),
    heroButtonEmployers: text("Employer button", "I am hiring", { max: 40 }),

    jobsHeading: text("Heading", "Open this week", { max: 60 }),
    jobsLink: text("Link to all roles", "Search all {count} openings", {
      max: 60,
      hint: "{count} is replaced with the number of open roles.",
    }),
    jobsButton: text("Button under the list", "Not seeing it? Send your résumé", { max: 60 }),

    stampWords: lines("The three words", ["Local.", "Trusted.", "Connected."], {
      maxItems: 4,
      itemMax: 30,
      rows: 3,
      hint: "One per line. Shown large, stacked.",
    }),
    pillars: items(
      "What each one means",
      "point",
      { title: text("Title", "", { max: 40 }), body: long("Description", "", { max: 300, rows: 3 }) },
      [
        {
          title: "Local",
          body: "We live here. Every placement we make is on the Gulf Coast, and we know which companies people stay at.",
        },
        {
          // Was "a role is hard to fill": the client's copy rules rule out "hard".
          title: "Trusted",
          body: "Reference checks, background checks, skills testing. We would rather tell a client a role will take time than send filler.",
        },
        {
          title: "Connected",
          body: "A good portion of what we fill never reaches a job board. Knowing us is how people hear about those roles.",
        },
        {
          title: "Free to you",
          body: "If you are looking for work, our fees are paid by the companies hiring. You are never charged.",
        },
      ],
      { maxItems: 6 },
    ),

    ctaHeading: text("Heading", "Hiring, or looking?", { max: 60 }),
    ctaBody: long("Text", "Give us a call and we will set up a time.", { max: 300, rows: 2 }),
    ctaButton: text("Button", "Get in touch", { max: 40 }),
  },
  sections: [
    {
      title: "Top of the page",
      keys: ["heroEyebrow", "heroTitle", "heroTitleAccent", "heroIntro", "heroButtonCandidates", "heroButtonEmployers"],
    },
    {
      title: "Open roles",
      hint: "The roles themselves come from Roles in the portal. These are the words around them.",
      keys: ["jobsHeading", "jobsLink", "jobsButton"],
    },
    { title: "Local. Trusted. Connected.", keys: ["stampWords", "pillars"] },
    { title: "Closing", keys: ["ctaHeading", "ctaBody", "ctaButton"] },
  ],
});
