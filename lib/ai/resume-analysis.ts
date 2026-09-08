import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ANALYSIS_MODEL, ANTHROPIC_API_KEY } from "./config";

/**
 * What we ask the model to extract.
 *
 * Note what is deliberately absent: no score, no ranking, no recommendation.
 * This is a reading aid that saves a recruiter ten minutes, not a filter that
 * decides who gets seen. A screening tool that outputs a number invites people
 * to sort by it, and that is a different product with different obligations.
 */
export const ResumeAnalysisSchema = z.object({
  headline: z
    .string()
    .describe("One sentence a recruiter could read aloud describing this person."),
  current_title: z.string().nullable(),
  years_experience: z
    .number()
    .nullable()
    .describe("Approximate total years of relevant professional experience, or null if unclear."),
  location: z.string().nullable(),
  skills: z.array(z.string()).describe("Concrete skills and tools named in the résumé."),
  employment: z.array(
    z.object({
      employer: z.string(),
      title: z.string(),
      start: z.string().nullable().describe("As written, e.g. 'Mar 2021'."),
      end: z.string().nullable().describe("As written, or 'Present'."),
    }),
  ),
  education: z.array(z.string()),
  strengths: z
    .array(z.string())
    .describe("Specific, evidenced strengths. Prefer measurable accomplishments over adjectives."),
  things_to_ask_about: z
    .array(
      z.object({
        observation: z.string().describe("A neutral factual observation from the résumé."),
        question: z.string().describe("An open question a recruiter could ask about it."),
      }),
    )
    .describe("Gaps, transitions, or ambiguities worth a conversation. Never a judgement."),
  missing_information: z
    .array(z.string())
    .describe("Things a recruiter would normally expect to see and cannot find."),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

/**
 * The instruction matters more than the schema here.
 *
 * Two rules are non-negotiable for a tool that reads real people's résumés:
 * do not infer protected characteristics, and do not editorialise a gap into a
 * defect. "Job hopping" and "employment gap" are conclusions, not observations;
 * a career break to care for someone is indistinguishable on paper from any
 * other gap, and the recruiter is the one who should ask.
 */
const SYSTEM = `You read résumés for a boutique recruiting firm on the Gulf Coast and prepare a briefing for the recruiter who will call this person.

Extract only what the document actually supports. If something is not stated, leave it null or omit it rather than inferring.

Never infer or comment on age, gender, race, nationality, religion, disability, health, family status, or any other protected characteristic, and never use graduation years or dates to estimate age.

For "things to ask about": state a neutral factual observation and pair it with an open question. A gap between roles is an observation; "job hopping" or "unstable employment history" is a judgement, and you must not make it. The recruiter decides what matters after speaking to the person.

Prefer specifics over adjectives. "Cut month-end close from 12 days to 5" beats "detail oriented".`;

export type AnalysisResult = {
  analysis: ResumeAnalysis;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

/** Only PDFs can be sent as a document block. DOC/DOCX need conversion first. */
export function isAnalyzable(filename: string | null, path: string | null): boolean {
  const name = (filename ?? path ?? "").toLowerCase();
  return name.endsWith(".pdf");
}

export async function analyzeResumePdf(
  pdfBase64: string,
  context: { role?: string | null },
): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const roleLine = context.role
    ? `They applied for: ${context.role}. Note anything especially relevant to it.`
    : `They applied speculatively, not to a specific role.`;

  const response = await client.messages.parse({
    model: ANALYSIS_MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    // Extraction rather than hard reasoning, so medium effort holds quality
    // at meaningfully lower cost. Raise if the briefings read thin.
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ResumeAnalysisSchema),
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
          { type: "text", text: `Prepare the briefing. ${roleLine}` },
        ],
      },
    ],
  });

  // parsed_output is null when the model could not satisfy the schema.
  if (!response.parsed_output) {
    throw new Error("The model did not return a usable analysis.");
  }

  return {
    analysis: response.parsed_output,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
