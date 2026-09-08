import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ANALYSIS_MODEL, ANTHROPIC_API_KEY } from "./config";
import { PresentationResumeSchema, type PresentationResume } from "./resume-presentation-schema";

export { PresentationResumeSchema, type PresentationResume } from "./resume-presentation-schema";

/**
 * The single most important prompt in this codebase.
 *
 * The output goes to a hiring manager, under a real person's name, on Fit's
 * letterhead. If it says the candidate did something they did not, three people
 * are damaged: the candidate, whose credibility collapses at interview; the
 * client, who was misled; and Fit, who sent it. So this transcribes and tidies,
 * and it is told in as many ways as necessary that it may not embellish.
 *
 * "Tidy" here means: consistent verb tense, consistent capitalisation and
 * punctuation, one accomplishment per bullet, filler removed. It does not mean
 * stronger verbs, rounder numbers, or inferring scope from a job title.
 */
const SYSTEM = `You are reformatting a candidate's résumé onto a recruiting firm's template so it can be sent to a hiring manager. Fit Recruiting is a boutique firm in Mobile, Alabama.

You are a typesetter, not a writer. Transcribe what the résumé says and make it consistent. You may not improve, strengthen, embellish, or infer.

Specifically, you MUST NOT:
- add any accomplishment, responsibility, skill, tool, employer, date, or credential that is not in the source document
- add numbers, percentages, dollar values, or team sizes that are not stated
- upgrade a job title, or infer seniority or scope from a title
- turn a responsibility into an achievement ("responsible for payroll" does not become "owned payroll for 200 employees")
- fill a gap, smooth a date, or resolve an inconsistency by guessing

You MAY:
- fix spelling, grammar, and punctuation
- make verb tense consistent: past roles in past tense, the current role in present tense
- make capitalisation and bullet punctuation consistent
- split a run-on bullet that contains two accomplishments into two bullets
- remove filler like "Duties included" or "Responsible for various tasks"
- drop a line that carries no information, such as "References available upon request"

If a date, employer, or title is genuinely ambiguous in the source, transcribe it as written and record the ambiguity in notes_for_recruiter. Never resolve it silently.

Do not include a photograph, date of birth, marital status, nationality, or any other protected characteristic even if the source résumé lists it. If the source contains such details, leave them out and note it in notes_for_recruiter so the recruiter knows why the presented copy differs.

Do not use em dashes.`;

export type PresentationResult = {
  content: PresentationResume;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export async function buildPresentationResume(
  pdfBase64: string,
): Promise<PresentationResult> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const response = await client.messages.parse({
    model: ANALYSIS_MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: {
      // Higher than the other calls. Faithful transcription of a whole document
      // is where a weaker pass starts paraphrasing, and paraphrase is exactly
      // the failure mode this feature cannot have.
      effort: "high",
      format: zodOutputFormat(PresentationResumeSchema),
    },
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
          },
          {
            type: "text",
            text: "Transcribe this résumé into the structure. Change presentation only, never substance.",
          },
        ],
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return a usable résumé.");
  }

  return {
    content: response.parsed_output,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
