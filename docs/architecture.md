# Architecture

How the pieces fit, and which rules are enforced where. `BLUEPRINT.md` has the summary
and the reasoning; this is the map.

## Layers

```
content/            authored records  ─┐
supabase/migrations  canonical schema ─┤ the cultural record
                                       │
src/domain          types · Zod schemas · invariants   ← framework-free
src/data            repository interface + file-backed implementation
src/providers       provider adapters · link health    ← the only code that knows about OpenSea
src/lib             site identity · search · filters · taste · analytics · device tier · session
src/museum          geometry · navigation · media director · R3F scene
src/components      UI, grouped by surface
src/app             routes
```

**Dependency rule:** `src/domain` and `src/data` import no React, no Next, no Three. The
record must be readable by an importer, a test, or a future admin app without dragging in
a renderer. `src/providers` imports `src/domain` only.

## Where each guarantee lives

A rule that matters is enforced in one place, as close to unrepresentable as the language
allows — not repeated as a convention in twelve components.

| Guarantee | Enforced in |
|---|---|
| Artwork is never distorted (§14) | `domain/invariants.derivedDisplaySize` and `museum/geometry.hangWork` — display height is derived from the artwork, and no API accepts an aspect ratio |
| Pixel work is never interpolated (§14) | `domain/enums.NEAREST_NEIGHBOUR_MEDIA` → `museum/scene/useArtworkSurface.applyFiltering`, `.hon-pixel-media` on the web |
| Artwork colour is never shifted (§14, §66) | `MeshBasicMaterial` + `toneMapped: false` on every wall panel; artwork bypasses `next/image` |
| Moving work actually moves (§16) | `museum/media/media-director` + the renderer registry; `validate` warns on a missing poster |
| Nothing external is presented as owned (§06, §26) | `MarketplaceLink.refersTo` in the schema, `ownedWorkLinks` / `externalPracticeLinks`, and a hard section break in the artist and artwork pages |
| A relation points only at works the House holds | `validate.missing-relation`, and a foreign key in SQL |
| Rights are never assumed (§30) | `RightsRecordSchema` defaults, `mayPublishHighResolution`, SQL check constraints |
| Originals never become public downloads (O-4) | `mayServePublicly` + `PUBLIC_DISPLAY_MAX_EDGE`, and `public-original` / `original-public` validation |
| Publishing requires a recorded basis (O-4) | `hasPublicationBasis`; a warning in development, a build failure in production |
| Provenance is never invented (§28) | `ProvenanceEvent.certainty` is required; the UI labels anything not `documented` |
| Demo records are never mistaken for real ones (§91) | `isPlaceholder` is a required field, visible markers, sitemap exclusion, a production-mode build gate |
| Untrusted metadata cannot become an href (§72) | `ExternalUrl` in the schema, `lib/url.safeExternalUrl`, and one `<ExternalLink>` primitive |
| The House never overstates itself (`POSITIONING.md`) | One description in `lib/site.ts`, used for every page's metadata and social card; counts are rendered from the record as plain facts |
| One canonical domain (A-1) | `lib/site.ts` — `absoluteUrl` and `routes` are the only spellings of a URL in the product |
| The museum works without marketplaces (§73) | The repository never calls a provider; providers only write to the raw metadata table |

## Rendering strategy

- Everything except `/museum` and `/my-house` is server-rendered and indexable (§55–56).
- `/museum` dynamically imports the 3D bundle client-side, so Three.js never enters a
  text page's bundle (§58).
- `/my-house` is client-only because what a visitor saved exists only in their browser
  (§34, §71).

## Session and deep links

`lib/museum-session` keeps room, position, heading, tour state and the audio choice in
`sessionStorage`. `/museum` resolves arrival in one pass — deep link, then session, then
the front door — before the first frame, so nobody watches themselves be teleported
(§53, §54).

## Extension points

- **A new media type**: add to `MEDIA_TYPES`, add a renderer in `components/artwork/ArtworkMedia`
  and a branch in `museum/scene/useArtworkSurface`. Nothing else changes.
- **A new provider**: implement `CollectionProvider` under `src/providers/<name>/`. No UI
  file learns its name.
- **A database**: implement `CollectionRepository`. `getRepository()` is the only place
  that knows which implementation is in use.
- **A new room**: add a record to `content/rooms.ts` (later: the `room` table). Geometry,
  navigation, lighting and guided stops all derive from it.
