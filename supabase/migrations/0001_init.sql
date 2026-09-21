-- HOUSE OF NUCCI — canonical schema
--
-- The application's source of truth (spec §42). External providers enrich and verify
-- these rows; they never serve them.
--
-- Two rules shape almost everything below:
--   1. The artwork is the cultural entity. A token is one verification layer attached to
--      it, and a marketplace is a distribution layer. Both are optional (§27).
--   2. Curated values and fetched values never share a column. A sync writes only to
--      external_metadata_source; a curator writes only to the entity tables (§45).
--
-- Entity names are generic on purpose: the schema could hold several collections even
-- though the V1 interface exposes exactly one and says nothing about the possibility
-- (§07).

create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────── vocabularies ──
-- Enumerations mirror src/domain/enums.ts. Changing one means changing both.

create type artwork_type as enum (
  'unique', 'edition', 'open-edition', 'generative-output', 'series-work'
);

create type media_type as enum (
  'still', 'pixel', 'animated', 'video', 'svg', 'audio', 'generative', 'html',
  'shader', 'interactive', 'model3d', 'placeholder'
);

create type frame_style as enum (
  'frameless-digital', 'thin-black', 'aluminum', 'floating', 'museum-white',
  'dark-wood', 'light-wood', 'screen', 'projection', 'none'
);

create type lighting_profile as enum (
  'wall-wash', 'gallery-spot', 'screen-emissive', 'ambient-only', 'black-box',
  'daylight-void'
);

create type room_material as enum (
  'dark-concrete', 'warm-limestone', 'graphite', 'black-box', 'polished-stone'
);

create type market_status as enum ('private-collection', 'available-externally', 'unknown');
create type publication_state as enum ('draft', 'review', 'published', 'archived');
create type verification_state as enum ('verified', 'unverified', 'disputed');
create type provenance_certainty as enum ('documented', 'reported', 'inferred');
create type provenance_event_type as enum (
  'created', 'minted', 'exhibited', 'transferred', 'acquired-by-house', 'conserved'
);
create type rights_status as enum (
  'not-established', 'display-only', 'display-and-rehost', 'artist-granted-extended'
);
create type link_platform as enum (
  'opensea', 'raster', 'verse', 'superrare', 'foundation', 'objkt', 'artist-site',
  'artist-shop', 'institution', 'press', 'interview', 'other'
);
create type link_health as enum ('healthy', 'redirecting', 'broken', 'unknown');
create type link_reference as enum ('this-work', 'artist-practice', 'other-work');
create type relation_kind as enum ('curator', 'artist', 'series', 'medium', 'history', 'dialogue');
create type media_source_kind as enum (
  'owner-original', 'artist-canonical', 'onchain-canonical', 'platform', 'marketplace-thumbnail'
);
create type note_kind as enum ('collector-note', 'curatorial-context', 'historical-context');

-- ────────────────────────────────────────────────────── collection + people ──

create table collector (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  statement   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table collection (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  formal_name   text not null,
  collector_id  uuid not null references collector (id) on delete restrict,
  statement     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table artist (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  overview          text,
  -- Prose stays null until it is sourced. An empty passport is honest; an invented one
  -- is forbidden (§25, §104).
  biography         text,
  artist_statement  text,
  process           text,
  portrait_url      text,
  verification      verification_state not null default 'unverified',
  state             publication_state not null default 'draft',
  is_placeholder    boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Where each sourced claim about an artist came from.
create table artist_source (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references artist (id) on delete cascade,
  label      text not null,
  url        text not null,
  kind       text not null default 'reference',
  check (url ~ '^https?://')
);

create table artist_link (
  id            uuid primary key default gen_random_uuid(),
  artist_id     uuid not null references artist (id) on delete cascade,
  platform      link_platform not null,
  url           text not null,
  label         text not null,
  verification  verification_state not null default 'unverified',
  health        link_health not null default 'unknown',
  last_checked  timestamptz,
  check (url ~ '^https?://')
);

create table series (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  artist_id       uuid not null references artist (id) on delete restrict,
  year            integer,
  description     text,
  external_url    text,
  state           publication_state not null default 'draft',
  is_placeholder  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (external_url is null or external_url ~ '^https?://')
);

-- ───────────────────────────────────────────────────────────────── artworks ──

create table artwork (
  id                uuid primary key default gen_random_uuid(),
  collection_id     uuid not null references collection (id) on delete restrict,
  slug              text not null unique,
  title             text not null,
  display_title     text,
  artist_id         uuid not null references artist (id) on delete restrict,
  series_id         uuid references series (id) on delete set null,
  year              integer,
  artwork_type      artwork_type not null,
  media_type        media_type not null,
  medium            text not null,
  edition_label     text,
  description       text,
  tags              text[] not null default '{}',
  market_status     market_status not null default 'private-collection',
  -- Curatorial emphasis. Never derived from price, volume or popularity (§36).
  display_priority  smallint not null default 50 check (display_priority between 0 and 100),
  featured          boolean not null default false,
  state             publication_state not null default 'draft',
  is_placeholder    boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index artwork_collection_idx on artwork (collection_id);
create index artwork_artist_idx on artwork (artist_id);
create index artwork_series_idx on artwork (series_id);
create index artwork_state_idx on artwork (state) where state = 'published';
create index artwork_tags_idx on artwork using gin (tags);

-- Media assets. `role` distinguishes the work itself from the derivatives that exist
-- only for delivery; a derivative may be smaller, never reshaped (§14, §46).
create table media_asset (
  id                  uuid primary key default gen_random_uuid(),
  artwork_id          uuid not null references artwork (id) on delete cascade,
  role                text not null check (role in ('canonical', 'web', 'thumbnail', 'poster', 'archival-original')),
  source_kind         media_source_kind not null,
  url                 text not null,
  mime_type           text not null,
  width               integer check (width is null or width > 0),
  height              integer check (height is null or height > 0),
  duration_seconds    numeric check (duration_seconds is null or duration_seconds > 0),
  has_audio           boolean not null default false,
  byte_size           bigint,
  sha256              text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  ipfs_cid            text,
  arweave_id          text,
  token_uri           text,
  is_mirrored         boolean not null default false,
  playback_verified   boolean not null default false,
  last_verified       timestamptz,
  note                text,
  created_at          timestamptz not null default now(),
  unique (artwork_id, role)
);

-- A marketplace thumbnail may never stand in for the work itself (§46).
alter table media_asset add constraint canonical_is_not_a_thumbnail
  check (role <> 'canonical' or source_kind <> 'marketplace-thumbnail');

create table token_binding (
  id                     uuid primary key default gen_random_uuid(),
  artwork_id             uuid not null references artwork (id) on delete cascade,
  chain                  text not null,
  contract_address       text not null,
  token_id               text not null,
  token_standard         text,
  mint_platform          text,
  mint_date              date,
  -- Held for verification, not for display (§71).
  wallet_address         text,
  contract_verification  verification_state not null default 'unverified',
  token_verification     verification_state not null default 'unverified',
  unique (chain, contract_address, token_id)
);

create table marketplace_link (
  id            uuid primary key default gen_random_uuid(),
  artwork_id    uuid not null references artwork (id) on delete cascade,
  platform      link_platform not null,
  url           text not null,
  label         text not null,
  -- The ownership boundary, in the schema: anything other than 'this-work' must render
  -- outside IN THE HOUSE (§06, §26).
  refers_to     link_reference not null,
  health        link_health not null default 'unknown',
  last_checked  timestamptz,
  verification  verification_state not null default 'unverified',
  check (url ~ '^https?://')
);

create table provenance_event (
  id            uuid primary key default gen_random_uuid(),
  artwork_id    uuid not null references artwork (id) on delete cascade,
  type          provenance_event_type not null,
  -- Text, not date: a bare year is often all the evidence supports, and a false
  -- precision is worse than a coarse one (§28).
  occurred_on   text check (occurred_on is null or occurred_on ~ '^\d{4}(-\d{2}(-\d{2})?)?'),
  actor         text,
  note          text,
  certainty     provenance_certainty not null,
  source_url    text check (source_url is null or source_url ~ '^https?://'),
  source_label  text,
  position      smallint not null default 0
);

create table acquisition (
  artwork_id  uuid primary key references artwork (id) on delete cascade,
  acquired_on date,
  source      text,
  -- Acquisition detail is private unless the owner publishes it (§51, DECISIONS O-5).
  is_public   boolean not null default false,
  note        text
);

create table rights_record (
  artwork_id                 uuid primary key references artwork (id) on delete cascade,
  -- Pessimistic by default: owning a work is not owning its copyright (§30).
  display_rights_status      rights_status not null default 'not-established',
  copyright_owner            text,
  high_res_rehosting_allowed boolean not null default false,
  derivatives_allowed        boolean not null default false,
  commercial_use_allowed     boolean not null default false,
  license_url                text check (license_url is null or license_url ~ '^https?://'),
  notes                      text,
  updated_at                 timestamptz not null default now(),
  -- Re-hosting cannot be enabled while rights are unestablished.
  check (not high_res_rehosting_allowed or display_rights_status <> 'not-established')
);

create table verification_record (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  uuid references artwork (id) on delete cascade,
  artist_id   uuid references artist (id) on delete cascade,
  subject     text not null check (subject in ('artist', 'contract', 'token', 'marketplace-url', 'media', 'ownership')),
  state       verification_state not null,
  checked_at  timestamptz,
  method      text,
  check (num_nonnulls(artwork_id, artist_id) = 1)
);

create table curatorial_note (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  uuid not null references artwork (id) on delete cascade,
  kind        note_kind not null,
  body        text not null,
  -- Interpretation is always attributed, so a visitor can tell it from documented fact (§38).
  author      text not null default 'House of Nucci',
  position    smallint not null default 0
);

-- A relation may only point at another work in the collection (§06): enforced by the
-- foreign key, not by convention.
create table curatorial_relationship (
  id               uuid primary key default gen_random_uuid(),
  artwork_id       uuid not null references artwork (id) on delete cascade,
  related_artwork_id uuid not null references artwork (id) on delete cascade,
  kind             relation_kind not null,
  -- A recommendation without a reason does not ship (§35).
  reason           text not null check (length(reason) > 0),
  check (artwork_id <> related_artwork_id),
  unique (artwork_id, related_artwork_id, kind)
);

-- ───────────────────────────────────────────────────────────── the building ──

create table room (
  id                 uuid primary key default gen_random_uuid(),
  collection_id      uuid not null references collection (id) on delete cascade,
  slug               text not null unique,
  name               text not null,
  subtitle           text,
  material           room_material not null,
  -- Metres. Interior volume and the room origin on the floor plane.
  size_x             numeric not null check (size_x > 0),
  size_y             numeric not null check (size_y > 0),
  size_z             numeric not null check (size_z > 0),
  origin_x           numeric not null default 0,
  origin_y           numeric not null default 0,
  origin_z           numeric not null default 0,
  entry_x            numeric not null,
  entry_y            numeric not null default 1.65,
  entry_z            numeric not null,
  entry_heading      numeric not null default 0,
  ambient_intensity  numeric not null default 0.35,
  position           smallint not null default 0
);

create table room_connection (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references room (id) on delete cascade,
  to_room_id     uuid not null references room (id) on delete cascade,
  position_x     numeric not null,
  position_y     numeric not null default 0,
  position_z     numeric not null,
  width          numeric not null default 3 check (width > 0),
  height         numeric not null default 4 check (height > 0),
  check (room_id <> to_room_id)
);

create table wall (
  id        uuid primary key default gen_random_uuid(),
  room_id   uuid not null references room (id) on delete cascade,
  label     text,
  -- Segment on the floor plane. The hanging face is the left-hand normal of start → end.
  start_x   numeric not null,
  start_z   numeric not null,
  end_x     numeric not null,
  end_z     numeric not null,
  height    numeric not null default 6 check (height > 0)
);

-- Placement is separate from the artwork so the same work can hang elsewhere, at another
-- scale, in another exhibition, without touching its cultural record (§49, §68).
create table placement (
  id             uuid primary key default gen_random_uuid(),
  wall_id        uuid not null references wall (id) on delete cascade,
  artwork_id     uuid not null references artwork (id) on delete cascade,
  offset_m       numeric not null,
  centre_height  numeric not null default 1.55,
  -- Intended physical width. Height is always derived from the artwork's own aspect
  -- ratio; there is deliberately no column for it (§14).
  display_width  numeric not null check (display_width > 0),
  frame          frame_style not null default 'frameless-digital',
  lighting       lighting_profile not null default 'wall-wash',
  solo           boolean not null default false
);

create table guided_stop (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references room (id) on delete cascade,
  artwork_id  uuid not null references artwork (id) on delete cascade,
  position_x  numeric not null,
  position_y  numeric not null default 1.65,
  position_z  numeric not null,
  heading     numeric not null,
  position    smallint not null default 0
);

-- ──────────────────────────────────────────────── exhibitions and pathways ──

create table exhibition (
  id                    uuid primary key default gen_random_uuid(),
  collection_id         uuid not null references collection (id) on delete cascade,
  slug                  text not null unique,
  title                 text not null,
  subtitle              text,
  -- An exhibition is a curatorial argument, not a saved filter (§50).
  curatorial_statement  text not null,
  essay                 text,
  hero_artwork_id       uuid references artwork (id) on delete set null,
  cover_image_url       text,
  starts_on             date,
  ends_on               date,
  state                 publication_state not null default 'draft',
  created_at            timestamptz not null default now()
);

create table exhibition_artwork (
  exhibition_id  uuid not null references exhibition (id) on delete cascade,
  artwork_id     uuid not null references artwork (id) on delete cascade,
  position       smallint not null default 0,
  primary key (exhibition_id, artwork_id)
);

create table exhibition_room (
  exhibition_id  uuid not null references exhibition (id) on delete cascade,
  room_id        uuid not null references room (id) on delete cascade,
  primary key (exhibition_id, room_id)
);

create table pathway (
  id                 uuid primary key default gen_random_uuid(),
  collection_id      uuid not null references collection (id) on delete cascade,
  slug               text not null unique,
  title              text not null,
  subtitle           text,
  introduction       text not null,
  for_new_visitors   boolean not null default false,
  estimated_minutes  smallint,
  state              publication_state not null default 'draft',
  created_at         timestamptz not null default now()
);

create table pathway_stop (
  id          uuid primary key default gen_random_uuid(),
  pathway_id  uuid not null references pathway (id) on delete cascade,
  artwork_id  uuid not null references artwork (id) on delete cascade,
  -- Why this work, here, in this argument.
  context     text not null,
  position    smallint not null default 0,
  unique (pathway_id, artwork_id)
);

create table pathway_room (
  pathway_id  uuid not null references pathway (id) on delete cascade,
  room_id     uuid not null references room (id) on delete cascade,
  position    smallint not null default 0,
  primary key (pathway_id, room_id)
);

-- ──────────────────────────────────────────── provider data, kept separate ──

-- Raw provider payloads. A sync writes here and nowhere else, so an automated refresh
-- can never overwrite a curatorial decision (§45).
create table external_metadata_source (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  uuid not null references artwork (id) on delete cascade,
  provider    text not null,
  fetched_at  timestamptz not null default now(),
  payload     jsonb not null,
  unique (artwork_id, provider, fetched_at)
);

create index external_metadata_latest_idx
  on external_metadata_source (artwork_id, provider, fetched_at desc);

-- Link health engine (§24): every checked URL, whatever it belongs to.
create table link_check (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  checked_at    timestamptz not null default now(),
  health        link_health not null,
  status_code   integer,
  redirected_to text,
  error         text
);

create index link_check_url_idx on link_check (url, checked_at desc);

-- Candidate assets discovered in a wallet. Discovery proposes; the manifest disposes —
-- nothing here is in the collection until a curator says so (§43).
create table wallet_candidate (
  id                uuid primary key default gen_random_uuid(),
  wallet_address    text not null,
  chain             text not null,
  contract_address  text not null,
  token_id          text not null,
  discovered_at     timestamptz not null default now(),
  payload           jsonb,
  decision          text not null default 'undecided'
                    check (decision in ('undecided', 'in-collection', 'excluded')),
  decided_at        timestamptz,
  decided_by        text,
  unique (chain, contract_address, token_id, wallet_address)
);

-- ────────────────────────────────────────────────────────────────── upkeep ──

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artwork_touch before update on artwork
  for each row execute function touch_updated_at();
create trigger artist_touch before update on artist
  for each row execute function touch_updated_at();
create trigger series_touch before update on series
  for each row execute function touch_updated_at();
create trigger collection_touch before update on collection
  for each row execute function touch_updated_at();
create trigger collector_touch before update on collector
  for each row execute function touch_updated_at();
