/**
 * The provider boundary (§81).
 *
 * Everything a third party tells us arrives through an adapter and leaves as one of the
 * shapes below. No provider-specific field name, URL pattern or quirk is allowed past
 * this layer, so a marketplace changing its API is a change to one file.
 *
 * Nothing here writes to the record. Adapters return candidates and enrichment; a curator
 * decides what becomes part of the collection (§42, §43, §45).
 */
import type { MediaSourceKind } from '@/domain';

export interface TokenReference {
  chain: string;
  contractAddress: string;
  tokenId: string;
}

/** A normalised asset as some provider sees it. Untrusted until a curator accepts it. */
export interface ProviderAsset {
  token: TokenReference;
  title: string | null;
  description: string | null;
  artistName: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  posterUrl: string | null;
  sourceKind: MediaSourceKind;
  externalUrl: string | null;
  tokenUri: string | null;
  /** Anything else the provider said, kept verbatim for the raw metadata table (§45). */
  raw: unknown;
}

export interface ProviderResult<T> {
  ok: boolean;
  data: T | null;
  /** Why it failed, in terms a curator can act on. Never thrown at a visitor (§73). */
  error: string | null;
  provider: string;
  fetchedAt: string;
}

export interface CollectionProvider {
  readonly name: string;
  /** Is this provider configured? An unconfigured provider is skipped, never guessed at. */
  isConfigured(): boolean;
  /** Candidate assets held by a wallet. Candidates, not collection members (§43). */
  listWalletAssets(walletAddress: string, chain: string): Promise<ProviderResult<ProviderAsset[]>>;
  /** Enrichment for one token the House already holds. */
  getAsset(token: TokenReference): Promise<ProviderResult<ProviderAsset>>;
}

export function failure<T>(provider: string, error: string): ProviderResult<T> {
  return { ok: false, data: null, error, provider, fetchedAt: new Date().toISOString() };
}

export function success<T>(provider: string, data: T): ProviderResult<T> {
  return { ok: true, data, error: null, provider, fetchedAt: new Date().toISOString() };
}

/** Every provider call is bounded: a slow marketplace must not hold up an import (§73). */
export const PROVIDER_TIMEOUT_MS = 12_000;

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
