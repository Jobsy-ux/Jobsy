# DECISIONS

Two lists: decisions taken without asking (with the reasoning, so they can be reversed
knowingly), and decisions that materially affect identity, fidelity, ownership
representation, legal rights or architecture — which per §103 are flagged, not guessed.

---

## Decisions taken

**D-1 — Next.js 16 / React 19 / TypeScript strict.** Owner-preferred stack; App Router
gives server-rendered indexable pages (§55–56) and route-level splitting that keeps
Three.js out of text pages.

**D-2 — Tailwind v4 as a compiler, never as a look.** All values resolve to House of
Nucci tokens in `src/styles/tokens.css`. No component library, no shadcn, no default
radius/shadow/palette. Prevents the §96 template feel while keeping authoring fast.

**D-3 — File-backed repository now, PostgreSQL schema authored now.** Normalized
per-entity records behind a `CollectionRepository` interface, with
`supabase/migrations/0001_init.sql` written in the same phase so the two cannot drift.
Swapping in Supabase is one implementation of an existing interface. Satisfies §80
(normalized, not one JSON blob) without standing up infrastructure before the UX is
validated (§93).

**D-4 — Parametric museum architecture for the slice.** The building is assembled from
typed architectural primitives rather than one authored GLB, so the slice can look
deliberately designed with no external asset pipeline, and any room can later be replaced
by an authored GLB without touching placement data.

**D-5 — Renderer registry keyed by media type.** `still`, `animated`, `video`, `svg`,
`placeholder` implemented; `generative`, `html`, `shader`, `interactive`, `3d` have
registry slots and a documented contract (§15). No component assumes "artwork = image
URL".

**D-6 — Four experience tiers with capability probe and manual override** (§59).
Default on mobile is OPTIMIZED; GUIDED and 2D are first-class, not apologies.

**D-7 — Placeholder-record policy.** `isPlaceholder` is a required schema field; demo
records use obviously non-real artist names, carry visible DEMO markers, are excluded
from sitemap and social cards, and fail the build in production mode. Chosen over
"plausible-looking sample data" because §104 forbids fabricated metadata and plausible
fakes are exactly what later gets mistaken for real.

**D-8 — No real artist named in demo data.** The brief mentions Alpha Centauri Kid /
Argonauts as being in the collection, but supplies no verified records. Creating records
under a real artist's name with invented metadata would violate §104 twice (fabricated
metadata, fabricated ownership). Real names enter only with real data.

**D-9 — My House is `localStorage`-only.** No account, no wallet, no email (§34, §71).
Export/import of a saved set is a later convenience, not a login.

**D-10 — Artwork media bypasses scene tone mapping and lossy texture compression.**
Fidelity (§14) outranks GPU savings. Compression is allowed for architecture, never for
artwork.

**D-11 — Aspect ratio is derived, never set.** Geometry is computed from the artwork's
intrinsic dimensions; there is no API surface that accepts a display aspect ratio. Makes
the §14 violation unreachable rather than merely discouraged.

**D-12 — Provenance certainty is a required field on every event.** An event is
`documented`, `reported`, or `inferred`, and the UI labels anything not `documented`.
Unknown history renders as absence (§28).

**D-13 — Rights default to not-established.** The media pipeline refuses to publish a
high-resolution derivative unless a rights record explicitly permits re-hosting (§30).

**D-14 — External links open in a new tab, are scheme-checked at render, and are
semantically separated from owned works** (§06, §23, §26). A shared `<ExternalLink>`
primitive is the only way to emit an outbound link, so the ownership boundary cannot be
blurred by a one-off `<a>`.

**D-15 — `legacy-peer-deps=true` in `.npmrc`.** `@react-three/fiber` declares optional
Expo peers that npm otherwise tries to resolve into the tree. Documented here rather than
left as folklore (§104: no undocumented dependency decisions).

---

## Owner input required

These change identity, fidelity, ownership representation, legal rights or architecture.
Work continues around them; none of them block the vertical slice.

**O-1 — Repository and project naming.** This code lives in a repository named `Jobsy`.
The package is `house-of-nucci`. Confirm whether House of Nucci should move to its own
repository, and confirm the production domain.

**O-2 — The actual collection export.** Needed to replace every demo record: a manifest
(CSV/JSON in the §44 field shape), the wallet addresses that hold the works, and the
owner-supplied original media where it exists. Until this arrives, the museum is
architecturally complete and culturally empty.

**O-3 — Which wallets are in scope, and which works in them are in the collection.**
Per §43 the wallet is not the collection. A per-work include/exclude decision is the
owner's, not the software's.

**O-4 — Artist permission posture.** Does the House intend to contact represented artists
for statements, process material and verified links (§25), and may the House re-host
high-resolution media? Rights records stay "not established" until answered, which limits
derivative quality.

**O-5 — Acquisition disclosure policy.** §51 separates creation from acquisition date.
Some collectors publish acquisition dates and sources; some consider them private. Public
by default, or private by default?

**O-6 — Typeface licensing.** The design system currently uses a variable-serif /
neutral-sans pairing from open licences so nothing is blocked. An institution of this
positioning would usually license a distinctive display face. Budget and preference
needed before the identity is locked.

**O-7 — May demo records exist on a public staging URL?** They are unambiguously marked,
but a public staging deploy puts placeholder works under the House of Nucci name. Current
default: staging is `noindex` and demo records are blocked from production builds.

**O-8 — Museum room programme.** §11 says architecture must not be finalized before the
inventory is understood. The slice ships one designed wing plus an entry. The full room
programme is a curatorial decision to take together once O-2 lands.

---

## Decisions taken during the vertical slice

**D-16 — Artwork bypasses `next/image`.** The optimizer re-encodes and may resample, and a
recompressed artwork is an altered artwork (§14). Artwork is served as-is with intrinsic
dimensions declared, and AVIF is excluded from the configured formats because its chroma
handling can shift colour. Non-artwork imagery may use the optimizer freely.

**D-17 — A frame body sits behind the work it holds.** A frame is modelled as a solid body
larger than the artwork, so centring it on the work hides the work behind the frame's own
front face — which is exactly what happened to every framed work until it was caught in a
browser. `frameBodyOffset` is now the single place that distance is decided, and a test
asserts that the front face of every frame style lands behind the artwork surface.

**D-18 — Video playback is verified, not assumed.** Some browsers decode video perfectly
but never get a frame into a texture, leaving a moving work as a black rectangle. The
museum renders the real texture through the real renderer into a 1×1 target once per
session and compares it with a 2D-canvas sample; if the upload is dead, that session
samples video through a canvas instead. Source elements for video and animated rasters are
kept in the document at 2px and 1% opacity, because browsers stop producing frames for
media they believe nobody can see.

**D-19 — Two heavyweight devDependencies, both outside the application.**
`ffmpeg-static` generates the abstract demo media (`npm run generate:placeholders`) and is
deleted from the pipeline along with the placeholders. `playwright` drives
`npm run smoke`, the browser check that covers the surfaces unit tests cannot — the
canvas, walking, the record overlay and the non-WebGL fallback (§84, §86). Neither ships.

**D-20 — Museum lighting is physical.** Three's lights fall off with the square of
distance, so a room this size needs intensities in the hundreds; lamps are spaced along a
room's long axis rather than hung as one bulb in the middle. Artwork is rendered unlit and
outside tone mapping, so gallery light falls on the wall and the frame and never on the
work's pixels (§14, §66).

---

## Decisions taken after the domain and positioning updates

**D-21 — houseofnucci.art is canonical, in exactly one place.** `src/lib/site.ts` holds
the origin, the site name, the description and every route spelling; canonical tags, the
sitemap, robots, OpenGraph and social cards all resolve through it. Three copies of
`process.env.NEXT_PUBLIC_SITE_URL ?? '…'` became one, so the domain cannot drift out of
step with itself. `NEXT_PUBLIC_SITE_URL` still overrides for local and preview builds, and
a malformed override falls back to the canonical origin rather than emitting broken
canonical tags on every page. **No DNS, registrar or CDN configuration has been done**, per
the owner's instruction (see O-1, now partly answered: the domain is settled, the
repository question is not).

**D-22 — The architecture is sized for the collection that exists.** The room programme
was rescaled: the Great Room from 26 × 11 × 30 m to 20 × 8.5 × 24 m, the Entry from
18 × 9 × 14 to 16 × 8 × 12, the Black Box from 16 × 7 × 14 to 14 × 6 × 12, and the widest
hang from 9 m to 7 m. Nothing was re-architected — the rooms, walls, placements and guided
stops are the same records with different numbers, and the validator and tests caught the
knock-on effects. The result is a room where nine works read together with light around
each, rather than a hall whose emptiness would imply a collection that should have filled
it (`POSITIONING.md`).

**D-23 — `why_in_the_house` is a first-class field, not another note.** Added to `artwork`
and `artist` in the schema and in migration `0002`, surfaced on the artwork page, the
artist passport and the in-museum record, always attributed to the collector by name and
set apart with a brass rule. It is distinct from `curatorial_note`, which is the
institution's voice; this is the collector's. It is optional and usually absent — the
importer carries it verbatim or leaves it empty, and nothing generates or infers it (§104).

**D-24 — Artwork social cards are composed, not cropped.** `/artwork/[slug]/opengraph-image`
renders the work whole on a dark ground with its title, artist and the collection's name.
Handing a platform a bare image invites it to crop the work to its own aspect ratio;
composing the card is what keeps the work intact (§14, §57). Cards are built at build
time, so local media is read from disk and inlined.
