import { z } from 'zod';
import {
  failure,
  fetchWithTimeout,
  success,
  type CollectionProvider,
  type ProviderAsset,
  type ProviderResult,
  type TokenReference,
} from '../types';

/**
 * OpenSea adapter.
 *
 * Read-only, server-side, and treated as a hostile input: the response is parsed rather
 * than trusted, unknown fields are ignored, and a thumbnail is labelled a thumbnail so it
 * can never become a museum master (§46, §72).
 *
 * The API key lives only in the server environment (§72). Without it the provider simply
 * reports itself unconfigured, and the House carries on from its own record (§73).
 */
const BASE_URL = 'https://api.opensea.io/api/v2';

const NftSchema = z
  .object({
    identifier: z.string(),
    contract: z.string(),
    name: z.string().nullish(),
    description: z.string().nullish(),
    image_url: z.string().nullish(),
    display_image_url: z.string().nullish(),
    display_animation_url: z.string().nullish(),
    metadata_url: z.string().nullish(),
    opensea_url: z.string().nullish(),
    creator: z.string().nullish(),
  })
  .loose();

const ListSchema = z.object({ nfts: z.array(NftSchema).default([]) }).loose();
const SingleSchema = z.object({ nft: NftSchema }).loose();

export class OpenSeaProvider implements CollectionProvider {
  readonly name = 'opensea';

  constructor(private readonly apiKey: string | undefined = process.env.OPENSEA_API_KEY) {}

  isConfigured(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.length > 0;
  }

  async listWalletAssets(walletAddress: string, chain: string): Promise<ProviderResult<ProviderAsset[]>> {
    if (!this.isConfigured()) return failure(this.name, 'OPENSEA_API_KEY is not configured');
    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/chain/${encodeURIComponent(chain)}/account/${encodeURIComponent(walletAddress)}/nfts?limit=50`,
        { headers: this.headers() },
      );
      if (!response.ok) return failure(this.name, `OpenSea responded ${response.status}`);
      const parsed = ListSchema.safeParse(await response.json());
      if (!parsed.success) return failure(this.name, 'Unexpected response shape from OpenSea');
      return success(
        this.name,
        parsed.data.nfts.map((nft) => toAsset(nft, chain)),
      );
    } catch (error) {
      return failure(this.name, describe(error));
    }
  }

  async getAsset(token: TokenReference): Promise<ProviderResult<ProviderAsset>> {
    if (!this.isConfigured()) return failure(this.name, 'OPENSEA_API_KEY is not configured');
    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/chain/${encodeURIComponent(token.chain)}/contract/${encodeURIComponent(
          token.contractAddress,
        )}/nfts/${encodeURIComponent(token.tokenId)}`,
        { headers: this.headers() },
      );
      if (!response.ok) return failure(this.name, `OpenSea responded ${response.status}`);
      const parsed = SingleSchema.safeParse(await response.json());
      if (!parsed.success) return failure(this.name, 'Unexpected response shape from OpenSea');
      return success(this.name, toAsset(parsed.data.nft, token.chain));
    } catch (error) {
      return failure(this.name, describe(error));
    }
  }

  private headers(): HeadersInit {
    return { accept: 'application/json', 'x-api-key': this.apiKey ?? '' };
  }
}

function toAsset(nft: z.infer<typeof NftSchema>, chain: string): ProviderAsset {
  const media = nft.display_animation_url ?? nft.display_image_url ?? nft.image_url ?? null;
  return {
    token: { chain, contractAddress: nft.contract, tokenId: nft.identifier },
    title: nft.name ?? null,
    description: nft.description ?? null,
    artistName: nft.creator ?? null,
    mediaUrl: media,
    mediaMimeType: null,
    posterUrl: nft.display_image_url ?? nft.image_url ?? null,
    /* Whatever a marketplace serves is platform media at best: good enough to identify a
       work, never good enough to hang (§46). */
    sourceKind: 'marketplace-thumbnail',
    externalUrl: nft.opensea_url ?? null,
    tokenUri: nft.metadata_url ?? null,
    raw: nft,
  };
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.name === 'AbortError' ? 'OpenSea timed out' : error.message;
  return 'Unknown error contacting OpenSea';
}
