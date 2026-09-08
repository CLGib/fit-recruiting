import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ANALYSIS_MODEL, ANTHROPIC_API_KEY } from "./config";
import { RoleMatchSchema, type RoleMatch } from "./role-match-schema";

export { RoleMatchSchema, VERDICT_LABEL, type RoleMatch } from "./role-match-schema";

const SYSTEM = `You read a résumé against a recruiting firm's currently open roles and tell the recruiter which are worth a conversation.

Judge each role on its own. You are not ranking the person, and you are not ranking them against other candidates.

Ground every reason in something the résumé actually says. If the résumé does not evidence something the role needs, that belongs in gaps, not in reasons.

Never infer or comment on age, gender, race, nationality, religion, disability, health, family status, or any other protected characteristic, and never use graduation years or dates to estimate age.

Gaps are observations, not verdicts on the person. "No stated experience with NetSuite" is a gap. "Not serious about their career" is a judgement, and you must not make it.

Be willing to say not_this_one. A list where everything is worth a call is useless to a recruiter.`;

export type RoleMatchResult = {
  match: RoleMatch;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export async function matchResumeToRoles(
  pdfBase64: string,
  roles: { slug: string; title: string; location: string; summary: string | null; requirements: string[] }[],
): Promise<RoleMatchResult> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const roleBrief = roles
    .map((r) =>
      [
        `--- ${r.slug}`,
        `Title: ${r.title}`,
        `Location: ${r.location}`,
        r.summary ? `About: ${r.summary}` : null,
        r.requirements.length ? `Requirements:\n${r.requirements.map((x) => `  - ${x}`).join("\n")}` : "Requirements: none recorded.",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const response = await client.messages.parse({
    model: ANALYSIS_MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(RoleMatchSchema),
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
            text: `Read this person against every role below. Return one entry per role, using the slug exactly as written.\n\n${roleBrief}`,
          },
        ],
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return a usable match.");
  }

  return {
    match: response.parsed_output,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
