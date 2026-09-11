import { definePage, long, text } from "../fields.ts";

export const site = definePage({
  label: "Site-wide",
  path: "/",
  description: "Contact details, the navigation, and the footer. These appear on every page.",
  fields: {
    street: text("Street address", "2602 Dauphin Street", { max: 120 }),
    city: text("City, state and ZIP", "Mobile, Alabama 36606", { max: 120 }),
    phone: text("Phone", "251.300.3584", { max: 40 }),
    email: text("Email", "jobs@fitrecruiting.com", { max: 120, format: "email" }),

    navCandidates: text("First link", "For Candidates", { max: 30 }),
    navEmployers: text("Second link", "For Employers", { max: 30 }),
    navAbout: text("Third link", "About", { max: 30 }),
    navContact: text("Fourth link", "Contact", { max: 30 }),
    navButton: text("Button", "Submit Résumé", { max: 30 }),

    footerBlurb: long(
      "Description",
      "A boutique recruiting firm in Mobile, Alabama, placing exceptional people across the Gulf Coast.",
      { max: 300, rows: 3, hint: "If you want the founding year here, write it in: “…across the Gulf Coast since 2012.”" },
    ),
    footerTagline: text("Tagline", "Local. Trusted. Connected.", { max: 60 }),
    footerCompany: text("First column heading", "Company", { max: 40 }),
    footerCandidates: text("Second column heading", "Candidates", { max: 40 }),
    footerVisit: text("Address column heading", "Visit Us", { max: 40 }),
    footerAppointment: text("Appointment note", "By appointment only", { max: 60 }),
    copyright: text("Copyright line", "Fit Recruiting. All rights reserved.", {
      max: 120,
      hint: "The © and the current year are added in front automatically.",
    }),

    linkAbout: text("About", "About Fit", { max: 40 }),
    linkEmployers: text("For Employers", "For Employers", { max: 40 }),
    linkContact: text("Contact", "Contact", { max: 40 }),
    linkCandidates: text("For Candidates", "For Candidates", { max: 40 }),
    linkJobs: text("Open roles", "Browse Open Roles", { max: 40 }),
    linkSubmit: text("Submit a résumé", "Submit a Resume", { max: 40 }),
    linkAudit: text("Résumé review", "Free Resume Review", { max: 40 }),
    linkGuide: text("Interview guide", "Interview Guide", { max: 40 }),
    linkPrivacy: text("Privacy", "Privacy", { max: 40 }),
  },
  sections: [
    {
      title: "Contact details",
      hint: "Change these once and they update the footer, the Contact page, every job page, and the privacy policy.",
      keys: ["street", "city", "phone", "email"],
    },
    {
      title: "Navigation",
      hint: "The links along the top of every page. Where each link goes stays the same.",
      keys: ["navCandidates", "navEmployers", "navAbout", "navContact", "navButton"],
    },
    {
      title: "Footer",
      keys: ["footerBlurb", "footerTagline", "footerCompany", "footerCandidates", "footerVisit", "footerAppointment", "copyright"],
    },
    {
      title: "Footer links",
      hint: "The words on each footer link. Where each link goes stays the same.",
      keys: ["linkAbout", "linkEmployers", "linkContact", "linkCandidates", "linkJobs", "linkSubmit", "linkAudit", "linkGuide", "linkPrivacy"],
    },
  ],
});
