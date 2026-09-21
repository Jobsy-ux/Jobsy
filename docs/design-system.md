# Design system

The institution's visual language. Tokens live in `src/styles/tokens.css`; primitives in
`src/styles/globals.css`. Tailwind compiles utilities in this project — it never supplies
the look (§95–96).

## Principle

The artwork supplies the colour. Everything the interface owns is dark, quiet and drawn
with lines rather than shadows, so a bright digital work detonates against it (§05).
When there is artwork on the screen, the interface should be hard to notice.

## Colour

| Token | Value | Use |
|---|---|---|
| `--hon-void` | `#08080a` | the black beyond the building; artwork surfaces |
| `--hon-concrete` | `#0d0e10` | page ground |
| `--hon-graphite` | `#141517` | raised surface, hover ground |
| `--hon-stone` | `#1b1c1f` | panels |
| `--hon-limestone` | `#23231f` | warm stone, used sparingly |
| `--hon-bone` | `#ece7dd` | museum white, warm — primary type |
| `--hon-bone-dim` | `#b6b0a6` | secondary type |
| `--hon-quiet` | `#85817a` | metadata, captions |
| `--hon-faint` | `#5d5a55` | rules, disabled |
| `--hon-brass` | `#b58455` | the single accent: focus, outbound |
| `--hon-demo` | `#6d6a92` | demo-record marker — never decorative |

Edges (`--hon-edge`, `--hon-edge-strong`, `--hon-edge-faint`) are warm white at low
opacity. There is no light theme: a work lit for a dark room and then shown on white is a
different work.

## Type

**Instrument Serif** for the institution's voice — wordmark, headings, titles, the
occasional large statement. **Archivo** for everything the interface says about itself —
labels, metadata, navigation, prose. Two families; see `DECISIONS.md` O-6 on licensing a
distinctive display face before the identity is locked.

| Class | Role |
|---|---|
| `.hon-monument` | the homepage wordmark only |
| `.hon-display` | page titles |
| `.hon-title` | work titles, section heads |
| `.hon-label` | the wall label: 11px, uppercase, `0.16em` tracking — the most repeated element in the building |
| `.hon-eyebrow` | section context above a title |
| `.hon-prose` | reading text, `1.62` leading, max `34rem` |

Never set type on top of artwork. Labels sit beside or beneath a work, never over it.

## Space and layout

A 4px base, `--hon-space-1` … `--hon-space-11`. The page gutter is fluid
(`clamp(1.25rem, 4vw, 4rem)`), the reading measure is `34rem`, the shell caps at `90rem`.
Archive grids use `repeat(auto-fill, minmax(min(16rem, 100%), 1fr))` so a plate is never
narrower than its label needs.

## Components

- **`.hon-door`** — the institutional entry control: square, outlined, uppercase label,
  a mark that advances on hover. Used for the two homepage doors and nowhere casually.
- **`.hon-action`** — a quiet action: uppercase label over a hairline rule. Pressed state
  is brass.
- **`.hon-rule`** — a 1px line. The interface is drawn with these, not with cards.
- **`.hon-demo-marker`** — the demo-record chip. Visible wherever a placeholder appears.
- **Artwork plates** — image, then title, then artist and year. No border, no radius, no
  hover lift, no price. It should read as a catalogue page, not a product grid.

## Motion

Architectural: `--hon-ease` for interface, `--hon-ease-architectural` for camera moves.
Durations 180ms / 420ms / 900ms. Nothing springs, nothing bounces, nothing celebrates.
Under `prefers-reduced-motion` all three collapse to ~0 and camera transitions become
cuts (§64, §97).

## In the museum

The HUD carries only: where you are, how to move, a way out, the audio gate, and the tier
control. It never overlaps a wall where work hangs. Frames, lighting and scale are
curatorial metadata (`FRAME_BODIES`, lighting profiles, `display_width`), not CSS —
see `3d-museum.md`.

## What this system refuses

Card dashboards · rounded SaaS surfaces · gradient blobs · pill buttons · template navbars
· marketplace cards · price chips · popularity counts · anything that would look at home
in a crypto product (§96).
