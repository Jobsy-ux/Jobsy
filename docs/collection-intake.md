# Collection intake — the first real slice

**Next major milestone (owner, 2026-09-21):** replace the demo records with **12–20 real
works**. Not the full collection. The placeholder infrastructure stays exactly as it is
until the real assets and metadata arrive.

`collection-import.md` describes the pipeline. This describes what to send, and what
happens when it lands.

## Choosing the 12–20

The slice should stretch the build rather than flatter it. Aim to cover:

- several artists, and at least two works by one of them, so series and artist passports
  have something to hold
- at least one work that moves — a loop, a video, or generative work
- at least one pixel work, so nearest-neighbour rendering is proven on real pixels
- a range of proportions: something wide, something tall, something square
- one work you would give a whole wall, and one that rewards standing close
- at least one work with a real external listing, so the handoff is real
- ideally one work with awkward provenance — a gap, an uncertain date — because the
  honest cases are the ones worth designing for

Whether a work is a 1/1 or an edition matters far less than whether the set is varied.

## What to send

### 1. Media

A folder, one work per file, named so the filename says which work it is. Send the best
file you have — the original, not a marketplace download.

- **Stills:** PNG, JPEG, WEBP or TIFF, at the original resolution
- **Animated:** the original GIF/APNG, not a re-encode
- **Video:** MP4 and/or WEBM, and a poster frame named `<work>--poster.png`
- **Vector / on-chain SVG:** the SVG itself
- **Audio:** the original file, with the work it belongs to

Then run:

```bash
npm run prepare:media -- ~/path/to/media --out intake.csv
```

It records true dimensions, duration, audio and a SHA-256 for every file, and flags what
needs a decision — anything above the 2048px public display cap, anything whose dimensions
cannot be read, time-based work with no poster. It reads; it changes nothing.

### 2. Metadata, per work

Start from `templates/artwork-manifest.csv`, or from the `intake.csv` the inspector wrote.
The fields that genuinely need you:

| Field | Note |
|---|---|
| `title`, `artist_name`, `year` | As the artist gives them, not as a marketplace renders them |
| `medium` | In art-world language — "single-channel video, 4 min, silent", not "MP4" |
| `artwork_type`, `edition_label` | 1/1, or the edition as stated |
| `chain`, `contract_address`, `token_id` | Where one exists. A work with no token is fine |
| `opensea_url` / `raster_url` / other | Links to *this* work; artist links go in `artist_url` |
| `acquisition_date`, `acquisition_source` | Kept private unless you say otherwise |
| `why_in_the_house` | Optional, selective, your voice. Skip it rather than force it |

**Provenance has no column on purpose.** Send what you know per work — created, minted,
previous holders, when it came to the House — with a note on how certain each part is.
Every event is recorded with its certainty, and gaps are left as gaps.

### 3. Rights, per work

The posture is conservative and stays that way (`rights.md`). Per work, the questions are:

1. Has the artist (or rights holder) said anything about showing the work? If so, what,
   when, and where is that recorded?
2. Is there a licence attached to the work? If so, where does it live?
3. May the House show it at full resolution, or only as a viewing copy?

"I own it" is not an answer to any of these — it is a different fact. If nothing has been
established, say so: the record starts at `not-established`, the work is served as a
viewing copy capped at 2048px, and it still looks excellent.

### 4. Artist material (optional, high value)

Anything the artist has given you or published themselves: a statement, process notes,
their site, verified socials, an interview. Each becomes a sourced field on their passport.
Nothing goes in unsourced.

## What happens then

1. `npm run prepare:media` → dimensions, checksums, decisions flagged
2. Derivatives produced: a viewing copy, a thumbnail, a poster for time-based work
3. `npm run import:manifest -- intake.csv` → staged in `content/imported/<timestamp>/`
4. Records reviewed, provenance and rights entered by hand, then merged into `content/`
5. Placeholder records **deleted** — not edited into real ones, so no invented value can
   survive into a real record
6. Works placed: room, wall, scale, frame, lighting. This is a curatorial pass, not an
   import step, and it is where the slice earns its 12–20
7. `npm run validate:collection` → integrity, fidelity, ownership, rights
8. `COLLECTION_MODE=production npm run validate:collection` → passes only once no
   placeholder remains

Step 5 is deliberate: placeholders are removed wholesale, so there is no path by which a
demo value quietly becomes part of a real record.

## Until then

Nothing changes. The demo records, their generated media and every marker stay in place —
they are what makes the build reviewable. The production build still refuses to ship them.
