# Media pipeline

The House is a collection, not a website (§47). What it holds of each work — and what it
serves — are two different things.

## Source priority

1. owner-supplied original
2. artist-approved canonical media
3. on-chain / IPFS / Arweave canonical media
4. trusted platform media
5. marketplace thumbnail — **identification only**

`media_asset.source_kind` records which one a file is, and a check constraint forbids a
marketplace thumbnail from being the canonical asset. An OpenSea image is never a museum
master (§46).

## Roles

| Role | Purpose |
|---|---|
| `canonical` | the work itself; what the museum and the artwork page render |
| `web` | a delivery derivative: smaller pipe, identical pixels and aspect ratio |
| `thumbnail` | archive plates and lists |
| `poster` | first frame of time-based work, so nothing is ever shown as static by accident |
| `archival-original` | held for preservation, never for display |

`validate:collection` fails the build if a `web` derivative's aspect ratio differs from
canonical by more than 1%. A derivative may be smaller; it may never be reshaped (§14).

## What is never done to a work

No crop. No stretch. No recolour. No filter. No AI modification. No automatic sharpening.
No aspect change. No generated approximation. On the web, artwork bypasses `next/image`
entirely — the optimizer re-encodes and may resample, and a recompressed artwork is an
altered artwork. AVIF is excluded from the image formats for the same reason: its chroma
handling can shift colour.

Pixel work is rendered nearest-neighbour everywhere. Animated work keeps its own timing
and loop. Video keeps its frame rate. Audio is preserved as recorded.

## Preservation record

Per asset: original acquired? · SHA-256 · original resolution · canonical token URI ·
IPFS CID · Arweave ID · mirrored? · playback verified? · last verified. Identifiers are
stored, not gateway URLs: a gateway is a route that changes, a CID is the work's address
(`providers/storage/content-addressed.ts` resolves several at read time).

## Rights gate

A high-resolution derivative is published only when `rights_record` explicitly permits
re-hosting, and only on top of a recorded publication basis. Ownership of a work never
implies either (§30). Anything served publicly is capped at 2048px on the longest edge
unless high resolution has been explicitly permitted, and archival originals are never
served from the public directory at all.

`docs/rights.md` is canonical for the whole posture; `mayPublishHighResolution` and
`mayServePublicly` are the checks, with matching constraints in the database.

## Demo media

`scripts/generate-placeholder-media.mjs` produces the abstract files in
`public/media/demo/`: deterministic procedural compositions covering still, pixel,
animated, video and vector, at several aspect ratios. They exist so the museum could be
built before the collection was supplied. They are not artworks and not stand-ins for any
real work; they are deleted, not edited, when real assets arrive.

`ffmpeg-static` is a devDependency used only by that script (`DECISIONS.md` D-15 records
the dependency rationale). It is not part of the application.

## Still to build

- Derivative generation for real assets (web + thumbnail + poster) with checksums recorded
- R2 upload and mirroring, with the archival copy separate from the served copy
- Scheduled re-verification of checksums, playback and gateway availability
