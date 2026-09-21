import { aspectRatio, isOwnedWorkLink, type Artwork } from '@/domain';
import type { CollectionRepository } from './repository';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  subject: string;
  message: string;
}

/**
 * Integrity checks over the whole record. Run by `npm run validate:collection` and by the
 * test suite, so a broken reference or a fidelity violation cannot reach a deploy.
 *
 * These are checks the schemas cannot express: they are about relationships between
 * records, and about the guarantees in spec §06, §14, §26, §30 and §91.
 */
export function validateCollection(
  repo: CollectionRepository,
  options: { mode?: 'development' | 'production' } = {},
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const mode = options.mode ?? 'development';

  const artworks = repo.listArtworks();
  const artworkSlugs = new Set(artworks.map((artwork) => artwork.slug));
  const artistSlugs = new Set(repo.listArtists().map((artist) => artist.slug));
  const seriesSlugs = new Set(repo.listSeries().map((entry) => entry.slug));
  const roomSlugs = new Set(repo.listRooms().map((room) => room.slug));

  const error = (code: string, subject: string, message: string) =>
    issues.push({ severity: 'error', code, subject, message });
  const warn = (code: string, subject: string, message: string) =>
    issues.push({ severity: 'warning', code, subject, message });

  /* ----------------------------------------------------- referential integrity */

  const seenSlugs = new Set<string>();
  for (const artwork of artworks) {
    if (seenSlugs.has(artwork.slug)) {
      error('duplicate-slug', artwork.slug, 'Two artworks share a slug; deep links would collide.');
    }
    seenSlugs.add(artwork.slug);

    if (!artistSlugs.has(artwork.artistSlug)) {
      error('missing-artist', artwork.slug, `References unknown artist "${artwork.artistSlug}".`);
    }
    if (artwork.seriesSlug && !seriesSlugs.has(artwork.seriesSlug)) {
      error('missing-series', artwork.slug, `References unknown series "${artwork.seriesSlug}".`);
    }
    for (const relation of artwork.relationships) {
      if (!artworkSlugs.has(relation.artworkSlug)) {
        error(
          'missing-relation',
          artwork.slug,
          `Related work "${relation.artworkSlug}" is not in the collection. A relation may only point at a work the House holds (§06).`,
        );
      }
    }
  }

  for (const entry of repo.listSeries()) {
    if (!artistSlugs.has(entry.artistSlug)) {
      error('missing-artist', `series/${entry.slug}`, `References unknown artist "${entry.artistSlug}".`);
    }
  }

  /* ------------------------------------------------------------ museum placement */

  const placedSlugs = new Set<string>();
  for (const room of repo.listRooms()) {
    for (const connection of room.connections) {
      if (!roomSlugs.has(connection.toRoomSlug)) {
        error('missing-room', room.slug, `Connects to unknown room "${connection.toRoomSlug}".`);
      }
    }
    for (const wall of room.walls) {
      const wallLength = Math.hypot(wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]);
      for (const placement of wall.placements) {
        if (!artworkSlugs.has(placement.artworkSlug)) {
          error(
            'missing-artwork',
            `${room.slug}/${wall.id}`,
            `Hangs unknown artwork "${placement.artworkSlug}". The museum may only show works in the collection (§06).`,
          );
          continue;
        }
        if (placedSlugs.has(placement.artworkSlug)) {
          warn(
            'duplicate-placement',
            placement.artworkSlug,
            'Hung in more than one place; VIEW IN MUSEUM will pick the first.',
          );
        }
        placedSlugs.add(placement.artworkSlug);

        const artwork = repo.getArtwork(placement.artworkSlug);
        if (!artwork) continue;
        const { height } = derivedHeight(artwork, placement.displayWidth);
        if (placement.centreHeight - height / 2 < 0.05) {
          warn(
            'placement-floor',
            placement.id,
            'Work would reach the floor at this size and centre height.',
          );
        }
        if (placement.centreHeight + height / 2 > wall.height - 0.1) {
          warn('placement-ceiling', placement.id, 'Work would exceed the wall height.');
        }
        const halfWidth = placement.displayWidth / 2;
        if (placement.offset - halfWidth < 0 || placement.offset + halfWidth > wallLength) {
          error('placement-overhang', placement.id, 'Work extends past the end of its wall.');
        }
      }
    }
    for (const stop of room.guidedStops) {
      if (!artworkSlugs.has(stop.artworkSlug)) {
        error('missing-artwork', `${room.slug}/guided`, `Guided stop references unknown work "${stop.artworkSlug}".`);
      }
    }
  }

  for (const artwork of artworks) {
    if (!placedSlugs.has(artwork.slug)) {
      warn('unplaced', artwork.slug, 'In the collection but not hung anywhere in the museum.');
    }
  }

  /* -------------------------------------------------------------- exhibitions */

  for (const exhibition of repo.listExhibitions()) {
    for (const slug of exhibition.artworkSlugs) {
      if (!artworkSlugs.has(slug)) {
        error('missing-artwork', `exhibition/${exhibition.slug}`, `Includes unknown work "${slug}".`);
      }
    }
    for (const slug of exhibition.roomSlugs) {
      if (!roomSlugs.has(slug)) {
        error('missing-room', `exhibition/${exhibition.slug}`, `References unknown room "${slug}".`);
      }
    }
    if (exhibition.heroArtworkSlug && !artworkSlugs.has(exhibition.heroArtworkSlug)) {
      error('missing-artwork', `exhibition/${exhibition.slug}`, 'Hero work is not in the collection.');
    }
  }

  for (const pathway of repo.listPathways()) {
    for (const stop of pathway.stops) {
      if (!artworkSlugs.has(stop.artworkSlug)) {
        error('missing-artwork', `pathway/${pathway.slug}`, `Stop references unknown work "${stop.artworkSlug}".`);
      }
    }
    for (const slug of pathway.routeRoomSlugs) {
      if (!roomSlugs.has(slug)) {
        error('missing-room', `pathway/${pathway.slug}`, `Route references unknown room "${slug}".`);
      }
    }
  }

  /* ----------------------------------------------- fidelity, ownership, rights */

  for (const artwork of artworks) {
    const canonical = artwork.media.canonical;
    if (!canonical.width || !canonical.height) {
      warn(
        'unknown-dimensions',
        artwork.slug,
        'Canonical media has no recorded dimensions; display geometry falls back to square, which risks misrepresenting the work (§14).',
      );
    }
    if (artwork.media.web) {
      const canonicalRatio = aspectRatio(canonical);
      const webRatio = aspectRatio(artwork.media.web);
      if (Math.abs(canonicalRatio - webRatio) > 0.01) {
        error(
          'aspect-mismatch',
          artwork.slug,
          'Web derivative has a different aspect ratio from the canonical media. A derivative may be smaller, never reshaped (§14).',
        );
      }
    }
    if (canonical.sourceKind === 'marketplace-thumbnail') {
      error(
        'thumbnail-master',
        artwork.slug,
        'A marketplace thumbnail is being used as the canonical asset (§46).',
      );
    }
    if ((artwork.mediaType === 'video' || artwork.mediaType === 'animated') && !artwork.media.poster) {
      warn('missing-poster', artwork.slug, 'Time-based work has no poster frame; the museum will show nothing until it loads (§16).');
    }
    for (const link of artwork.links) {
      if (isOwnedWorkLink(link) && link.platform === 'artist-site') {
        warn(
          'link-boundary',
          artwork.slug,
          'An artist-site link is marked as referring to this work; confirm it is the work the House owns rather than the artist\'s wider practice (§26).',
        );
      }
    }
    if (artwork.rights.highResRehostingAllowed && artwork.rights.displayRightsStatus === 'not-established') {
      error(
        'rights-contradiction',
        artwork.slug,
        'High-resolution re-hosting is enabled while display rights are not established (§30).',
      );
    }
  }

  /* -------------------------------------------------------------- placeholders */

  const placeholders = artworks.filter((artwork) => artwork.isPlaceholder);
  if (mode === 'production' && placeholders.length > 0) {
    error(
      'placeholder-in-production',
      'collection',
      `${placeholders.length} placeholder record(s) present. Demo records must be removed before a production build (§91).`,
    );
  }

  return issues;
}

function derivedHeight(artwork: Artwork, displayWidth: number): { height: number } {
  return { height: displayWidth / aspectRatio(artwork.media.canonical) };
}
