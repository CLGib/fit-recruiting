import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ANALYSIS_MODEL, ANTHROPIC_API_KEY } from "./config";
import { ResumeAuditSchema, type ResumeAudit } from "./resume-audit-schema";

export { ResumeAuditSchema, type ResumeAudit } from "./resume-audit-schema";

/**
 * Tone is the whole product here. Someone uploading their résumé to a
 * recruiter's website is often having a bad month, and a wall of criticism is
 * both cruel and useless. Specific and warm, never gushing, never brutal.
 */
const SYSTEM = `You are reviewing someone's résumé at their request, on the website of Fit Recruiting, a boutique recruiting firm in Mobile, Alabama.

You are writing TO this person, not about them. Address them as "you".

Be specific and be kind. Vague encouragement wastes their time and a pile of criticism makes them close the tab. Every criticism must come with a concrete fix they could apply in ten minutes. Where you can, quote the line from their résumé and show a better version of it.

Never comment on their age, gender, race, nationality, religion, disability, health, or family status, and never suggest they hide or reveal any of those. If there is a gap in their history, you may suggest how to present it, but never characterise it as a problem with them.

Never tell them whether they are qualified for anything, whether they will get hired, or what they are worth. You are reviewing a document, not a person.

Do not use em dashes.

If the document is not a résumé, say so plainly and stop.`;

export type ResumeAuditResult = {
  audit: ResumeAudit;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export async function auditResumePdf(pdfBase64: string): Promise<ResumeAuditResult> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const response = await client.messages.parse({
    model: ANALYSIS_MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ResumeAuditSchema),
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
          { type: "text", text: "Review my résumé and tell me how to make it stronger." },
        ],
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return a usable review.");
  }

  return {
    audit: response.parsed_output,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
