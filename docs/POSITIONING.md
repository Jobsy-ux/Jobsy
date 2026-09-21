# Positioning

**Canonical. Recorded 2026-09-21 at the owner's direction.** Where this document and the
master specification differ in tone or emphasis, this document governs the language and
the scale of the institution; the specification still governs everything else.

## What House of Nucci is

> House of Nucci is a highly curated personal collection of digital art, presented as an
> immersive digital museum experience.

A little under 200 works. Personal, deliberately focused, assembled by one collector with
a point of view.

## What it is not

It is **not** one of the world's largest digital art collections, a whale collection, an
encyclopedic survey, or a collection defined by trophy-level monumental 1/1 acquisitions.
Other collections are vastly larger and hold far more valuable work. The House never
exaggerates its scale, financial value, historical importance, rarity or cultural
authority.

## Where the strength actually comes from

Thoughtful personal curation · the collector's point of view · genuine enthusiasm for the
artists · the relationships between works · artist context · provenance · discovery ·
storytelling · excellent digital presentation · an exceptional visitor experience.

The experience can be world-class while the collection stays personal and modest in scale.
Those are different claims, and only the first one is ours to make.

## Language

**Never use, unless the claim is independently and genuinely supportable:**

- "one of the world's most important collections"
- "landmark collection"
- "museum-grade collection"
- "definitive collection"
- "historically significant collection"
- "major institutional holdings"

Also avoid, as a matter of register: implying breadth the collection does not have
("the story of digital art"), implying value ("blue-chip", "trophy", "grail"), and any
number presented as a boast. Counts may be stated plainly — "13 works · 5 artists" — as
facts, never as achievements.

**Do write** in the register of a person showing you their rooms: specific, enthusiastic
about the artists, honest about what is known and what is not.

## Consequences for the architecture

The museum is designed for roughly 200 works, not for an imagined collection ten times the
size. This is a positive design constraint, not a limitation to hide:

- **Meaningful rooms over monumental voids.** Every room earns its place by holding work
  that belongs together. A hall that reads as empty implies a collection that should have
  filled it.
- **Breathing room, not vastness.** Generous spacing around each work, strong sightlines,
  and rooms sized so a visitor is always near something worth looking at.
- **Monumental treatment is evidence-led.** A work gets a whole wall, a solo hang, or a
  room of its own only when the actual record supports it — never to suggest that the
  House owns trophies. The `solo` flag and large `display_width` values remain available;
  they are curatorial decisions about a specific work, not a house style.
- **No 1/1 gallery by default.** A dedicated 1/1 room exists only if the collection's
  actual unique works justify one (§11 already forbids finalising the architecture before
  the inventory is understood).
- **Exhibitions over expansion.** The way the House grows in interest is deliberate
  rehangs and new arguments about the same works, not more square metres.

## Consequences for the record

`why_in_the_house` is a first-class field on every artwork: the collector's own account,
in their own voice, of why a work or an artist entered the collection. It is optional,
selective, and clearly attributed to the collector — it is a point of view, not a claim of
importance. Where it exists, it is one of the most valuable things on the page, because
it is the one thing no marketplace can reproduce.
