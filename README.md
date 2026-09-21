# House of Nucci

**The House of Nucci Collection** — a private collection of digital art, built as an
institution: a museum you can walk through, an archive that stands on its own, artist
records that outlive marketplace pages, and a cultural record the House owns outright.

> **This build contains demo records only.** Every work, artist and provenance entry
> currently in the repository is a clearly marked placeholder with generated abstract
> media. Nothing here represents a real work, a real artist, or real ownership. They
> exist so the institution could be designed and reviewed before the collection was
> supplied — see `docs/DECISIONS.md` (O-2).

## Start here

| Document | What it covers |
|---|---|
| `docs/HOUSE_OF_NUCCI_MASTER_SPEC.md` | The canonical specification. It wins over any code or document that contradicts it. |
| `docs/BLUEPRINT.md` | Stack, structure, schema, slice scope, risks, decisions |
| `docs/DECISIONS.md` | What was decided without asking, and what needs the owner |
| `docs/IMPLEMENTATION_CHECKLIST.md` | Running state of the build, updated with the work |
| `docs/architecture.md` | Layers, dependency rules, and where each guarantee is enforced |
| `docs/3d-museum.md` · `docs/design-system.md` | The building and the visual language |
| `docs/database-schema.md` · `docs/collection-import.md` · `docs/media-pipeline.md` | The record, how it is filled, and how media is treated |
| `docs/performance.md` · `docs/deployment.md` · `docs/admin-guide.md` · `docs/provider-integrations.md` · `docs/ai-guide.md` | Operations and what is still to build |

## Running it

```bash
npm install
npm run dev                   # http://localhost:3000
npm run check                 # typecheck · lint · tests
npm run validate:collection   # integrity of the whole record
npm run build && npm run start
npm run smoke                 # browser smoke test against a running build
```

Node 22+. Requires `legacy-peer-deps` (already in `.npmrc`; see `docs/DECISIONS.md` D-15).

## The shape of it

```
content/     the collection record, one module per entity type
docs/        specification and architecture
scripts/     validation, manifest import, demo media, smoke test
src/domain   types, schemas and invariants — no framework
src/data     repository interface + file-backed implementation
src/providers  OpenSea / Raster / IPFS / Arweave adapters, link health
src/museum   geometry, navigation, media director, the R3F scene
src/app      routes
supabase/    canonical PostgreSQL schema
```

## Two ways in

**Enter the Museum** — a first-person walk through the Entry, the Great Room and the Black
Box, with works hung at curated scale, lit as a gallery lights them, and moving work that
actually moves. Falls back through optimised, guided and archive-only tiers so no device
is punished.

**Explore the Collection** — the archive: instant search, filters, artwork passports with
provenance as a biography, artist passports that separate what the House owns from the
artist's wider practice, exhibitions, pathways, and a local-only My House. All of it works
without WebGL, without an account, and without a wallet.

## The rules this codebase keeps

Artwork is never altered — not cropped, recoloured, reshaped, re-encoded or smoothed.
Nothing external is ever presented as owned by the House. Nothing is fabricated: no
biography, no provenance, no ownership. Rights are never inferred from possession. The
House's own record is the source of truth, and the museum opens whether or not any
marketplace is reachable.

Where those rules could be broken by accident, they are enforced in code — see the table
in `docs/architecture.md`.
