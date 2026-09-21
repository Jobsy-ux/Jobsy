# Admin guide

**Phase 5.** The curator CMS is not built. Until it is, the record is edited as typed
modules in `content/` and checked with `npm run validate:collection`.

## What exists today

| Task | How |
|---|---|
| Add or edit a work, artist, series, room, exhibition, pathway | Edit the module in `content/`; types and schemas catch mistakes at build |
| Import a manifest | `npm run import:manifest -- file.csv` → staged in `content/imported/<timestamp>/` for review |
| Check the whole record | `npm run validate:collection` |
| Gate a production build | `COLLECTION_MODE=production npm run validate:collection` — fails while demo records remain |
| Regenerate demo media | `npm run generate:placeholders` |
| Smoke-test the built site | `npm run smoke` |

## What the CMS must do (§48)

Add / import / edit / hide / archive / feature an artwork · add and edit artists · assign
series, room, wall · set display scale, frame and lighting · add provenance, collector
notes, rights · add to an exhibition or pathway · set external links and market status ·
preview · publish.

Publishing states are `draft → review → published → archived` for artwork, artist,
exhibition, pathway and editorial content (§87). Imports land as `draft`; publishing is a
decision, never a side effect.

## Rules the CMS inherits

- A sync may never overwrite a curated field. Provider data lands in
  `external_metadata_source` and is offered as a suggestion, not applied (§45).
- Rights cannot be inferred from ownership. Enabling high-resolution re-hosting requires
  an explicit rights record (§30).
- Provenance events require a certainty. There is no "probably" that renders as fact (§28).
- A placement's height is not editable, because it is derived from the work (§14).
- A link must declare whether it refers to the work the House owns or to the artist's
  wider practice (§26).
- `why_in_the_house` is the collector's own text. The CMS may prompt for it and must never
  draft, summarise or auto-fill it, and the interface always attributes it to the collector
  (`POSITIONING.md`).

## Later: the visual curator

The data supports a room editor — drag a work onto a wall, resize, reposition, change
frame and lighting, preview, publish — because placement is already separate from the
work and rooms are already records (§49). It is deliberately not on the critical path.
