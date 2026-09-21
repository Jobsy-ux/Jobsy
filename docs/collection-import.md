# Collection import

How ~200 works get from wallets, files and marketplaces into the House's own record —
without anything being invented, and without an automated job ever overwriting a
curatorial decision.

## The rule that shapes the pipeline

**The wallet is not the collection** (spec §43). Wallets hold spam, airdrops, tests,
duplicates and works that have since moved on. Discovery produces *candidates*; a curator
decides what is in the House. The manifest — not a wallet, not a marketplace — determines
membership.

The second rule: **the House's database is the source of truth** (§42). Providers enrich
and verify; they never serve the museum. If every marketplace disappeared tomorrow, the
House would still open.

## Stages

```
 1. DISCOVER      wallet addresses → candidate assets            (providers/*)
 2. DECIDE        candidate → in-collection | excluded           (curator)
 3. AUTHOR        manifest row per work, in the §44 field shape  (curator)
 4. IMPORT        manifest → staged records + report             (scripts/import-manifest.ts)
 5. REVIEW        staged records → content/ or the database      (curator)
 6. ENRICH        provider metadata → external_metadata_source   (background job)
 7. VERIFY        media, contracts, links                        (link-health, verification)
```

Stages 4 and 5 are separate on purpose. `npm run import:manifest -- manifest.csv` writes
to `content/imported/<timestamp>/` and touches nothing else. A curator merges what they
have read. There is no code path from an import to a published record (§45).

## The manifest

`docs/templates/artwork-manifest.csv` carries the full §44 field set with one empty row.
Notes on the columns that matter most:

| Column | Why it is strict |
|---|---|
| `slug` | The work's permanent URL (§54). Changing it breaks every link ever shared. |
| `media_source_kind` | Decides whether a file may hang. `marketplace-thumbnail` can never be canonical media (§46) — the importer and the database both refuse it. |
| `canonical_media_url` | The work itself. Derivatives go in `web_media_url` / `thumbnail_url` and must keep the same aspect ratio (§14). |
| `is_placeholder` | Required, explicitly `true` or `false`. A record cannot omit its own honesty (§91). |
| `visibility` | Imports land as `draft`. Publishing is a decision, not a side effect (§87). |
| `rights_status` | Ignored on import: rights start at `not-established` until a human establishes them (§30). |
| `why_in_the_house` | The collector's own words, carried across verbatim or left empty. Never generated, never summarised from the description — it is a point of view, not a claim of importance (`POSITIONING.md`). |
| provenance | Has no column. Each event needs its own evidence and certainty, so provenance is entered deliberately, never generated (§28, §104). |

## Media

Media handling — which file becomes the master, what gets derived, what gets archived —
is in `media-pipeline.md`. The short version: the owner's original wins, a marketplace
thumbnail never does, and nothing is re-encoded in a way that changes the work.

## Running it

```bash
npm run validate:collection                       # integrity, fidelity, ownership, rights
COLLECTION_MODE=production npm run validate:collection   # also fails on demo records
npm run import:manifest -- ~/collection.csv       # stage an import for review
```

`validate:collection` is the gate: it fails the build on a broken reference, a distorted
derivative, a work hung that the House does not own, or a rights contradiction.

## What still needs the owner

Nothing here can proceed without the real export: the manifest, the wallet addresses in
scope, and the owner-supplied originals (`DECISIONS.md`, O-2 and O-3). Until then the
repository carries demo records, marked as such everywhere they appear.
