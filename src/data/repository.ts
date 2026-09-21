import type {
  Artist,
  Artwork,
  Collection,
  Collector,
  Exhibition,
  Pathway,
  Room,
  Series,
} from '@/domain';

/**
 * The application's view of the cultural record.
 *
 * Everything — pages, museum, admin, ingestion — reads through this interface, so the
 * storage behind it can move from authored modules to PostgreSQL without touching a
 * single consumer (spec §42, DECISIONS D-3). Implementations must not perform network
 * calls to marketplaces: external providers enrich the record, they do not serve it
 * (§73).
 */
export interface CollectionRepository {
  getCollection(): Collection;
  getCollector(): Collector;

  listArtworks(): Artwork[];
  getArtwork(slug: string): Artwork | null;
  listArtworksByArtist(artistSlug: string): Artwork[];
  listArtworksBySeries(seriesSlug: string): Artwork[];

  listArtists(): Artist[];
  getArtist(slug: string): Artist | null;

  listSeries(): Series[];
  getSeries(slug: string): Series | null;
  listSeriesByArtist(artistSlug: string): Series[];

  listRooms(): Room[];
  getRoom(slug: string): Room | null;
  /** Which room and wall a work hangs on, for VIEW IN MUSEUM (§54). */
  findPlacement(artworkSlug: string): { room: Room; wallId: string; placementId: string } | null;

  listExhibitions(): Exhibition[];
  getExhibition(slug: string): Exhibition | null;

  listPathways(): Pathway[];
  getPathway(slug: string): Pathway | null;

  /** True when any record in the repository is a demo placeholder (§91). */
  hasPlaceholders(): boolean;
}
