/** Small formatting helpers shared by public pages. No React, no server APIs. */

/** "251.300.3584" -> "+12513003584", for tel: links. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

/**
 * The embedded map on the Contact page, built from the editable address.
 * Hardcoded, it would have kept showing the old office after Fit changed the
 * address in the portal.
 */
export function mapEmbedUrl(street: string, city: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${street}, ${city}`)}&output=embed`;
}

/** Replace {name} placeholders with plain values: "Search all {count}". */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{([a-z]+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
