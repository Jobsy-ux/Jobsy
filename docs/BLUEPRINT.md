# HOUSE OF NUCCI — IMPLEMENTATION BLUEPRINT

Phase 0 deliverable. Read alongside `HOUSE_OF_NUCCI_MASTER_SPEC.md` (the contract) and
`DECISIONS.md` (the log of choices made and choices deferred to the owner).

---

## 1. Repository state at Phase 0

The repository was empty at the start of this work: a single 7-byte `README.md` on
`main`, one commit, no application code, no assets, no collection data. Nothing was
inherited, nothing was overwritten. The repository is named `jobsy/Jobsy` for historical
reasons; the npm package and the product are `house-of-nucci`. (See `DECISIONS.md` §O-1 —
the owner may want this repo renamed or the project relocated.)

**Consequence:** there is no supplied collection data and no supplied media. Everything
in `content/` at this stage is a clearly-marked demo record, generated for structural
validation only. See §7.

## 2. Chosen stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16, App Router, React 19, TypeScript strict** | Server rendering for the web-first / SEO requirement (§55–56); route-level code splitting keeps the 3D bundle off text pages. |
| 3D | **Three.js + React Three Fiber 9 + Drei 10** | Owner-preferred and production-stable. R3F lets the museum share the same typed domain model as the archive rather than a parallel scene-graph codebase. |
| Styling | **Tailwind v4 with a bespoke token layer** | Tailwind is used as a utility compiler only. All colour, type, spacing and motion values come from House of Nucci tokens defined in `src/styles/tokens.css`. No component library, no shadcn, no default palette (§95–96). |
| Validation | **Zod 4** | One schema per entity, shared by the ingestion pipeline, the repository layer and the tests. Untrusted external metadata is parsed, never trusted (§72). |
| Data (now) | **File-backed repository** over normalized, per-entity TypeScript records in `content/` | Lets the vertical slice run with zero infrastructure while keeping the exact shape of the eventual SQL tables. **Not** one giant JSON blob (§80). |
| Data (next) | **PostgreSQL via Supabase**, migration `supabase/migrations/0001_init.sql` | Owner-preferred. The SQL schema is authored now so the file-backed records cannot drift from it. |
| Storage | **Cloudflare R2** for derivatives + originals mirror; IPFS/Arweave identifiers preserved as data | §46–47, §88. |
| AI | Provider-abstract retrieval service, deferred to Phase 7 | §82, §38. |

**Why not a monorepo:** a single Next.js app with a `src/domain` boundary is enough for
one product; a workspace split would add friction without adding a second consumer.
Revisit if an ingestion worker needs to deploy separately.

## 3. Repository structure

```
content/                 Collection records (normalized, one file per entity type)
  collection.ts          Collection + collector
  artists.ts             Artist passports
  series.ts              Series
  artworks.ts            Artwork passports (canonical cultural record)
  exhibitions.ts         Exhibitions
  pathways.ts            Nucci Pathways
  rooms.ts               Museum rooms, walls, placements
docs/                    Specification + architecture documentation
public/                  Static media; demo media under public/media/demo/
scripts/                 Ingestion + validation CLI
src/
  app/                   Next.js routes (see §5)
  components/            UI components, grouped by surface
  domain/                Entity types, Zod schemas, invariants — framework-free
  data/                  Repository interface + file-backed implementation
  museum/                Three.js / R3F: architecture, materials, controls, renderers
  lib/                   Search, taste, analytics, formatting, url safety
  styles/                Token layer + global CSS
supabase/migrations/     Canonical SQL schema
tests/                   Unit + integration tests
```

**Hard rule:** `src/domain` and `src/data` may not import React, Next, or Three. The
cultural record must be readable by an ingestion worker, a test, or a future admin app
without dragging in a renderer.

## 4. Database architecture

Full detail in `database-schema.md`. Shape:

- **Generic entities, single-tenant UI.** Tables are `collection`, `collector`,
  `artwork`, `artist`, … with a `collection_id` foreign key present from day one (§07).
  The UI never exposes collection switching in V1; adding a second collection later is a
  data operation, not a migration.
- **Artwork is the canonical entity** (§27). The token is one verification layer,
  modelled as `token_binding`; the marketplace is a distribution layer, modelled as
  `marketplace_link`. An artwork with no token is legal and renders correctly.
- **Curated overrides are physically separate from source metadata** (§45).
  `external_metadata_source` holds raw provider payloads with a fetch timestamp;
  `artwork` holds curated values. Sync writes only to the former. There is no code path
  in which a sync can overwrite a curated field.
- **Placement is separate from artwork.** `room` → `wall` → `placement` lets the same
  work be hung in a different room, at a different scale, in a different exhibition,
  without touching its cultural record (§49, §68).
- **Provenance is an event list, not a string.** `provenance_event` rows carry a type, a
  date, an actor, and a `certainty` field. Unknown history is represented as absence,
  never as an invented row (§28, §104).
- **Rights are explicit and pessimistic.** `rights_record` defaults to
  "not established" — the application must never infer display rights from ownership
  (§30).

## 5. Page architecture

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Institutional entrance. Two equal doors: ENTER THE MUSEUM / EXPLORE THE COLLECTION, plus NEW TO DIGITAL ART. | Static |
| `/museum` | The 3D museum. Room + camera restored from session. | Client (dynamic import, never in the shared bundle) |
| `/collection` | The archive. Grid default; filters; search. | Server-rendered, client-filtered |
| `/artwork/[slug]` | Artwork passport. Media dominant, then context, then provenance, then external handoff. | Server-rendered |
| `/artist/[slug]` | Artist passport. IN THE HOUSE, then hard semantic break, then EXPLORE THE ARTIST. | Server-rendered |
| `/series/[slug]` | Series within the collection. | Server-rendered |
| `/exhibition/[slug]` | Exhibition with curatorial statement and ordered works. | Server-rendered |
| `/pathway/[slug]` | Nucci Pathway: essay + ordered stops + optional guided museum route. | Server-rendered |
| `/start-here` | Onboarding taught through actual works in the collection. | Server-rendered |
| `/my-house` | Local-only saved works and a reading of the visitor's taste. | Client, `localStorage` |
| `/admin/*` | Curator CMS (Phase 5). | Server, authenticated |

Every page above except `/museum` and `/my-house` is fully usable with JavaScript
disabled and with WebGL unavailable (§55, §63).

## 6. Museum architecture approach

Detail in `3d-museum.md`. Principles:

- **Rooms are authored data, not procedural output.** A room is a typed record: volume,
  material profile, lighting profile, walls, and placements. A future visual editor
  writes the same records (§49).
- **The building is assembled from parametric architectural primitives** (slab, void,
  aperture, plinth, light-shelf) rather than a single monolithic GLB, so the vertical
  slice needs no external asset pipeline to look designed, and individual rooms can be
  swapped for authored GLB later without touching placement data.
- **Artwork rendering is an extensible renderer registry** keyed by media type (§15).
  `still`, `animated`, `video`, `svg`, and a `placeholder` renderer exist now;
  `generative`, `html`, `shader`, `interactive`, `3d` have registry slots and a documented
  contract.
- **Media presence is distance- and visibility-driven** (§16). A placement is in one of
  four states — dormant / poster / streaming / active — driven by distance bands and
  frustum tests, with hard caps on simultaneously decoding video.
- **Fidelity rules are enforced in the geometry layer.** Plane geometry is derived from
  the artwork's true aspect ratio; there is no path to set a non-native aspect. Pixel-art
  works get nearest-neighbour filtering and no mipmaps (§14).
- **Four experience tiers** (§59): FULL 3D, OPTIMIZED 3D, GUIDED 3D, 2D COLLECTION,
  selected by capability probe with a manual override that is always reachable.

## 7. Media ingestion approach, and the placeholder problem

`collection-import.md` has the full pipeline. The critical point for this phase:

**No real collection data was supplied, and §104 forbids fabricating artwork metadata,
artist biography, provenance, or ownership.** So the slice ships with demo records that
are:

1. attributed to obviously non-real placeholder artists, never to real artists;
2. marked `isPlaceholder: true` in the record itself — a field the schema *requires*;
3. rendered with a visible DEMO RECORD marker anywhere the record appears;
4. backed by generated, non-representational placeholder media, clearly labelled as such;
5. excluded from `sitemap.xml`, from social cards, and from any "the House owns this"
   language;
6. removable in one step — `npm run validate:collection` fails the build if a placeholder
   record survives alongside `COLLECTION_MODE=production`.

Nothing in this repository claims House of Nucci owns anything it does not own. The
moment real assets arrive, placeholders are deleted rather than edited, so no invented
value can survive into the real record.

## 8. Performance approach

Budgets, instrumentation and degradation strategy in `performance.md`. Headline budgets:

| Metric | Budget |
|---|---|
| Initial JS on `/` and `/collection` | ≤ 120 KB gzip (no Three.js) |
| LCP on `/artwork/[slug]`, 4G mobile | ≤ 2.0 s |
| Time to first interactive room, desktop | ≤ 3.0 s |
| Sustained FPS, FULL 3D, desktop | 60 |
| Sustained FPS, OPTIMIZED 3D, iPhone | ≥ 30, no thermal collapse |
| Concurrently decoding videos | ≤ 2 (desktop), ≤ 1 (mobile) |
| Museum GPU texture budget | ≤ 512 MB desktop, ≤ 192 MB mobile |

Three.js is dynamically imported and never enters a text-page bundle. Room assets load
per-room with neighbour prefetch and explicit GPU disposal on exit.

## 9. First vertical-slice scope (Phases 1–3 of this build)

Proves, per §92: homepage · museum entrance · one fully designed wing · desktop
navigation · mobile interaction · artwork presentation · animated artwork · artwork
detail · collection archive · artist passport · provenance view · external marketplace
handoff · My House · one Nucci Pathway · basic import/validation · performance
architecture · session preservation · deep linking.

Slice inventory: 12–20 demo records spanning still image, pixel art, GIF, video, SVG,
1/1, edition, multiple artists, multiple series, multiple aspect ratios, and both an
OpenSea-shaped and Raster-shaped external link.

## 10. Key technical risks

| Risk | Mitigation |
|---|---|
| **Mobile thermals in WebGL.** Sustained 3D on iPhone heats the device and collapses frame rate. | Tier system with aggressive default to OPTIMIZED/GUIDED on mobile; FPS + thermal-proxy watchdog that degrades rather than stutters; 2D archive is a genuinely complete product. |
| **Video decode limits.** Browsers cap simultaneous decoding; iOS Safari is strictest. | Distance/visibility state machine, hard concurrency cap, poster frames, `playsInline`, explicit element teardown. |
| **Colour fidelity through the pipeline.** Texture compression and tone mapping can shift artwork colour — a §14 violation. | No lossy texture compression on artwork; artwork materials bypass scene tone mapping; colour-space handling documented and tested. |
| **External provider drift.** OpenSea/Raster schemas and URLs change or disappear. | Own DB is source of truth (§42); adapters normalize at the boundary; link-health engine flags rot; the museum runs with zero provider access. |
| **Placeholder contamination.** Demo data leaking into anything that reads as real. | Required `isPlaceholder` field, visible markers, build-time guard, SEO exclusion. |
| **Rights exposure.** Re-hosting high-resolution media the House has no right to re-host. | `rights_record` defaults to not-established; the media pipeline refuses to publish a high-res derivative without an explicit permission record. |
| **Scope.** The brief describes several years of product. | Phase gates, a checklist committed to the repo, and no Phase 7+ work before slice approval (§93). |

## 11. Decisions made without asking

Logged with rationale in `DECISIONS.md` (D-1 … D-n). Summary: Next 16 / R3F / Tailwind-as-
compiler; file-backed repository now with the SQL schema authored up front; parametric
architecture instead of authored GLB for the slice; renderer registry; tier system;
placeholder-record policy; `localStorage`-only My House; no wallet, no auth for visitors.

## 12. Decisions that genuinely need the owner

Detail in `DECISIONS.md` §Owner input required. In short: the real collection export and
media; artist permission and rights posture; which wallets are in scope; repository /
domain naming; typeface licensing; whether the demo records may stay in a public staging
deploy; and the acquisition-date disclosure policy.
