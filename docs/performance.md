# Performance

Performance is a design requirement here, not a phase (§58–61).

## Budgets

| Metric | Budget | Why |
|---|---|---|
| Initial JS on `/` and `/collection` | ≤ 120 KB gzip | Three.js must never reach a text page |
| LCP, `/artwork/[slug]`, 4G mobile | ≤ 2.0 s | the work is the page |
| Time to first interactive room, desktop | ≤ 3.0 s | no game loading screen (§61) |
| Sustained FPS, FULL 3D, desktop | 60 | |
| Sustained FPS, OPTIMIZED 3D, iPhone | ≥ 30 with no thermal collapse | controlled degradation beats stutter |
| Concurrent decoding videos | 2 desktop / 1 mobile | browser decode limits, iOS strictest |
| Museum texture memory | ≤ 512 MB desktop / ≤ 192 MB mobile | |
| Archive grid, 200 works | interaction < 100 ms | search and filters run locally |

## How they are held

- **Route splitting.** `/museum` dynamically imports the 3D bundle with `ssr: false`. No
  other route carries Three.js.
- **Per-room assets.** Only the current room and the rooms it opens onto are built.
  Leaving disposes textures, video elements and canvases.
- **Distance-gated media.** The four media states cap what is resident and what decodes.
- **Tier budgets.** Pixel ratio, shadows, stream distance and video concurrency come from
  `TIER_BUDGETS`, chosen by capability probe with a manual override.
- **Artwork delivery.** Intrinsic dimensions are always declared so nothing reflows; the
  `web` derivative carries the bytes while canonical stays archival.
- **Analytics.** A no-op until a provider is configured; never blocks a visit.

## Measured so far

In a headless software renderer (this build environment): pages build and render, the
museum reaches interactive, media states transition correctly, and leaving a room releases
its media. Frame rate here is ~4 fps and says nothing about real hardware — software GL
is not a performance signal.

## Not yet measured

Everything that needs a real device: frame rate, thermals, GPU memory, battery, iOS Safari
video behaviour, Core Web Vitals in the field. This is the top of the Phase 9 list and a
gate before launch (§62, §86).

## Enforcement plan

1. Bundle-size check in CI on `/` and `/collection`
2. Lighthouse budgets on the artwork and collection routes
3. A frame-time watchdog in the museum that steps down a tier rather than stuttering
4. A real-device matrix — iPhone (two generations), an Android mid-range, Safari, Chrome,
   Firefox, Edge — run before any production launch
