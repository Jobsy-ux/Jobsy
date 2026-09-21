import { z } from 'zod';
import {
  ARTWORK_TYPES,
  FRAME_STYLES,
  LIGHTING_PROFILES,
  LINK_HEALTH,
  LINK_PLATFORMS,
  MARKET_STATUSES,
  MEDIA_SOURCE_PRIORITY,
  MEDIA_TYPES,
  PROVENANCE_CERTAINTY,
  PROVENANCE_EVENT_TYPES,
  PUBLICATION_STATES,
  RELATION_KINDS,
  RIGHTS_STATUSES,
  ROOM_MATERIALS,
  VERIFICATION_STATES,
} from './enums';

/* ------------------------------------------------------------------ primitives */

export const Slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case');

export const Id = z.string().min(1).max(120);

/**
 * Only http(s) survives. Every external string in the record passes through here, so a
 * `javascript:` or `data:` URL from provider metadata can never reach an href (§72).
 */
export const ExternalUrl = z.string().superRefine((value, ctx) => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    ctx.addIssue({ code: 'custom', message: 'must be an absolute URL' });
    return;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    ctx.addIssue({ code: 'custom', message: `unsupported URL scheme: ${parsed.protocol}` });
  }
});

/** Site-relative or absolute media reference. */
export const MediaUrl = z.union([z.string().startsWith('/'), ExternalUrl]);

/** Year of creation. Digital art predates the web; do not over-constrain the lower bound. */
export const Year = z.number().int().min(1900).max(2200);

/** ISO-8601 date (YYYY-MM-DD) or full timestamp. Stored as text, never localised. */
export const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, 'expected ISO-8601 date');

/** A year, a date, or a timestamp — whatever the evidence actually supports. */
export const ProvenanceDate = z.union([
  z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?(T[\d:.]+Z?)?$/, 'expected YYYY, YYYY-MM-DD or a timestamp'),
  Year.transform(String),
]);

/* ---------------------------------------------------------------- media assets */

export const MediaAssetSchema = z.object({
  id: Id,
  /** Where this file came from, which determines whether it may be a museum master (§46). */
  sourceKind: z.enum(MEDIA_SOURCE_PRIORITY),
  url: MediaUrl,
  mimeType: z.string().min(3),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  /** Seconds, for time-based media. */
  durationSeconds: z.number().positive().nullable().default(null),
  hasAudio: z.boolean().default(false),
  byteSize: z.number().int().positive().nullable().default(null),
  /** Archival integrity (§47). */
  sha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().default(null),
  ipfsCid: z.string().min(1).nullable().default(null),
  arweaveId: z.string().min(1).nullable().default(null),
  tokenUri: z.string().min(1).nullable().default(null),
  /** Has the House taken its own copy, rather than trusting a third party to persist it? */
  isMirrored: z.boolean().default(false),
  playbackVerified: z.boolean().default(false),
  lastVerified: IsoDate.nullable().default(null),
  note: z.string().max(2000).nullable().default(null),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;

/**
 * The media set for one artwork. `canonical` is what the work *is*; the others are
 * derivatives that exist for delivery. Originals are archived, never modified (§47).
 */
export const ArtworkMediaSchema = z.object({
  canonical: MediaAssetSchema,
  /** Delivery derivative used in the museum and on the web. Same pixels, smaller pipe. */
  web: MediaAssetSchema.nullable().default(null),
  thumbnail: MediaAssetSchema.nullable().default(null),
  /** First frame for time-based work, so nothing is represented as static by accident (§16). */
  poster: MediaAssetSchema.nullable().default(null),
  /** Owner-supplied original, held for preservation rather than display. */
  archivalOriginal: MediaAssetSchema.nullable().default(null),
});
export type ArtworkMedia = z.infer<typeof ArtworkMediaSchema>;

/* ------------------------------------------------------------ token + external */

export const TokenBindingSchema = z.object({
  chain: z.string().min(1),
  contractAddress: z.string().min(1),
  tokenId: z.string().min(1),
  tokenStandard: z.string().min(1).nullable().default(null),
  mintPlatform: z.string().min(1).nullable().default(null),
  mintDate: IsoDate.nullable().default(null),
  /** The wallet in which the House holds it. Never rendered publicly by default (§71). */
  walletAddress: z.string().min(1).nullable().default(null),
  contractVerification: z.enum(VERIFICATION_STATES).default('unverified'),
  tokenVerification: z.enum(VERIFICATION_STATES).default('unverified'),
});
export type TokenBinding = z.infer<typeof TokenBindingSchema>;

export const MarketplaceLinkSchema = z.object({
  platform: z.enum(LINK_PLATFORMS),
  url: ExternalUrl,
  label: z.string().min(1).max(80),
  /**
   * The ownership boundary, encoded (§06, §26). `this-work` points at the work the House
   * owns. Anything else is the artist's wider practice and must render outside IN THE HOUSE.
   */
  refersTo: z.enum(['this-work', 'artist-practice', 'other-work']),
  health: z.enum(LINK_HEALTH).default('unknown'),
  lastChecked: IsoDate.nullable().default(null),
  verification: z.enum(VERIFICATION_STATES).default('unverified'),
});
export type MarketplaceLink = z.infer<typeof MarketplaceLinkSchema>;

/* -------------------------------------------------------- provenance + rights */

export const ProvenanceEventSchema = z.object({
  id: Id,
  type: z.enum(PROVENANCE_EVENT_TYPES),
  /**
   * A bare year is common and honest — a false precision is worse than a coarse date —
   * so `YYYY`, `YYYY-MM-DD` and a full timestamp are all accepted, and a numeric year is
   * normalised to a string. What is never accepted is an invented date (§28).
   */
  date: ProvenanceDate.nullable(),
  /** Who acted. Anonymised as "Private collector" where the party is not public. */
  actor: z.string().max(200).nullable().default(null),
  note: z.string().max(2000).nullable().default(null),
  certainty: z.enum(PROVENANCE_CERTAINTY),
  /** Where this claim comes from, so the visitor can inspect it (§28). */
  sourceUrl: ExternalUrl.nullable().default(null),
  sourceLabel: z.string().max(200).nullable().default(null),
});
export type ProvenanceEvent = z.infer<typeof ProvenanceEventSchema>;

export const AcquisitionSchema = z.object({
  date: IsoDate.nullable(),
  source: z.string().max(200).nullable().default(null),
  /** Some collectors keep acquisition detail private — see DECISIONS.md O-5. */
  isPublic: z.boolean().default(false),
  note: z.string().max(2000).nullable().default(null),
});
export type Acquisition = z.infer<typeof AcquisitionSchema>;

export const RightsRecordSchema = z.object({
  /** Pessimistic default. Ownership of a token is not ownership of copyright (§30). */
  displayRightsStatus: z.enum(RIGHTS_STATUSES).default('not-established'),
  copyrightOwner: z.string().max(200).nullable().default(null),
  highResRehostingAllowed: z.boolean().default(false),
  derivativesAllowed: z.boolean().default(false),
  commercialUseAllowed: z.boolean().default(false),
  licenseUrl: ExternalUrl.nullable().default(null),
  notes: z.string().max(2000).nullable().default(null),
});
export type RightsRecord = z.infer<typeof RightsRecordSchema>;

export const VerificationRecordSchema = z.object({
  subject: z.enum(['artist', 'contract', 'token', 'marketplace-url', 'media', 'ownership']),
  state: z.enum(VERIFICATION_STATES),
  checkedAt: IsoDate.nullable().default(null),
  method: z.string().max(200).nullable().default(null),
});
export type VerificationRecord = z.infer<typeof VerificationRecordSchema>;

/* ----------------------------------------------------------------- curatorial */

export const CuratorialNoteSchema = z.object({
  /**
   * Interpretation is always attributed, so a visitor can tell documented fact from the
   * House's reading of a work (§38).
   */
  kind: z.enum(['collector-note', 'curatorial-context', 'historical-context']),
  body: z.string().min(1).max(8000),
  author: z.string().max(120).default('House of Nucci'),
});
export type CuratorialNote = z.infer<typeof CuratorialNoteSchema>;

export const CuratorialRelationshipSchema = z.object({
  /** Slug of the related artwork, which must also be in the collection. */
  artworkSlug: Slug,
  kind: z.enum(RELATION_KINDS),
  /** Shown to the visitor. A recommendation without a reason does not ship (§35). */
  reason: z.string().min(1).max(400),
});
export type CuratorialRelationship = z.infer<typeof CuratorialRelationshipSchema>;

/* -------------------------------------------------------------------- artists */

export const ArtistLinkSchema = z.object({
  platform: z.enum(LINK_PLATFORMS),
  url: ExternalUrl,
  label: z.string().min(1).max(80),
  verification: z.enum(VERIFICATION_STATES).default('unverified'),
  health: z.enum(LINK_HEALTH).default('unknown'),
});

/**
 * Artist Passport (§25). Every prose field is nullable and stays null until sourced —
 * an empty passport is honest, an invented one is not (§104).
 */
export const ArtistSchema = z.object({
  id: Id,
  slug: Slug,
  name: z.string().min(1).max(200),
  /** One line, factual, sourced. Not a marketing tagline. */
  overview: z.string().max(400).nullable().default(null),
  biography: z.string().max(12000).nullable().default(null),
  /** Why this artist's work is in the House — the collector's account, not a biography. */
  whyInTheHouse: z.string().max(8000).nullable().default(null),
  artistStatement: z.string().max(12000).nullable().default(null),
  process: z.string().max(12000).nullable().default(null),
  /** Every sourced prose field records where it came from. */
  sources: z
    .array(z.object({ label: z.string().min(1).max(200), url: ExternalUrl }))
    .default([]),
  exhibitions: z.array(z.string().max(300)).default([]),
  press: z.array(z.object({ label: z.string().max(300), url: ExternalUrl })).default([]),
  talks: z.array(z.object({ label: z.string().max(300), url: ExternalUrl })).default([]),
  links: z.array(ArtistLinkSchema).default([]),
  verification: z.enum(VERIFICATION_STATES).default('unverified'),
  portraitUrl: MediaUrl.nullable().default(null),
  state: z.enum(PUBLICATION_STATES).default('published'),
  /** Demo record, never a real artist (§91, DECISIONS D-7/D-8). */
  isPlaceholder: z.boolean(),
});
export type Artist = z.infer<typeof ArtistSchema>;

/* --------------------------------------------------------------------- series */

export const SeriesSchema = z.object({
  id: Id,
  slug: Slug,
  title: z.string().min(1).max(200),
  artistSlug: Slug,
  year: Year.nullable().default(null),
  description: z.string().max(8000).nullable().default(null),
  /** The artist's or platform's page for the series — external context, not ownership. */
  externalUrl: ExternalUrl.nullable().default(null),
  state: z.enum(PUBLICATION_STATES).default('published'),
  isPlaceholder: z.boolean(),
});
export type Series = z.infer<typeof SeriesSchema>;

/* ------------------------------------------------------------------- artworks */

/**
 * The Artwork Passport (§27): the canonical cultural entity. A token binding and
 * marketplace links are optional layers attached to it, not its identity.
 */
export const ArtworkSchema = z.object({
  id: Id,
  slug: Slug,
  title: z.string().min(1).max(300),
  /** Set only when the display form differs from the catalogue title. */
  displayTitle: z.string().max(300).nullable().default(null),
  artistSlug: Slug,
  seriesSlug: Slug.nullable().default(null),
  year: Year.nullable(),
  artworkType: z.enum(ARTWORK_TYPES),
  mediaType: z.enum(MEDIA_TYPES),
  /** Human-readable medium, in art-world language, not file format (§77). */
  medium: z.string().min(1).max(200),
  editionLabel: z.string().max(60).nullable().default(null),
  description: z.string().max(12000).nullable().default(null),
  /**
   * The collector's own account of why this work is here, in their voice (§34, and
   * docs/POSITIONING.md). Optional and selective: the House's strength is a point of
   * view, not a claim of importance, and the one thing no marketplace can reproduce is
   * why someone chose a work. Always attributed to the collector, never written on their
   * behalf.
   */
  whyInTheHouse: z.string().max(8000).nullable().default(null),
  notes: z.array(CuratorialNoteSchema).default([]),
  media: ArtworkMediaSchema,
  token: TokenBindingSchema.nullable().default(null),
  links: z.array(MarketplaceLinkSchema).default([]),
  provenance: z.array(ProvenanceEventSchema).default([]),
  acquisition: AcquisitionSchema.nullable().default(null),
  // `prefault` applies the schema defaults to an omitted record, so every artwork has an
  // explicit — and pessimistic — rights posture (§30).
  rights: RightsRecordSchema.prefault({}),
  verifications: z.array(VerificationRecordSchema).default([]),
  relationships: z.array(CuratorialRelationshipSchema).default([]),
  tags: z.array(z.string().min(1).max(60)).default([]),
  marketStatus: z.enum(MARKET_STATUSES).default('private-collection'),
  /** Curatorial emphasis, not popularity (§36). Higher sorts earlier. */
  displayPriority: z.number().int().min(0).max(100).default(50),
  featured: z.boolean().default(false),
  state: z.enum(PUBLICATION_STATES).default('published'),
  /**
   * TRUE means this is a structural demo record, not a work the House owns.
   * Required — a record cannot omit its own honesty (§91, §104).
   */
  isPlaceholder: z.boolean(),
});
export type Artwork = z.infer<typeof ArtworkSchema>;

/* ------------------------------------------------------- museum: rooms, walls */

/** Metres. The museum is modelled at human scale so that scale stays meaningful (§68). */
const Metres = z.number();

export const PlacementSchema = z.object({
  id: Id,
  artworkSlug: Slug,
  /** Horizontal position along the wall, in metres from the wall's start. */
  offset: Metres,
  /** Height of the artwork's centre above the floor. */
  centreHeight: Metres.default(1.55),
  /**
   * Intended physical width in metres. Height is always derived from the artwork's own
   * aspect ratio — there is no way to express a distorted display (§14, D-11).
   */
  displayWidth: Metres.positive(),
  frame: z.enum(FRAME_STYLES).default('frameless-digital'),
  lighting: z.enum(LIGHTING_PROFILES).default('wall-wash'),
  /** Gives a work the whole wall, refusing neighbours (§12). */
  solo: z.boolean().default(false),
});
export type Placement = z.infer<typeof PlacementSchema>;

export const WallSchema = z.object({
  id: Id,
  label: z.string().max(120).nullable().default(null),
  /** Wall start point on the floor plane, metres. */
  start: z.tuple([Metres, Metres]),
  end: z.tuple([Metres, Metres]),
  height: Metres.positive().default(6),
  placements: z.array(PlacementSchema).default([]),
});
export type Wall = z.infer<typeof WallSchema>;

export const RoomSchema = z.object({
  id: Id,
  slug: Slug,
  name: z.string().min(1).max(120),
  subtitle: z.string().max(200).nullable().default(null),
  material: z.enum(ROOM_MATERIALS),
  /** Interior volume: width (x), height (y), depth (z), metres. */
  size: z.tuple([Metres.positive(), Metres.positive(), Metres.positive()]),
  /** Room origin in world space, metres. */
  origin: z.tuple([Metres, Metres, Metres]).default([0, 0, 0]),
  /** Where the visitor's camera arrives, and which way it faces (radians). */
  entryPosition: z.tuple([Metres, Metres, Metres]),
  entryHeading: z.number().default(0),
  ambientIntensity: z.number().min(0).max(4).default(0.35),
  walls: z.array(WallSchema).default([]),
  /** Openings to other rooms, by room slug. */
  connections: z
    .array(
      z.object({
        toRoomSlug: Slug,
        /** Portal centre in world space. */
        position: z.tuple([Metres, Metres, Metres]),
        width: Metres.positive().default(3),
        height: Metres.positive().default(4),
      }),
    )
    .default([]),
  /** Ordered stops for guided mode and reduced-motion visitors (§13, §33). */
  guidedStops: z
    .array(
      z.object({
        artworkSlug: Slug,
        position: z.tuple([Metres, Metres, Metres]),
        heading: z.number(),
      }),
    )
    .default([]),
});
export type Room = z.infer<typeof RoomSchema>;

/* -------------------------------------------------- exhibitions and pathways */

export const ExhibitionSchema = z.object({
  id: Id,
  slug: Slug,
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).nullable().default(null),
  /** An exhibition is a curatorial argument, not a filter (§50). */
  curatorialStatement: z.string().min(1).max(20000),
  essay: z.string().max(60000).nullable().default(null),
  heroArtworkSlug: Slug.nullable().default(null),
  artworkSlugs: z.array(Slug).min(1),
  roomSlugs: z.array(Slug).default([]),
  startDate: IsoDate.nullable().default(null),
  endDate: IsoDate.nullable().default(null),
  coverImageUrl: MediaUrl.nullable().default(null),
  state: z.enum(PUBLICATION_STATES).default('published'),
});
export type Exhibition = z.infer<typeof ExhibitionSchema>;

export const PathwayStopSchema = z.object({
  artworkSlug: Slug,
  /** Why this work, here, in this argument. */
  context: z.string().min(1).max(4000),
});

export const PathwaySchema = z.object({
  id: Id,
  slug: Slug,
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).nullable().default(null),
  introduction: z.string().min(1).max(20000),
  stops: z.array(PathwayStopSchema).min(1),
  /** Optional guided museum route, by room slug, in order. */
  routeRoomSlugs: z.array(Slug).default([]),
  /** Pathways written for first-time visitors surface under Start Here (§31). */
  forNewVisitors: z.boolean().default(false),
  estimatedMinutes: z.number().int().positive().nullable().default(null),
  state: z.enum(PUBLICATION_STATES).default('published'),
});
export type Pathway = z.infer<typeof PathwaySchema>;

/* -------------------------------------------------- collection and collector */

export const CollectorSchema = z.object({
  id: Id,
  slug: Slug,
  name: z.string().min(1).max(200),
  statement: z.string().max(20000).nullable().default(null),
});
export type Collector = z.infer<typeof CollectorSchema>;

/**
 * Generic by design (§07): the schema could hold several collections. The V1 interface
 * exposes exactly one and says nothing about the possibility.
 */
export const CollectionSchema = z.object({
  id: Id,
  slug: Slug,
  name: z.string().min(1).max(200),
  formalName: z.string().min(1).max(200),
  collectorSlug: Slug,
  statement: z.string().max(20000).nullable().default(null),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const TagSchema = z.object({
  slug: Slug,
  label: z.string().min(1).max(60),
  description: z.string().max(600).nullable().default(null),
});
export type Tag = z.infer<typeof TagSchema>;

/**
 * Raw provider payloads, held separately from curated values so that a sync can never
 * overwrite a curatorial decision (§45).
 */
export const ExternalMetadataSourceSchema = z.object({
  id: Id,
  artworkSlug: Slug,
  provider: z.string().min(1),
  fetchedAt: IsoDate,
  /** Unparsed provider response. Treated as untrusted input everywhere (§72). */
  payload: z.unknown(),
});
export type ExternalMetadataSource = z.infer<typeof ExternalMetadataSourceSchema>;

/* ---------------------------------------------------------------- input types */

/**
 * `*Input` types are what authored records and importers write: fields with schema
 * defaults may be omitted. Parsing produces the fully-populated output type, so nothing
 * downstream has to reason about absent defaults.
 */
export type MediaAssetInput = z.input<typeof MediaAssetSchema>;
export type ArtworkInput = z.input<typeof ArtworkSchema>;
export type ArtistInput = z.input<typeof ArtistSchema>;
export type SeriesInput = z.input<typeof SeriesSchema>;
export type RoomInput = z.input<typeof RoomSchema>;
export type ExhibitionInput = z.input<typeof ExhibitionSchema>;
export type PathwayInput = z.input<typeof PathwaySchema>;
export type CollectionInput = z.input<typeof CollectionSchema>;
export type CollectorInput = z.input<typeof CollectorSchema>;
