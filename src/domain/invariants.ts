/**
 * Rules that protect the record and the artwork. These live in the domain layer so that
 * every surface — museum, archive, admin, ingestion — is bound by the same guarantees.
 */
import { NEAREST_NEIGHBOUR_MEDIA, TIME_BASED_MEDIA, type MediaType } from './enums';
import type { Artwork, MarketplaceLink, MediaAsset, Placement } from './schema';

/** Fallback used only when an asset has no intrinsic dimensions recorded. */
const FALLBACK_ASPECT = 1;

/**
 * The artwork's true aspect ratio (width / height). Never guessed from a layout, never
 * overridden by a placement. Any display geometry is derived from this (§14, D-11).
 */
export function aspectRatio(asset: Pick<MediaAsset, 'width' | 'height'>): number {
  if (!asset.width || !asset.height) return FALLBACK_ASPECT;
  return asset.width / asset.height;
}

/**
 * Physical size of a hung work: the curator chooses the width, the artwork chooses the
 * height. There is deliberately no parameter that could distort it.
 */
export function derivedDisplaySize(
  placement: Pick<Placement, 'displayWidth'>,
  canonical: Pick<MediaAsset, 'width' | 'height'>,
): { width: number; height: number } {
  const ratio = aspectRatio(canonical);
  return { width: placement.displayWidth, height: placement.displayWidth / ratio };
}

/** Pixel work must not be interpolated at any scale (§14). */
export function requiresNearestNeighbour(mediaType: MediaType): boolean {
  return NEAREST_NEIGHBOUR_MEDIA.has(mediaType);
}

/** Work that carries its own timeline must actually run in the museum (§16). */
export function isTimeBased(mediaType: MediaType): boolean {
  return TIME_BASED_MEDIA.has(mediaType);
}

/**
 * Delivery asset preference: the web derivative exists to save bandwidth, not to replace
 * the work, so it is only used when present. Falls back to canonical, never to a
 * marketplace thumbnail (§46).
 */
export function displayAsset(artwork: Artwork): MediaAsset {
  return artwork.media.web ?? artwork.media.canonical;
}

export function posterAsset(artwork: Artwork): MediaAsset | null {
  return artwork.media.poster ?? artwork.media.thumbnail ?? null;
}

/**
 * The ownership boundary (§06, §26). Links about the work the House owns may sit inside
 * IN THE HOUSE; everything else belongs under EXPLORE THE ARTIST.
 */
export function isOwnedWorkLink(link: MarketplaceLink): boolean {
  return link.refersTo === 'this-work';
}

export function externalPracticeLinks(links: readonly MarketplaceLink[]): MarketplaceLink[] {
  return links.filter((link) => !isOwnedWorkLink(link));
}

export function ownedWorkLinks(links: readonly MarketplaceLink[]): MarketplaceLink[] {
  return links.filter(isOwnedWorkLink);
}

/** Dead links are never presented as destinations (§24). */
export function isLinkPresentable(link: MarketplaceLink): boolean {
  return link.health !== 'broken';
}

/**
 * Whether a high-resolution derivative may be published. Ownership alone never grants
 * this; an explicit rights record must (§30).
 */
export function mayPublishHighResolution(artwork: Artwork): boolean {
  return (
    artwork.rights.highResRehostingAllowed &&
    (artwork.rights.displayRightsStatus === 'display-and-rehost' ||
      artwork.rights.displayRightsStatus === 'artist-granted-extended')
  );
}

/**
 * The longest edge, in pixels, that may be served publicly without an explicit
 * high-resolution permission.
 *
 * Big enough that the work reads properly on a large screen; small enough that the file
 * on the House's servers is a viewing copy rather than a distributable original
 * (docs/rights.md).
 */
export const PUBLIC_DISPLAY_MAX_EDGE = 2048;

export function longestEdge(asset: Pick<MediaAsset, 'width' | 'height'>): number | null {
  if (!asset.width || !asset.height) return null;
  return Math.max(asset.width, asset.height);
}

/**
 * Whether this particular file may be served to the public.
 *
 * A file above the display cap is an original, and originals are not public assets unless
 * someone has explicitly permitted it. Ownership is never that permission.
 */
export function mayServePublicly(artwork: Artwork, asset: MediaAsset): boolean {
  if (mayPublishHighResolution(artwork)) return true;
  const edge = longestEdge(asset);
  /* Unknown dimensions are treated as unknown risk, not as permission. */
  if (edge === null) return false;
  return edge <= PUBLIC_DISPLAY_MAX_EDGE;
}

/**
 * Has anyone established that this work may be shown at all? Token ownership is not a
 * basis and never appears in this answer (§30).
 */
export function hasPublicationBasis(artwork: Artwork): boolean {
  return artwork.rights.publicationBasis !== 'not-established';
}

/** Human-readable account of the basis, for the details panel. Never overstated. */
export function publicationBasisLabel(artwork: Artwork): string {
  switch (artwork.rights.publicationBasis) {
    case 'explicit-permission':
      return artwork.rights.permissionGrantedBy
        ? `Shown with permission from ${artwork.rights.permissionGrantedBy}`
        : 'Shown with recorded permission';
    case 'verified-license':
      return 'Shown under a verified licence';
    case 'owner-created':
      return 'Asset created by House of Nucci';
    case 'not-established':
    default:
      return 'Publication basis not yet established';
  }
}

/**
 * An archival original is held for preservation, not for delivery (§47). Anything served
 * from the public directory is, by definition, downloadable.
 */
export function isPubliclyServed(asset: Pick<MediaAsset, 'url'>): boolean {
  return asset.url.startsWith('/');
}

/** Title as shown, without inventing one. */
export function displayTitle(artwork: Artwork): string {
  return artwork.displayTitle ?? artwork.title;
}

/**
 * Creation and acquisition are different facts and are never merged (§51).
 * Returns null rather than a guess when the House has not recorded an acquisition.
 */
export function acquisitionYear(artwork: Artwork): number | null {
  const date = artwork.acquisition?.date;
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/** Acquisition detail is shown only where the owner has made it public (D-5, O-5). */
export function isAcquisitionPublic(artwork: Artwork): boolean {
  return artwork.acquisition?.isPublic === true;
}

/**
 * Provenance in reading order, oldest first, with undated events last rather than
 * assigned an invented position in the story (§28).
 */
export function orderedProvenance(artwork: Artwork): Artwork['provenance'] {
  return [...artwork.provenance].sort((a, b) => {
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date.localeCompare(b.date);
  });
}

/** A work is publicly visible only when published. Drafts never leak to the web (§87). */
export function isPublic(entity: { state: string }): boolean {
  return entity.state === 'published';
}
