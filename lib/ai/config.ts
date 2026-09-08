/**
 * Claude API configuration.
 *
 * Every caller checks isAiConfigured() first, so the app runs and the admin
 * loads with no key present. Analysis simply appears unavailable rather than
 * throwing.
 */
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Opus 5. Résumé reading is the one place a recruiter will notice a weaker
 * model: blander summaries and worse questions to ask.
 */
export const ANALYSIS_MODEL = "claude-opus-5";

export function isAiConfigured(): boolean {
  return Boolean(ANTHROPIC_API_KEY);
}
