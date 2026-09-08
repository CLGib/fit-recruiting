import { z } from "zod";

/**
 * A candidate read against the roles Fit currently has open.
 *
 * Note the shape: this matches ONE person to MANY roles, and the verdict is a
 * word with reasons attached, never a number. That is a deliberate line. A
 * score invites sorting candidates against each other, which is a ranking
 * system for job applicants and carries obligations Fit has not signed up for.
 * Matching a person to a role, with the reasoning written out so a recruiter
 * can disagree with it, is the useful half without the exposure.
 *
 * Split out from ./role-match.ts, which is server-only, so the panel that
 * renders a stored result can validate it in the browser too.
 */
export const RoleMatchSchema = z.object({
  matches: z.array(
    z.object({
      role_slug: z.string().describe("Exactly the slug given for that role."),
      verdict: z
        .enum(["worth_a_call", "possible", "not_this_one"])
        .describe("Your read on whether this person is worth talking to for THIS role."),
      reasons: z
        .array(z.string())
        .describe("What in the résumé supports that read. Cite specifics, not adjectives."),
      gaps: z
        .array(z.string())
        .describe("What the role asks for that the résumé does not evidence. Neutral, factual."),
      ask: z
        .string()
        .nullable()
        .describe("One question that would settle the biggest uncertainty, or null."),
    }),
  ),
  overall: z
    .string()
    .describe("One or two sentences on where this person fits best, and why."),
});

export type RoleMatch = z.infer<typeof RoleMatchSchema>;

export const VERDICT_LABEL: Record<string, string> = {
  worth_a_call: "Worth a call",
  possible: "Possible",
  not_this_one: "Not this one",
};
