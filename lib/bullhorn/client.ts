import { clearSession, getSession } from "./auth";

/**
 * Thin REST wrapper. Retries once on 401, because the BhRestToken can expire
 * between our cache check and Bullhorn receiving the request.
 */
export async function bhFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  async function call(force: boolean): Promise<Response> {
    const { restToken, restUrl } = await getSession(force);
    const qs = new URLSearchParams({ ...params, BhRestToken: restToken });
    return fetch(`${restUrl}${path}?${qs}`, {
      headers: { Accept: "application/json" },
      // Caching is handled by the page's revalidate window, not here.
      cache: "no-store",
    });
  }

  let res = await call(false);
  if (res.status === 401) {
    clearSession();
    res = await call(true);
  }
  if (!res.ok) {
    throw new Error(`Bullhorn ${path} failed (${res.status} ${res.statusText}).`);
  }
  return (await res.json()) as T;
}
