/**
 * The institution's identity on the web, in one place.
 *
 * The canonical production domain is houseofnucci.art. Every absolute URL the product
 * emits — canonical tags, sitemap entries, OpenGraph, social cards — resolves through
 * here, so the domain is stated once and nothing can drift out of step with it.
 *
 * `NEXT_PUBLIC_SITE_URL` overrides it for local and preview builds. DNS and hosting for
 * the production domain are deliberately not configured yet (see docs/DECISIONS.md, O-1).
 */
export const CANONICAL_ORIGIN = 'https://houseofnucci.art';

export const SITE_URL = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? CANONICAL_ORIGIN);

export const SITE_NAME = 'House of Nucci';
export const COLLECTION_NAME = 'The House of Nucci Collection';

/**
 * The one-line description used for metadata and social cards.
 *
 * It says what this is — a personal collection, carefully assembled — and claims nothing
 * about scale, value or importance. See docs/POSITIONING.md.
 */
export const SITE_DESCRIPTION =
  'House of Nucci is a highly curated personal collection of digital art, presented as an immersive digital museum experience.';

/** True only in a production build, which is also the only build that may be indexed. */
export const IS_PRODUCTION_MODE = process.env.COLLECTION_MODE === 'production';

/**
 * An absolute URL for a site path. Used wherever a URL has to leave the page — canonical
 * tags, sitemaps, social cards, share links — because a relative one is meaningless there.
 */
export function absoluteUrl(path = '/'): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${suffix === '/' ? '/' : suffix.replace(/\/$/, '')}`;
}

/** Canonical paths for every public entity (§54). One spelling, used everywhere. */
export const routes = {
  home: () => '/',
  museum: () => '/museum',
  collection: () => '/collection',
  artwork: (slug: string) => `/artwork/${slug}`,
  artist: (slug: string) => `/artist/${slug}`,
  artists: () => '/artists',
  series: (slug: string) => `/series/${slug}`,
  exhibition: (slug: string) => `/exhibition/${slug}`,
  exhibitions: () => '/exhibitions',
  pathway: (slug: string) => `/pathway/${slug}`,
  pathways: () => '/pathways',
  startHere: () => '/start-here',
  myHouse: () => '/my-house',
} as const;

function normalizeOrigin(value: string): string {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    /* A malformed override must not produce broken canonical tags on every page. */
    return CANONICAL_ORIGIN;
  }
}
