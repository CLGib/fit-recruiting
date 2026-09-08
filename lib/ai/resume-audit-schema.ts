import { z } from "zod";

/**
 * The candidate-facing audit from the proposal: someone uploads their résumé
 * and gets back specific, usable feedback.
 *
 * This one is written FOR the candidate, not about them. Different audience,
 * different obligations. It never says whether they are good enough for
 * anything, because a stranger's document is not enough to know that, and
 * telling someone they are not employable is not a thing a tool should do.
 *
 * Split from ./resume-audit.ts, which is server-only, so the client component
 * that renders a result can share the type.
 */
export const ResumeAuditSchema = z.object({
  first_impression: z
    .string()
    .describe("What a recruiter would take away in the ten seconds they actually spend. Honest and kind."),
  works_well: z
    .array(z.string())
    .describe("Two to four things this résumé already does right. Be specific, not flattering."),
  fixes: z
    .array(
      z.object({
        issue: z.string().describe("What is weak, in plain words."),
        why: z.string().describe("Why it costs them, from a recruiter's point of view."),
        instead: z
          .string()
          .describe("A concrete rewrite or action. Where possible, quote their line and show the better version."),
      }),
    )
    .describe("Three to six fixes, most valuable first."),
  missing: z
    .array(z.string())
    .describe("Things recruiters look for that are not on the page."),
  formatting: z
    .array(z.string())
    .describe("Layout, length, and readability notes, including anything that would trip an applicant tracking system."),
});

export type ResumeAudit = z.infer<typeof ResumeAuditSchema>;
