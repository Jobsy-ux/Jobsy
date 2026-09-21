import {
  ArtistSchema,
  ArtworkSchema,
  CollectionSchema,
  CollectorSchema,
  ExhibitionSchema,
  PathwaySchema,
  RoomSchema,
  SeriesSchema,
  isPublic,
  type Artist,
  type Artwork,
  type Collection,
  type Collector,
  type Exhibition,
  type Pathway,
  type Room,
  type Series,
} from '@/domain';
import type { CollectionRepository } from './repository';
import { artists as artistRecords } from '@content/artists';
import { artworks as artworkRecords } from '@content/artworks';
import { collection as collectionRecord, collector as collectorRecord } from '@content/collection';
import { exhibitions as exhibitionRecords } from '@content/exhibitions';
import { pathways as pathwayRecords } from '@content/pathways';
import { rooms as roomRecords } from '@content/rooms';
import { series as seriesRecords } from '@content/series';

/**
 * Repository backed by the authored records in `content/`.
 *
 * Records are parsed through the schemas at construction, so an invalid record fails
 * loudly at startup rather than producing a subtly wrong museum. Ordering is curatorial
 * (`displayPriority`, then title) and never derived from market data (§36).
 */
export class FileCollectionRepository implements CollectionRepository {
  private readonly collection: Collection;
  private readonly collector: Collector;
  private readonly artworks: Artwork[];
  private readonly artists: Artist[];
  private readonly series: Series[];
  private readonly rooms: Room[];
  private readonly exhibitions: Exhibition[];
  private readonly pathways: Pathway[];

  private readonly artworkBySlug = new Map<string, Artwork>();
  private readonly artistBySlug = new Map<string, Artist>();
  private readonly seriesBySlug = new Map<string, Series>();
  private readonly roomBySlug = new Map<string, Room>();

  constructor(options: { includeUnpublished?: boolean } = {}) {
    const keep = <T extends { state: string }>(record: T): boolean =>
      options.includeUnpublished === true || isPublic(record);

    this.collection = CollectionSchema.parse(collectionRecord);
    this.collector = CollectorSchema.parse(collectorRecord);

    this.artworks = artworkRecords
      .map((record) => ArtworkSchema.parse(record))
      .filter(keep)
      .sort(byCuratorialOrder);
    this.artists = artistRecords.map((record) => ArtistSchema.parse(record)).filter(keep);
    this.series = seriesRecords.map((record) => SeriesSchema.parse(record)).filter(keep);
    this.rooms = roomRecords.map((record) => RoomSchema.parse(record));
    this.exhibitions = exhibitionRecords
      .map((record) => ExhibitionSchema.parse(record))
      .filter(keep);
    this.pathways = pathwayRecords.map((record) => PathwaySchema.parse(record)).filter(keep);

    for (const artwork of this.artworks) this.artworkBySlug.set(artwork.slug, artwork);
    for (const artist of this.artists) this.artistBySlug.set(artist.slug, artist);
    for (const entry of this.series) this.seriesBySlug.set(entry.slug, entry);
    for (const room of this.rooms) this.roomBySlug.set(room.slug, room);
  }

  getCollection(): Collection {
    return this.collection;
  }

  getCollector(): Collector {
    return this.collector;
  }

  listArtworks(): Artwork[] {
    return this.artworks;
  }

  getArtwork(slug: string): Artwork | null {
    return this.artworkBySlug.get(slug) ?? null;
  }

  listArtworksByArtist(artistSlug: string): Artwork[] {
    return this.artworks.filter((artwork) => artwork.artistSlug === artistSlug);
  }

  listArtworksBySeries(seriesSlug: string): Artwork[] {
    return this.artworks.filter((artwork) => artwork.seriesSlug === seriesSlug);
  }

  listArtists(): Artist[] {
    return [...this.artists].sort((a, b) => a.name.localeCompare(b.name));
  }

  getArtist(slug: string): Artist | null {
    return this.artistBySlug.get(slug) ?? null;
  }

  listSeries(): Series[] {
    return this.series;
  }

  getSeries(slug: string): Series | null {
    return this.seriesBySlug.get(slug) ?? null;
  }

  listSeriesByArtist(artistSlug: string): Series[] {
    return this.series.filter((entry) => entry.artistSlug === artistSlug);
  }

  listRooms(): Room[] {
    return this.rooms;
  }

  getRoom(slug: string): Room | null {
    return this.roomBySlug.get(slug) ?? null;
  }

  findPlacement(artworkSlug: string): { room: Room; wallId: string; placementId: string } | null {
    for (const room of this.rooms) {
      for (const wall of room.walls) {
        for (const placement of wall.placements) {
          if (placement.artworkSlug === artworkSlug) {
            return { room, wallId: wall.id, placementId: placement.id };
          }
        }
      }
    }
    return null;
  }

  listExhibitions(): Exhibition[] {
    return this.exhibitions;
  }

  getExhibition(slug: string): Exhibition | null {
    return this.exhibitions.find((exhibition) => exhibition.slug === slug) ?? null;
  }

  listPathways(): Pathway[] {
    return this.pathways;
  }

  getPathway(slug: string): Pathway | null {
    return this.pathways.find((pathway) => pathway.slug === slug) ?? null;
  }

  hasPlaceholders(): boolean {
    return (
      this.artworks.some((artwork) => artwork.isPlaceholder) ||
      this.artists.some((artist) => artist.isPlaceholder)
    );
  }
}

/** Curatorial emphasis first, then alphabetical. Never popularity, never price. */
function byCuratorialOrder(a: Artwork, b: Artwork): number {
  if (a.displayPriority !== b.displayPriority) return b.displayPriority - a.displayPriority;
  return a.title.localeCompare(b.title);
}
