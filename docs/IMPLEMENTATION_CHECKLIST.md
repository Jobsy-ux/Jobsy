# IMPLEMENTATION CHECKLIST

Running state of the build. Update this file in the same commit as the work it describes;
it is how progress survives across sessions.

Legend: `[x]` done · `[~]` partial · `[ ]` not started · `[!]` blocked on owner input

## Recorded decisions (owner)
- [x] **Canonical domain: `houseofnucci.art`** — wired through `src/lib/site.ts`, canonical
      tags, sitemap, robots, OpenGraph, social cards, `.env.example` and the deployment
      docs. DNS/registrar/CDN deliberately **not** configured (awaiting the owner's word).
- [x] **Positioning: a highly curated personal collection** — `docs/POSITIONING.md` is
      canonical for copy and architectural scale; recorded as amendment A-2 in the master
      specification.
- [x] Museum rescaled for ~200 works (Great Room 20 × 8.5 × 24 m; widest hang 7 m)
- [x] `why_in_the_house` added to artwork and artist, surfaced in all three views

## Phase 0 — Architecture
- [x] Inspect repository (empty; greenfield)
- [x] Master specification stored (`HOUSE_OF_NUCCI_MASTER_SPEC.md`)
- [x] Implementation blueprint (`BLUEPRINT.md`)
- [x] Decision log + owner-input list (`DECISIONS.md`)
- [x] Toolchain, strict TypeScript, lint, test runner
- [x] Database schema authored (`database-schema.md`, `supabase/migrations/0001_init.sql`)
- [x] Domain model + Zod schemas
- [x] Repository interface + file-backed implementation
- [x] Canonical manifest template (`docs/templates/artwork-manifest.csv`)
- [x] Documentation set (`architecture`, `3d-museum`, `media-pipeline`, `collection-import`, `performance`, `design-system`, `ai-guide`, `provider-integrations`, `admin-guide`, `deployment`)

## Phase 1 — Design system
- [x] Token layer: colour, type scale, spacing, motion
- [x] Typography pairing (editorial serif + neutral sans)
- [x] Core primitives: institutional button, museum label, rule, eyebrow, external link
- [x] Homepage (two equal doors + Start Here)
- [x] Reduced-motion behaviour
- [x] Site icon and social metadata
- [ ] Visual QA pass on real devices (blocked on hardware; see Phase 9)

## Phase 2 — Vertical-slice museum
- [x] Capability probe + four experience tiers
- [x] Parametric architecture primitives (slab, void, aperture, plinth, light shelf)
- [x] One fully designed wing + entry
- [x] Desktop navigation (WASD / arrows / pointer-look / click-to-move)
- [x] Mobile touch navigation (drag-look, tap-to-move hotspots)
- [x] Guided museum mode fallback
- [x] Artwork renderer registry (still / animated / video / svg / placeholder)
- [x] Distance + visibility media state machine
- [x] Artwork audio gate (opt-in, proximity attenuation)
- [x] Session preservation (room + camera + tour state)
- [x] Browser smoke test covering canvas, walking, record overlay, non-WebGL fallback (`npm run smoke`)
- [ ] Real-device performance validation (frame rate, thermals, GPU memory — needs hardware)

## Phase 3 — Archive + artwork pages
- [x] Collection archive (grid, editorial not marketplace)
- [x] Filters + instant search
- [x] Artwork passport page
- [x] Provenance as object biography
- [x] External marketplace handoff
- [x] Deep links + VIEW IN MUSEUM transport
- [x] SEO: metadata, OpenGraph, sitemap, robots, absolute entity URLs on the canonical domain
- [x] Composed artwork social cards (`opengraph-image`)

## Phase 4 — Artist Passports
- [x] Artist passport page with hard IN THE HOUSE / EXPLORE THE ARTIST separation
- [x] Series pages
- [ ] Press / talks / CV sections populated (blocked: O-4)

## Phase 5 — Collection ingestion + admin
- [x] Manifest schema + CSV/JSON import script
- [x] Collection validation CLI (`npm run validate:collection`)
- [x] Provider adapter boundary (opensea / raster / ipfs / arweave / chain)
- [x] Link-health checker (`src/providers/link-health.ts`)
- [ ] Scheduled link-health runs and their admin surface
- [ ] Admin CMS UI (draft/review/published/archived)
- [ ] Supabase repository implementation

## Phase 6 — My House + Pathways
- [x] My House (localStorage save + taste reading)
- [x] One Nucci Pathway end to end
- [ ] Guided museum route for pathways
- [ ] Explained recommendations across all relation types

## Phase 7 — Nucci Guide
- [ ] Retrieval index over curated sources
- [ ] Provider-abstract AI service
- [ ] Contextual GO DEEPER surfaces
- [ ] Source citation UI

## Phase 8 — Full collection ingestion
- [!] Blocked on O-2 (real collection export) and O-3 (wallet scope)

## Phase 9 — Optimization / QA / launch
- [ ] Performance budgets enforced in CI (budgets defined in `performance.md`)
- [ ] Cross-browser + real-device QA matrix
- [ ] Accessibility audit
- [ ] Backups + archival strategy executed

---

## Verified in a browser (this build)

Run against a production build with `npm run smoke`, plus manual inspection:

- homepage, archive with instant search, artwork passport, artist passport with the
  ownership separation intact
- the museum: canvas renders, arrival in the Entry, walking, room transitions, guided
  transport between stops, selecting a work opens its record in place
- moving image: the video work plays when approached, is unloaded on leaving the room, and
  the animated GIF runs on the wall at its own pace
- a browser without WebGL gets the full room-by-room fallback
- no console errors on any surface

## Known gaps

- **Real-device QA is outstanding** and is a launch gate: frame rate, thermals, GPU
  memory, iOS Safari video behaviour, Core Web Vitals in the field. The headless software
  renderer used here says nothing useful about any of them.
- **Everything is demo data.** Phases 4 and 8 cannot complete until the real collection
  export arrives (`DECISIONS.md` O-2, O-3).
