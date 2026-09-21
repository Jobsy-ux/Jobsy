import {
  failure,
  type CollectionProvider,
  type ProviderAsset,
  type ProviderResult,
  type TokenReference,
} from '../types';

/**
 * Raster adapter — not yet implemented.
 *
 * Raster is one of the destinations the House links out to (§22, §75), but its public API
 * surface has not been confirmed. Rather than guess at endpoints and ship code that
 * silently fabricates or drops data, the adapter exists as a configured-off provider: the
 * boundary is in place, the import pipeline already accounts for it, and the day the API
 * is confirmed this file is the only one that changes.
 *
 * Until then, Raster links are curated by hand and checked by the link-health engine.
 */
export class RasterProvider implements CollectionProvider {
  readonly name = 'raster';

  isConfigured(): boolean {
    return false;
  }

  async listWalletAssets(): Promise<ProviderResult<ProviderAsset[]>> {
    return failure(this.name, 'The Raster API has not been integrated yet; links are curated by hand.');
  }

  async getAsset(_token: TokenReference): Promise<ProviderResult<ProviderAsset>> {
    return failure(this.name, 'The Raster API has not been integrated yet; links are curated by hand.');
  }
}
