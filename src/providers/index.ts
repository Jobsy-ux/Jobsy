import { OpenSeaProvider } from './opensea/adapter';
import { RasterProvider } from './raster/adapter';
import type { CollectionProvider } from './types';

/**
 * The providers the House knows how to talk to. Order is preference order for
 * enrichment; an unconfigured provider is skipped rather than failing an import (§41).
 */
export function providers(): CollectionProvider[] {
  return [new OpenSeaProvider(), new RasterProvider()];
}

export function configuredProviders(): CollectionProvider[] {
  return providers().filter((provider) => provider.isConfigured());
}

export * from './types';
export * from './link-health';
export * from './storage/content-addressed';
