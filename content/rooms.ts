import type { RoomInput } from '@/domain';

/**
 * The museum, authored as data (spec §11, §12, §49).
 *
 * Coordinates are metres. The floor plane is XZ, +Y is up. A room's `origin` is the
 * centre of its floor, so a room of size [w, h, d] at origin [ox, oy, oz] spans
 * x ∈ [ox − w/2, ox + w/2] and z ∈ [oz − d/2, oz + d/2].
 *
 * A wall is a segment on the floor plane. Its hanging face is the left-hand normal of
 * `start → end`: for direction d = (dx, dz), the normal is (dz, −dx). Walls are authored
 * so that normal points into the room. `offset` on a placement is metres along the wall
 * from `start`.
 *
 * Heading is radians about +Y, where 0 faces −Z: forward = (−sin h, 0, −cos h).
 *
 * SCALE (docs/POSITIONING.md). These rooms are sized for a personal collection of a
 * little under 200 works, not for an imagined collection ten times larger. The Great Room
 * is 20 × 24 m with nine works — enough for a long sightline and real breathing room
 * around each piece, small enough that a visitor is always near something worth looking
 * at. A hall that reads as empty would imply a collection that should have filled it.
 * Ceilings are generous rather than cathedral-scale, and a work is given a whole wall
 * because of what it is, never to suggest the House owns trophies.
 *
 * The programme stays deliberately small — an arrival, one designed wing and a black box
 * — because §11 forbids finalising the architecture before the real inventory is
 * understood (DECISIONS.md O-8).
 */
export const rooms: RoomInput[] = [
  {
    id: 'room-the-entry',
    slug: 'the-entry',
    name: 'The Entry',
    subtitle: 'Arrival',
    material: 'dark-concrete',
    size: [16, 8, 12],
    origin: [0, 0, 0],
    entryPosition: [0, 1.65, 4.2],
    entryHeading: 0,
    ambientIntensity: 0.42,
    walls: [
      {
        id: 'wall-entry-west',
        label: 'West',
        start: [-8, -5],
        end: [-8, 5],
        height: 8,
        placements: [
          {
            id: 'pl-entry-west-1',
            artworkSlug: 'strata-ember',
            offset: 5,
            centreHeight: 1.9,
            displayWidth: 2.8,
            frame: 'frameless-digital',
            lighting: 'wall-wash',
            solo: true,
          },
        ],
      },
      {
        id: 'wall-entry-east',
        label: 'East',
        start: [8, 5],
        end: [8, -5],
        height: 8,
        placements: [
          {
            id: 'pl-entry-east-1',
            artworkSlug: 'blocks-bone',
            offset: 5,
            centreHeight: 1.85,
            displayWidth: 2.2,
            frame: 'thin-black',
            lighting: 'gallery-spot',
          },
        ],
      },
    ],
    connections: [{ toRoomSlug: 'the-great-room', position: [0, 0, -6], width: 3.6, height: 4.4 }],
    guidedStops: [
      { artworkSlug: 'strata-ember', position: [-4.5, 1.65, 0], heading: 1.5707963 },
      { artworkSlug: 'blocks-bone', position: [4.5, 1.65, 0], heading: -1.5707963 },
    ],
  },

  {
    id: 'room-the-great-room',
    slug: 'the-great-room',
    name: 'The Great Room',
    subtitle: 'The long sightline',
    material: 'warm-limestone',
    size: [20, 8.5, 24],
    origin: [0, 0, -18],
    entryPosition: [0, 1.65, -9],
    entryHeading: 0,
    ambientIntensity: 0.5,
    walls: [
      {
        id: 'wall-great-west',
        label: 'West',
        start: [-10, -29],
        end: [-10, -7],
        height: 8.5,
        placements: [
          {
            /* A whole wall, because the work is 64:27 and needs the run — not because a
               wide work implies a significant collection (docs/POSITIONING.md). */
            id: 'pl-great-west-1',
            artworkSlug: 'strata-cobalt',
            offset: 6,
            centreHeight: 2.6,
            displayWidth: 7,
            frame: 'frameless-digital',
            lighting: 'wall-wash',
            solo: true,
          },
          {
            id: 'pl-great-west-2',
            artworkSlug: 'interference-verdigris',
            offset: 13,
            centreHeight: 1.75,
            displayWidth: 2,
            frame: 'museum-white',
            lighting: 'gallery-spot',
          },
          {
            id: 'pl-great-west-3',
            artworkSlug: 'drift-magenta',
            offset: 17.5,
            centreHeight: 1.75,
            displayWidth: 1.8,
            frame: 'thin-black',
            lighting: 'gallery-spot',
          },
        ],
      },
      {
        id: 'wall-great-east',
        label: 'East',
        start: [10, -7],
        end: [10, -29],
        height: 8.5,
        placements: [
          {
            id: 'pl-great-east-1',
            artworkSlug: 'interference-cobalt',
            offset: 4.5,
            centreHeight: 2.1,
            displayWidth: 5,
            frame: 'frameless-digital',
            lighting: 'wall-wash',
          },
          {
            /* Two small rasters hung close together and low: they reward standing near,
               which is the point of a room you can cross (§12). */
            id: 'pl-great-east-2',
            artworkSlug: 'grid-magenta',
            offset: 15,
            centreHeight: 1.55,
            displayWidth: 1,
            frame: 'aluminum',
            lighting: 'gallery-spot',
          },
          {
            id: 'pl-great-east-3',
            artworkSlug: 'grid-cobalt',
            offset: 17.5,
            centreHeight: 1.55,
            displayWidth: 1,
            frame: 'aluminum',
            lighting: 'gallery-spot',
          },
        ],
      },
      {
        id: 'wall-great-north',
        label: 'North',
        start: [10, -30],
        end: [-10, -30],
        height: 8.5,
        placements: [
          {
            id: 'pl-great-north-1',
            artworkSlug: 'strata-bone',
            offset: 5.5,
            centreHeight: 1.9,
            displayWidth: 2.4,
            frame: 'floating',
            lighting: 'wall-wash',
          },
          {
            id: 'pl-great-north-2',
            artworkSlug: 'interference-magenta',
            offset: 10,
            centreHeight: 1.8,
            displayWidth: 1.5,
            frame: 'museum-white',
            lighting: 'gallery-spot',
          },
          {
            id: 'pl-great-north-3',
            artworkSlug: 'vector-fields',
            offset: 14.5,
            centreHeight: 1.85,
            displayWidth: 1.8,
            frame: 'thin-black',
            lighting: 'gallery-spot',
          },
        ],
      },
    ],
    connections: [
      { toRoomSlug: 'the-entry', position: [0, 0, -6], width: 3.6, height: 4.4 },
      { toRoomSlug: 'the-black-box', position: [10, 0, -18], width: 3, height: 4 },
    ],
    guidedStops: [
      { artworkSlug: 'strata-cobalt', position: [-4.5, 1.65, -23], heading: 1.5707963 },
      { artworkSlug: 'interference-cobalt', position: [6, 1.65, -11.5], heading: -1.5707963 },
      { artworkSlug: 'strata-bone', position: [4.5, 1.65, -26.5], heading: 0 },
      { artworkSlug: 'interference-magenta', position: [0, 1.65, -27], heading: 0 },
      { artworkSlug: 'vector-fields', position: [-4.5, 1.65, -26.5], heading: 0 },
      { artworkSlug: 'interference-verdigris', position: [-7, 1.65, -16], heading: 1.5707963 },
      { artworkSlug: 'drift-magenta', position: [-7, 1.65, -11.5], heading: 1.5707963 },
      { artworkSlug: 'grid-magenta', position: [7, 1.65, -22], heading: -1.5707963 },
      { artworkSlug: 'grid-cobalt', position: [7, 1.65, -24.5], heading: -1.5707963 },
    ],
  },

  {
    id: 'room-the-black-box',
    slug: 'the-black-box',
    name: 'The Black Box',
    subtitle: 'Moving image',
    material: 'black-box',
    size: [14, 6, 12],
    origin: [17, 0, -18],
    entryPosition: [12, 1.65, -18],
    entryHeading: -1.5707963,
    ambientIntensity: 0.1,
    walls: [
      {
        id: 'wall-black-east',
        label: 'East',
        start: [24, -13],
        end: [24, -23],
        height: 6,
        placements: [
          {
            id: 'pl-black-east-1',
            artworkSlug: 'interference-ember',
            offset: 5,
            centreHeight: 2.2,
            displayWidth: 5.5,
            frame: 'screen',
            lighting: 'screen-emissive',
            solo: true,
          },
        ],
      },
      {
        id: 'wall-black-north',
        label: 'North',
        start: [23, -24],
        end: [11, -24],
        height: 6,
        placements: [
          {
            id: 'pl-black-north-1',
            artworkSlug: 'drift-verdigris',
            offset: 6,
            centreHeight: 1.75,
            displayWidth: 2,
            frame: 'frameless-digital',
            lighting: 'black-box',
          },
        ],
      },
    ],
    connections: [{ toRoomSlug: 'the-great-room', position: [10, 0, -18], width: 3, height: 4 }],
    guidedStops: [
      { artworkSlug: 'interference-ember', position: [18, 1.65, -18], heading: -1.5707963 },
      { artworkSlug: 'drift-verdigris', position: [17, 1.65, -21], heading: 0 },
    ],
  },
];
