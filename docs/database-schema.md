# Database schema

Canonical DDL: `supabase/migrations/0001_init.sql`. Shapes mirror `src/domain/schema.ts`
by construction, so the authored records in `content/` can move into PostgreSQL without a
translation layer.

## The shape of the record

```
collector ─< collection ─< artwork ─┬─< media_asset          (canonical / web / thumbnail / poster / archival)
                                    ├─< token_binding        (optional: one verification layer)
                                    ├─< marketplace_link     (optional: distribution, with an ownership flag)
                                    ├─< provenance_event     (an object biography, with certainty per event)
                                    ├── acquisition          (separate from creation, private by default)
                                    ├── rights_record        (pessimistic by default)
                                    ├── why_in_the_house     (column: the collector's own account)
                                    ├─< curatorial_note      (attributed interpretation)
                                    ├─< curatorial_relationship (explained recommendations)
                                    └─< verification_record

artist ─< artist_link, artist_source, series
collection ─< room ─< wall ─< placement >─ artwork
                  └─< room_connection, guided_stop
collection ─< exhibition ─< exhibition_artwork, exhibition_room
collection ─< pathway ─< pathway_stop, pathway_room

artwork ─< external_metadata_source     (raw provider payloads, never merged automatically)
wallet_candidate                        (discovery, decided by a curator)
link_check                              (link health history)
```

## Decisions encoded in the DDL

**Artwork is the entity; the token is an attachment.** `token_binding` is a separate table
with its own uniqueness constraint. An artwork with no token is valid and renders
correctly — software art, a file the artist sent, a work minted later (§27).

**Ownership is a column, not a convention.** `marketplace_link.refers_to` is
`this-work | artist-practice | other-work`. The UI groups by it; the validator checks it;
there is no way to render an external work inside IN THE HOUSE by accident (§06, §26).

**Curated and fetched values never share a column.** `external_metadata_source` holds raw
provider payloads with a fetch timestamp. Sync jobs write only there (§45).

**Placement is separate from the work.** `room → wall → placement` lets the same artwork
hang elsewhere, at another scale, in another exhibition, without touching its record.
`placement` has `display_width` but deliberately no height column: height is derived from
the artwork's own aspect ratio, so a distorted hang is unrepresentable (§14, §68).

**Provenance is events, with certainty.** `provenance_event.occurred_on` is text with a
`YYYY[-MM[-DD]]` check, because a bare year is often all the evidence supports and a false
precision is worse than a coarse date. Unknown history is absent, never filled in (§28).

**Rights start at nothing.** `rights_record` defaults to `not-established`, and a check
constraint forbids `high_res_rehosting_allowed` while rights are unestablished. Owning a
work is not owning its copyright (§30).

**Publication needs a basis, and the basis needs evidence.** Migration `0003` adds
`publication_basis` (`not-established` by default), plus who granted permission, when it
was recorded and where the evidence lives. Check constraints refuse a licence basis with no
licence URL, a permission basis with no grantor or date, and high-resolution re-hosting
with no basis at all. See `docs/rights.md`.

**Media source decides eligibility.** `media_asset.source_kind` is checked so a
`marketplace-thumbnail` can never be the `canonical` role (§46).

**The collector has a voice of their own.** `artwork.why_in_the_house` and
`artist.why_in_the_house` (migration `0002`) hold the collector's own account of why
something is here. Deliberately separate from `curatorial_note`, which is the
institution's voice: on a personal collection the collector's reason is the thing no
marketplace can reproduce, and the interface attributes it to them by name. Optional, and
usually absent (`POSITIONING.md`).

**Honesty is required.** `artwork.is_placeholder` and `artist.is_placeholder` are
`not null`. A record cannot omit whether it is real (§91).

**Generic, single-tenant.** Every top-level entity carries `collection_id` from day one.
A second collection is a data operation, not a migration — and nothing in the V1 interface
suggests the possibility (§07).

## Not in this migration

Auth, row-level security policies and the admin publishing workflow land with Phase 5,
when the admin surface exists. Until then the record lives in `content/` and the schema is
the target rather than the runtime.
