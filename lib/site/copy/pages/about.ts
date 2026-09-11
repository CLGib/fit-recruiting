import { definePage, items, long, select, text } from "../fields.ts";
import { SPECIALTY_ICON_OPTIONS } from "../icons.ts";

export const about = definePage({
  label: "About",
  path: "/about",
  description: "Who Fit is, where they work, and what they recruit for.",
  fields: {
    eyebrow: text("Small line above the headline", "About Fit", { max: 60 }),
    title: text("Headline, first line", "Boutique by choice,", { max: 60 }),
    titleAccent: text("Headline, second line (gold italic)", "not by size.", { max: 60 }),
    intro: long(
      "Introduction",
      "Fit Recruiting places accounting, information technology, office administration, and executive talent across the Gulf Coast. Most of what we do is direct hire, full-time roles with real salaries and real career weight. We keep our client list small enough that you always talk to someone who knows your name.",
      { max: 800, rows: 5 },
    ),

    marketsEyebrow: text("Small line above the heading", "Why Fit", { max: 60 }),
    marketsTitle: text("Heading", "Where we work.", { max: 80 }),
    marketsBody: long(
      "Text",
      "We are not calling from three states away. We know these companies, these neighborhoods, and what a commute across the bay really costs you.",
      { max: 400, rows: 3 },
    ),
    markets: items(
      "Areas",
      "area",
      { place: text("Place", "", { max: 60 }), note: long("Description", "", { max: 240, rows: 2 }) },
      [
        { place: "Mobile", note: "Our home. Downtown, midtown, west Mobile, and the port." },
        { place: "Baldwin County", note: "Spanish Fort, Daphne, Fairhope, Foley, and the beaches." },
        { place: "Mississippi Gulf Coast", note: "Pascagoula, Moss Point, and across the state line." },
      ],
      { maxItems: 6 },
    ),

    specialtiesEyebrow: text("Small line above the heading", "Disciplines", { max: 60 }),
    specialtiesTitle: text("Heading", "What we recruit for.", { max: 80 }),
    specialtiesBody: long(
      "Text",
      "Four areas we know well, because knowing a field is the only honest way to judge someone working in it.",
      { max: 400, rows: 3, hint: "If you add or remove a specialty, check this still says the right number." },
    ),
    specialties: items(
      "Specialties",
      "specialty",
      {
        title: text("Name", "", { max: 60 }),
        body: long("Description", "", { max: 240, rows: 2 }),
        icon: select("Icon", "none", SPECIALTY_ICON_OPTIONS, { preview: "discipline-icon" }),
      },
      [
        { title: "Accounting & Finance", body: "Controllers, staff accountants, AR and AP leadership, and CFOs.", icon: "accounting" },
        { title: "Information Technology", body: "Developers, sysadmins, infrastructure leads, and security professionals.", icon: "technology" },
        { title: "Office Administration", body: "Office managers, legal assistants, and executive support.", icon: "administration" },
        { title: "Executive Search", body: "Discreet placement of senior leaders, directors, and C-suite roles.", icon: "executive" },
      ],
      { maxItems: 8, hint: "Each keeps the icon you pick, whatever you call it." },
    ),

    buttonCandidates: text("Job seeker button", "I am looking for a job", { max: 40 }),
    buttonEmployers: text("Employer button", "I am hiring", { max: 40 }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "titleAccent", "intro"] },
    { title: "Where we work", keys: ["marketsEyebrow", "marketsTitle", "marketsBody", "markets"] },
    { title: "What we recruit for", keys: ["specialtiesEyebrow", "specialtiesTitle", "specialtiesBody", "specialties"] },
    { title: "Closing buttons", keys: ["buttonCandidates", "buttonEmployers"] },
  ],
});
