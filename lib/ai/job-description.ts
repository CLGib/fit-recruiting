import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ANALYSIS_MODEL, ANTHROPIC_API_KEY } from "./config";

/**
 * A drafted job posting.
 *
 * Structured rather than a wall of prose so the recruiter edits fields, not
 * paragraphs, and so the same record renders on the site, in Bullhorn, and on
 * LinkedIn without anyone reformatting it three times.
 */
export const JobDescriptionSchema = z.object({
  summary: z
    .string()
    .describe(
      "Two or three sentences a candidate reads first. What the job is, who they would work with, why it is worth their time.",
    ),
  responsibilities: z
    .array(z.string())
    .describe("Five to eight concrete things this person will actually do."),
  requirements: z
    .array(z.string())
    .describe("Four to seven genuine requirements. Do not pad with nice-to-haves."),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;

/**
 * Fit's client told us plainly what they do not want to sound like, and a
 * model left to itself will produce exactly that: "fast-paced environment",
 * "wear many hats", "rockstar". So the constraints are the prompt.
 *
 * The requirements rule is not a style note. Padded requirement lists measurably
 * deter people from applying to jobs they could do, and a recruiting firm that
 * writes them is working against its own placement rate.
 */
const SYSTEM = `You write job postings for Fit Recruiting, a boutique firm in Mobile, Alabama placing accounting, IT, administrative, and executive talent across the Gulf Coast.

Write like a person who has actually spoken to the hiring manager. Concrete over abstract, plain over corporate.

Never use: fast-paced environment, wear many hats, rockstar, ninja, guru, work hard play hard, dynamic self-starter, competitive salary, or "we are like a family".

Do not use em dashes.

Requirements must be things the person genuinely cannot do the job without. A padded list stops good candidates applying, which costs Fit a placement. If the recruiter's notes do not establish that something is required, leave it out.

Do not state or imply any preference about age, gender, race, nationality, religion, disability, family status, or any other protected characteristic, and do not use coded proxies for them such as "recent graduate", "young and energetic", or "digital native".

Only use facts the recruiter gave you. If pay was not provided, do not invent a range. If the company was not named, write around it rather than inventing one.`;

export type JobDescriptionResult = {
  description: JobDescription;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export async function draftJobDescription(input: {
  title: string;
  location: string;
  employmentType: string;
  salary?: string | null;
  categories?: string[];
  /** Whatever the recruiter jotted down from the client call. */
  notes?: string | null;
}): Promise<JobDescriptionResult> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const brief = [
    `Title: ${input.title}`,
    `Location: ${input.location}`,
    `Employment type: ${input.employmentType}`,
    input.salary ? `Pay: ${input.salary}` : "Pay: not provided, do not invent one.",
    input.categories?.length ? `Industry: ${input.categories.join(", ")}` : null,
    "",
    input.notes?.trim()
      ? `Notes from the recruiter:\n${input.notes.trim()}`
      : "The recruiter left no notes, so keep the posting general and short rather than inventing specifics.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.parse({
    model: ANALYSIS_MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(JobDescriptionSchema),
    },
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: `Draft this posting.\n\n${brief}` }],
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return a usable description.");
  }

  return {
    description: response.parsed_output,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
