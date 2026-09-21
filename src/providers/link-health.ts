import type { LinkHealth } from '@/domain';
import { fetchWithTimeout } from './types';

/**
 * Link health engine (§24).
 *
 * Marketplace and artist URLs rot. This checks one, reports what it found, and never
 * decides anything on its own: a broken link is surfaced to the curator and hidden from
 * visitors, not silently rewritten.
 */
export interface LinkCheckResult {
  url: string;
  health: LinkHealth;
  statusCode: number | null;
  redirectedTo: string | null;
  error: string | null;
  checkedAt: string;
}

export async function checkLink(url: string): Promise<LinkCheckResult> {
  const checkedAt = new Date().toISOString();
  const base = { url, checkedAt, statusCode: null, redirectedTo: null, error: null };

  try {
    /* HEAD first: it is cheaper and most hosts answer it. Some refuse, so fall back to a
       GET that is abandoned as soon as the status line arrives. */
    let response = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' });
    if (response.status === 405 || response.status === 501) {
      response = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' });
    }

    const redirectedTo = response.url !== url ? response.url : null;
    if (response.status >= 200 && response.status < 300) {
      return { ...base, health: redirectedTo ? 'redirecting' : 'healthy', statusCode: response.status, redirectedTo };
    }
    if (response.status >= 400) {
      return { ...base, health: 'broken', statusCode: response.status, redirectedTo };
    }
    return { ...base, health: 'unknown', statusCode: response.status, redirectedTo };
  } catch (error) {
    /* A network failure here says as much about us as about them, so it is "unknown"
       rather than "broken": a link is only declared dead on a real answer. */
    return {
      ...base,
      health: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Checks a set of links with a small amount of concurrency and no thundering herd. */
export async function checkLinks(urls: readonly string[], concurrency = 4): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = [];
  const queue = [...urls];

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      results.push(await checkLink(next));
    }
  });

  await Promise.all(workers);
  return results;
}
