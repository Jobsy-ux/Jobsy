/**
 * Controlled vocabularies for the House of Nucci cultural record.
 *
 * These are deliberately explicit unions rather than free strings: the record is meant
 * to outlive this codebase, and a vocabulary that drifts is a record that rots.
 */

/** What kind of object the work fundamentally is, independent of its file format. */
export const ARTWORK_TYPES = [
  'unique', // 1/1
  'edition',
  'open-edition',
  'generative-output',
  'series-work',
] as const;
export type ArtworkType = (typeof ARTWORK_TYPES)[number];

/**
 * How the work must be rendered. Drives the renderer registry (spec §15).
 * Adding a value here without adding a renderer is a type error at the registry.
 */
export const MEDIA_TYPES = [
  'still', // PNG / JPEG / WEBP raster, non-animated
  'pixel', // raster that must render nearest-neighbour
  'animated', // GIF / APNG / animated WEBP
  'video', // MP4 / WEBM
  'svg', // vector, including on-chain SVG
  'audio', // sound work, with or without a visual
  'generative', // code that runs to produce the work
  'html', // self-contained HTML artwork
  'shader', // GLSL / WGSL work
  'interactive', // work that responds to input
  'model3d', // GLTF / GLB artwork (the work itself, not the architecture)
  'placeholder', // demo record only — never a real work
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

/** Media types whose pixels must not be interpolated (spec §14). */
export const NEAREST_NEIGHBOUR_MEDIA: ReadonlySet<MediaType> = new Set<MediaType>(['pixel']);

/** Media types that carry their own timeline and must animate in the museum (§16). */
export const TIME_BASED_MEDIA: ReadonlySet<MediaType> = new Set<MediaType>([
  'animated',
  'video',
  'audio',
  'generative',
  'shader',
  'interactive',
]);

/** Presentation, as curatorial metadata rather than a hardcoded look (§67). */
export const FRAME_STYLES = [
  'frameless-digital',
  'thin-black',
  'aluminum',
  'floating',
  'museum-white',
  'dark-wood',
  'light-wood',
  'screen',
  'projection',
  'none',
] as const;
export type FrameStyle = (typeof FRAME_STYLES)[number];

/** Lighting treatments. All are neutral-temperature by default (§66). */
export const LIGHTING_PROFILES = [
  'wall-wash',
  'gallery-spot',
  'screen-emissive',
  'ambient-only',
  'black-box',
  'daylight-void',
] as const;
export type LightingProfile = (typeof LIGHTING_PROFILES)[number];

/** Architectural material language for rooms (§05, §11). */
export const ROOM_MATERIALS = [
  'dark-concrete',
  'warm-limestone',
  'graphite',
  'black-box',
  'polished-stone',
] as const;
export type RoomMaterial = (typeof ROOM_MATERIALS)[number];

/**
 * Whether a work is currently obtainable anywhere — a handoff signal only.
 * House of Nucci never transacts (§22, §74).
 */
export const MARKET_STATUSES = [
  'private-collection', // in the House, not for sale — the default
  'available-externally', // the ARTIST or a marketplace has related work available
  'unknown',
] as const;
export type MarketStatus = (typeof MARKET_STATUSES)[number];

/** Editorial workflow state (§87). */
export const PUBLICATION_STATES = ['draft', 'review', 'published', 'archived'] as const;
export type PublicationState = (typeof PUBLICATION_STATES)[number];

/** Trust layer (§29). Absence of verification is never presented as verification. */
export const VERIFICATION_STATES = ['verified', 'unverified', 'disputed'] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

/**
 * How well a provenance claim is supported (§28, §104). Anything other than
 * `documented` is labelled as such in the UI. Missing history stays missing.
 */
export const PROVENANCE_CERTAINTY = ['documented', 'reported', 'inferred'] as const;
export type ProvenanceCertainty = (typeof PROVENANCE_CERTAINTY)[number];

export const PROVENANCE_EVENT_TYPES = [
  'created',
  'minted',
  'exhibited',
  'transferred',
  'acquired-by-house',
  'conserved',
] as const;
export type ProvenanceEventType = (typeof PROVENANCE_EVENT_TYPES)[number];

/** Rights posture. Defaults to the pessimistic value (§30). */
export const RIGHTS_STATUSES = [
  'not-established', // default: nothing may be assumed
  'display-only',
  'display-and-rehost',
  'artist-granted-extended',
] as const;
export type RightsStatus = (typeof RIGHTS_STATUSES)[number];

/**
 * On what basis a work may be shown publicly at all (§30, docs/rights.md).
 *
 * Deliberately separate from `RIGHTS_STATUSES`, which describes what the House may do
 * with the media. This describes why the House believes it may publish anything at all,
 * and it starts at nothing. Ownership of a token is never one of these bases.
 */
export const PUBLICATION_BASIS = [
  'not-established', // the default: no basis recorded, so nothing is assumed
  'explicit-permission', // the artist or rights holder said yes, and it is recorded
  'verified-license', // a licence permits it, and the licence is on file
  'owner-created', // the House made the asset itself (e.g. generated placeholder media)
] as const;
export type PublicationBasis = (typeof PUBLICATION_BASIS)[number];

/** External destinations we know how to label and verify (§23). */
export const LINK_PLATFORMS = [
  'opensea',
  'raster',
  'verse',
  'superrare',
  'foundation',
  'objkt',
  'artist-site',
  'artist-shop',
  'institution',
  'press',
  'interview',
  'other',
] as const;
export type LinkPlatform = (typeof LINK_PLATFORMS)[number];

/** Link health engine states (§24). */
export const LINK_HEALTH = ['healthy', 'redirecting', 'broken', 'unknown'] as const;
export type LinkHealth = (typeof LINK_HEALTH)[number];

/** Why a related work is being shown — recommendations are always explained (§35). */
export const RELATION_KINDS = [
  'curator', // explicit human judgement
  'artist',
  'series',
  'medium',
  'history',
  'dialogue', // visual or conceptual conversation between works
] as const;
export type RelationKind = (typeof RELATION_KINDS)[number];

/** Media provenance ranking (§46). Lower is better. */
export const MEDIA_SOURCE_PRIORITY = [
  'owner-original',
  'artist-canonical',
  'onchain-canonical',
  'platform',
  'marketplace-thumbnail',
] as const;
export type MediaSourceKind = (typeof MEDIA_SOURCE_PRIORITY)[number];

export function mediaSourceRank(kind: MediaSourceKind): number {
  return MEDIA_SOURCE_PRIORITY.indexOf(kind);
}

/** Experience tiers (§59). */
export const EXPERIENCE_TIERS = ['full-3d', 'optimized-3d', 'guided-3d', 'archive-2d'] as const;
export type ExperienceTier = (typeof EXPERIENCE_TIERS)[number];
