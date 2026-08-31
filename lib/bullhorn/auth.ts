import { BULLHORN, isBullhornConfigured } from "./config";

/**
 * Bullhorn session handling.
 *
 * The flow is three hops: authorization code -> access token -> BhRestToken.
 * The BhRestToken is short-lived, so it is cached at module scope and reused
 * across warm invocations. At this traffic level (ISR revalidating a handful of
 * times an hour) that is enough; if Bullhorn starts throttling logins, move
 * this cache to Vercel KV rather than re-authenticating per request.
 */

type Session = { restToken: string; restUrl: string; expiresAt: number };

let cached: Session | null = null;
let inFlight: Promise<Session> | null = null;

/** Bullhorn's TTL is ~10 minutes; refresh early to avoid racing expiry. */
const TTL_MS = 8 * 60 * 1000;

async function authenticate(): Promise<Session> {
  if (!isBullhornConfigured()) {
    throw new Error("Bullhorn is not configured.");
  }

  const { clientId, clientSecret, username, password, authUrl, restLoginUrl } = BULLHORN;

  // 1. Authorization code.
  const authParams = new URLSearchParams({
    client_id: clientId!,
    response_type: "code",
    username: username!,
    password: password!,
    action: "Login",
  });
  const authRes = await fetch(`${authUrl}/authorize?${authParams}`, { redirect: "manual" });
  const location = authRes.headers.get("location");
  const code = location && new URL(location).searchParams.get("code");
  if (!code) {
    throw new Error(`Bullhorn authorize did not return a code (status ${authRes.status}).`);
  }

  // 2. Access token.
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId!,
    client_secret: clientSecret!,
  });
  const tokenRes = await fetch(`${authUrl}/token?${tokenParams}`, { method: "POST" });
  if (!tokenRes.ok) throw new Error(`Bullhorn token exchange failed (${tokenRes.status}).`);
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // 3. REST session. The returned restUrl is per-account, so never hardcode it.
  const loginRes = await fetch(
    `${restLoginUrl}?version=*&access_token=${encodeURIComponent(access_token)}`,
  );
  if (!loginRes.ok) throw new Error(`Bullhorn REST login failed (${loginRes.status}).`);
  const { BhRestToken, restUrl } = (await loginRes.json()) as {
    BhRestToken: string;
    restUrl: string;
  };

  return { restToken: BhRestToken, restUrl, expiresAt: Date.now() + TTL_MS };
}

/** Returns a live session, reusing the cache and de-duping concurrent logins. */
export async function getSession(force = false): Promise<Session> {
  if (!force && cached && cached.expiresAt > Date.now()) return cached;
  // Collapse parallel callers onto one login rather than stampeding Bullhorn.
  if (!inFlight) {
    inFlight = authenticate()
      .then((s) => {
        cached = s;
        return s;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function clearSession() {
  cached = null;
}
