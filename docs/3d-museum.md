# The museum

`src/museum/`. Next.js + React Three Fiber + Three.js, loaded only on `/museum` and only
in the browser.

## Model

Rooms are **authored data**, not procedural output (`content/rooms.ts`, later the `room`
table). A room is a volume, a material, a set of walls, the works hung on them, the
doorways, and an ordered set of guided stops. Geometry, navigation and lighting all derive
from that single record, so what you can see and where you can walk can never disagree.

Conventions: metres; floor plane XZ; +Y up; a room's origin is the centre of its floor; a
wall's hanging face is the left-hand normal of `start → end`; heading is radians about +Y
with 0 facing −Z, so `forward = (−sin h, 0, −cos h)`.

## Files

| File | Responsibility |
|---|---|
| `geometry.ts` | room shells with doorway gaps and lintels; resolving a placement into world geometry; viewing positions. Pure functions, no Three.js |
| `navigation.ts` | the navigation mesh (rooms inset by a wall margin plus doorway connectors), step resolution with wall-sliding, and the movement model |
| `frames.ts` | frame bodies and the offset that keeps a frame behind the work it holds |
| `media/media-director.ts` | the media state machine: dormant → poster → streaming → active |
| `media/useMediaDirector.ts` | runs it against the live camera and publishes per-panel |
| `scene/RoomShell.tsx` | floor, ceiling, walls, architectural light |
| `scene/ArtworkPanel.tsx` | the hung work, its frame, and its gallery light |
| `scene/useArtworkSurface.ts` | artwork → texture, with fidelity and disposal rules |
| `scene/video-upload-support.ts` | one-time probe: can this browser put a video frame on a wall? |
| `controls/Navigator.tsx` | one movement model driven by keyboard, touch or guided transport |
| `ui/` | HUD, in-place artwork record, non-WebGL fallback |

## Fidelity rules, and where they bite

- **Height is derived, never set.** `hangWork` computes height from the artwork's own
  aspect ratio. There is no parameter anywhere that accepts a display aspect (§14).
- **Artwork is unlit.** Wall panels use `MeshBasicMaterial` with `toneMapped: false`, so
  gallery lights fall on the wall and the frame but never on the work's pixels. What is on
  the wall is the file the artist made (§14, §66).
- **Pixel work uses nearest-neighbour filtering with no mipmaps**, at any distance (§14).
- **Frames sit behind the work.** A frame is a solid body larger than the artwork, so it
  is offset back by half its depth plus a clearance; centred, its own front face would hide
  the work. Regression-tested in `tests/museum.test.ts`.

## Media management

`computeMediaStates` assigns each hung work one state from distance, facing and the
device's budget:

| State | Meaning |
|---|---|
| `dormant` | beyond ~1.9× the stream distance. Nothing loaded, nothing in GPU memory |
| `poster` | approaching, or facing away. A still stands in |
| `streaming` | full media resident; video paused on its frame |
| `active` | playing. Only the nearest few, never more than the tier budget |

Recomputed five times a second, not every frame; panels subscribe individually, so walking
toward one video re-renders one panel. Leaving a room disposes its textures, elements and
canvases — verified in the browser: the Black Box's video element is gone from the document
once you are back in the Entry.

**Animated rasters** (GIF/APNG) are sampled from a live `<img>` into a canvas each frame,
which preserves the artist's timing and loop exactly. Re-encoding them to video would not.

**Video** uses `VideoTexture`. Source elements for both live in the document at 2px and 1%
opacity, because browsers stop producing frames for media they believe nobody can see.
Where a browser decodes video but cannot upload a frame to a texture — observed in
software GL — a one-time probe (`video-upload-support.ts`) renders the real texture into a
1×1 target through the real renderer, compares it with a 2D-canvas sample, and switches
that session to canvas sampling. A moving work is never shown as a frozen one.

**Audio** never starts by itself. The HUD's ENABLE ARTWORK AUDIO unmutes only works that
actually carry sound, through a registry of live elements (§17).

## Movement

One model, three drivers (`Navigator.tsx`):

- **Desktop** — WASD or arrows, drag to look, double-click for pointer lock, click the
  floor to walk there. No gaming familiarity assumed.
- **Touch** — drag to look, tap the floor to walk. Not a WASD pad drawn on glass.
- **Guided** — free movement off; the visitor is carried between authored stops with an
  eased transition, or cut instantly under `prefers-reduced-motion`.

Every step goes through `resolveStep`, which slides along a wall rather than stopping dead,
and a camera that ends up nowhere valid is walked back inside. Tested by holding the
forward key into a wall for 600 frames.

## Tiers

`lib/device-tier` probes WebGL, reduced motion, pointer type and device memory, then picks
FULL 3D, OPTIMIZED 3D, GUIDED 3D or ARCHIVE 2D — and the visitor can always override it
from the HUD. Budgets per tier cover pixel ratio, shadows, stream distance and concurrent
video (§58–59).

## Known gaps

- Real-device performance (frame rate, thermals, memory) is unmeasured; the headless
  software renderer here says nothing useful about a phone. See the checklist.
- Room-to-room streaming currently keeps the current room and its neighbours resident.
  That is right for three rooms and will need a budget when the programme grows.
