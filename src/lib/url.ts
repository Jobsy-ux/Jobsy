/**
 * Every outbound URL in the product passes through here. Provider metadata is untrusted
 * input (§72), so a scheme we do not recognise never reaches an `href`.
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Host shown next to an external link, so a visitor can see where they are going. */
export function displayHost(value: string): string | null {
  try {
    return new URL(value).host.replace(/^www\./, '');
  } catch {
    return null;
  }
}
