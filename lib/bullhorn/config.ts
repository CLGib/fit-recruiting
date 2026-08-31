/**
 * Bullhorn REST credentials.
 *
 * These are NOT self-serve. Bullhorn issues client_id/client_secret and creates
 * a dedicated API user in response to a Resource Center support ticket, so
 * expect lead time before these can be populated.
 */
export const BULLHORN = {
  clientId: process.env.BULLHORN_CLIENT_ID,
  clientSecret: process.env.BULLHORN_CLIENT_SECRET,
  username: process.env.BULLHORN_API_USERNAME,
  password: process.env.BULLHORN_API_PASSWORD,
  /** Data-centre specific. Bullhorn tells you which to use. */
  authUrl: process.env.BULLHORN_AUTH_URL ?? "https://auth.bullhornstaffing.com/oauth",
  restLoginUrl: process.env.BULLHORN_REST_LOGIN_URL ?? "https://rest.bullhornstaffing.com/rest-services/login",
} as const;

export function isBullhornConfigured(): boolean {
  return Boolean(
    BULLHORN.clientId && BULLHORN.clientSecret && BULLHORN.username && BULLHORN.password,
  );
}
