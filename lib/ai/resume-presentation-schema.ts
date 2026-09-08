import { z } from "zod";

/**
 * A candidate's résumé, restructured so it can be laid out on Fit's template.
 *
 * Every field is an extraction, not a composition. The point of this feature is
 * that a hiring manager receives something consistent and readable, not that
 * the candidate's history gets improved. See the system prompt in
 * ./resume-presentation.ts, where that line is enforced.
 */
export const PresentationResumeSchema = z.object({
  full_name: z.string(),
  headline: z
    .string()
    .nullable()
    .describe("Their own professional title or tagline if the résumé states one, else null."),
  location: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  links: z.array(z.string()).describe("LinkedIn, portfolio, GitHub, as written."),
  summary: z
    .string()
    .nullable()
    .describe("Their own summary or objective, tidied for grammar only. Null if the résumé has none."),
  experience: z.array(
    z.object({
      employer: z.string(),
      title: z.string(),
      location: z.string().nullable(),
      start: z.string().nullable().describe("As written, e.g. 'Mar 2021'."),
      end: z.string().nullable().describe("As written, or 'Present'."),
      bullets: z
        .array(z.string())
        .describe("Their accomplishments for this role, one per bullet, tidied for consistency only."),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      credential: z.string().nullable(),
      detail: z.string().nullable().describe("Honours, minor, or similar, if stated."),
      year: z.string().nullable(),
    }),
  ),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  /** Anything real that did not fit the sections above, kept rather than dropped. */
  additional: z.array(z.object({ heading: z.string(), items: z.array(z.string()) })),
  /**
   * Where the source was unclear. Surfaced to the recruiter, never printed,
   * so a person can check the ambiguous parts before this reaches a client.
   */
  notes_for_recruiter: z.array(z.string()),
});

export type PresentationResume = z.infer<typeof PresentationResumeSchema>;
