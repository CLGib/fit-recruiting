import { definePage, items, lines, long, text } from "../fields.ts";

/**
 * Adapted from Fit's own "FIT Interview Guide 2025" PDF. The attire advice was
 * consolidated from separate men's and women's lists into one, flagged for
 * Chambliss's approval when the page was first built.
 */
export const guide = definePage({
  label: "Interview guide",
  path: "/resources",
  description: "Everything Fit tells candidates before an interview.",
  fields: {
    eyebrow: text("Small line above the headline", "Candidate resources", { max: 60 }),
    title: text("Headline, first line", "The interview", { max: 60 }),
    titleAccent: text("Headline, second line (gold italic)", "guide.", { max: 60 }),
    intro: long(
      "Introduction",
      "Everything we tell our candidates before we send them in. Written by the people who sit on the other side of the table, and who talk to the hiring manager afterward.",
      { max: 500, rows: 3 },
    ),
    pdfButton: text("Download button", "Download the PDF", {
      max: 40,
      hint: "The PDF is a separate file. Editing this page does not change it.",
    }),

    sections: items(
      "Sections",
      "section",
      {
        title: text("Heading", "", { max: 60 }),
        points: long("Points", "", { max: 3000, rows: 8, hint: "One point per line." }),
      },
      [
        {
          title: "Before your interview",
          points: [
            "Research the company website, including news and press releases, the “about” page, culture and values, and the management profiles of the people you know you're meeting.",
            "Take at least three ideas that genuinely interest you from your research, and be prepared to discuss them.",
            "Review the position description and be able to give at least five reasons you're the best fit for this role and this company.",
            "Consider the top five strengths this position would draw on, and be ready to discuss how you've used them. Be prepared to speak to your weaknesses as well.",
            "Work these into the conversation. It shows the interviewer you're prepared and serious about the role.",
          ].join("\n"),
        },
        {
          title: "What to wear",
          points: [
            "Business professional attire. Plan it the day before, not the morning of.",
            "Tailored suits in navy, gray, or black, with a knee-length skirt, tailored pants, or a matching suit.",
            "Shirts and blouses pressed and basic. Modesty is recommended.",
            "Fragrances are not recommended.",
            "Jewelry simple and conservative. Makeup and nail polish minimal.",
            "Clean hands, trimmed nails, and a professional hair style are a must.",
            "Shoes shined and conservative. Oxford or wingtip styles work well.",
            "Ties should be non-novelty, worn with a navy, gray, or black suit.",
            "Don't remove your suit jacket unless the interviewer offers.",
          ].join("\n"),
        },
        {
          title: "What to take",
          points: [
            "A folder or portfolio with multiple copies of your résumé and references, plus a good pen.",
            "The position description, when possible.",
            "Three to five questions you'll ask the interviewer.",
          ].join("\n"),
        },
        {
          title: "What to leave in the car",
          points: ["Cell phones, tobacco products, and chewing gum.", "Other distractions."].join("\n"),
        },
        {
          title: "Behavioral tips",
          points: [
            "Greet your interviewer with a firm handshake and an enthusiastic, sincere smile.",
            "Greet the interviewer by Mr. or Ms. and their last name.",
            "Wait until you're offered a chair before taking a seat.",
            "Sit upright, look alert, and stay interested. Make eye contact and nod to show you're listening.",
            "Be assertive and proud of your accomplishments, without being over-confident.",
            "Show enthusiasm. If you're interested, say so. If you're not, your responsiveness still demonstrates professionalism.",
            "Stay confident even if you sense the interview isn't going well. Some interviewers discourage you deliberately to test your reaction.",
            "Most importantly, be yourself.",
          ].join("\n"),
        },
        {
          title: "What to avoid",
          points: [
            "Answering questions with a “yes” or “no.” Explain your answers.",
            "Exaggerating. Answers should be truthful and direct.",
            "Sharing personal stories unrelated to the position or your qualifications.",
            "Derogatory remarks about previous employers, supervisors, or co-workers. When explaining your departure, limit comments to what's necessary to communicate your rationale.",
            "Asking about compensation, vacation, and benefits in your first interview. Use the interview to build confidence that you're the best fit, not to signal you're focused on what's in it for you. These matter, but they're better discussed further along.",
          ].join("\n"),
        },
      ],
      { maxItems: 12 },
    ),

    questionsEyebrow: text("Small line above the heading", "Rehearse these", { max: 60 }),
    questionsTitle: text("Heading, first line", "The questions,", { max: 60 }),
    questionsTitleAccent: text("Heading, second line (gold italic)", "both directions.", { max: 60 }),
    theyAskHeading: text("Their questions: heading", "Questions you may be asked", { max: 60 }),
    theyAskNote: text("Their questions: note", "Rehearse your answers before the interview.", { max: 120 }),
    theyAsk: lines(
      "Their questions",
      [
        "Tell me about yourself, your background, and accomplishments.",
        "What are your strengths? Weaknesses?",
        "Describe your ideal job.",
        "Why are you the best fit for this position?",
        "How do you define success? Failure?",
        "Tell me about a work assignment you did not complete successfully, and why.",
        "What motivates you most in a job?",
        "List your top three achievements.",
        "What do you know about our company?",
        "Why did you want to interview with our company?",
        "What are your career goals?",
        "Tell me about a work situation you handled poorly. What did you learn?",
        "What other opportunities are you considering in addition to ours?",
      ],
      { rows: 10, hint: "One question per line." },
    ),
    youAskHeading: text("Your questions: heading", "Questions you should ask", { max: 60 }),
    youAskNote: text("Your questions: note", "A lack of questions can be mistaken for disinterest.", { max: 120 }),
    youAsk: lines(
      "Your questions",
      [
        "What are the greatest challenges in this position?",
        "What might I expect during the first six months on the job?",
        "What would I be expected to accomplish in this role?",
        "What made the last person in this position successful?",
        "What characteristics or traits do successful people in this company share?",
        "What are the company's plans for growth?",
        "What is the biggest challenge facing this department or company right now?",
        "How often is formal feedback given?",
        "Do you have any concerns about my qualifications that I can address for you?",
      ],
      { rows: 9, hint: "One question per line." },
    ),

    closingHeading: text("Heading", "Closing and following up", { max: 60 }),
    closing: lines(
      "Points",
      [
        "If you're interested in the position, let the interviewer know. Something like: “I'm very interested in your company, its products, and the people I've met. I know I would do an excellent job in the position we discussed.” You can also ask about next steps in the decision-making process.",
        "Don't be discouraged if no immediate commitment is made. Often the interviewer needs to talk with others or interview more candidates.",
        "Thank the interviewer for their time and consideration.",
        "Ask everyone you met for a business card, then follow up by email thanking them for their time and expressing your interest.",
        "Within 48 hours, follow up with a brief handwritten note. Thank them again, reiterate your interest, and add two or three quick points about how your qualifications relate to the position.",
        "Connect with everyone you met on LinkedIn, and follow the company page.",
      ],
      { rows: 8, hint: "One point per line." },
    ),
    endText: text("Last line", "When you are ready, {link}.", {
      max: 160,
      hint: "{link} becomes a link to the résumé form, using the words below.",
    }),
    endLink: text("Words of that link", "send us your résumé", { max: 60 }),
  },
  sections: [
    { title: "Top of the page", keys: ["eyebrow", "title", "titleAccent", "intro", "pdfButton"] },
    { title: "The guide", hint: "Each section is one panel on the page.", keys: ["sections"] },
    {
      title: "Interview questions",
      keys: ["questionsEyebrow", "questionsTitle", "questionsTitleAccent", "theyAskHeading", "theyAskNote", "theyAsk", "youAskHeading", "youAskNote", "youAsk"],
    },
    { title: "Closing", keys: ["closingHeading", "closing", "endText", "endLink"] },
  ],
});
