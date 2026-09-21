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
 * The room programme here is deliberately small — an arrival, one fully designed wing,
 * and a black box — because §11 forbids finalising the architecture before the real
 * inventory is understood (DECISIONS.md O-8).
 */
export const rooms: RoomInput[] = [
  {
    id: 'room-the-entry',
    slug: 'the-entry',
    name: 'The Entry',
    subtitle: 'Arrival',
    material: 'dark-concrete',
    size: [18, 9, 14],
    origin: [0, 0, 0],
    entryPosition: [0, 1.65, 5],
    entryHeading: 0,
    ambientIntensity: 0.42,
    walls: [
      {
        id: 'wall-entry-west',
        label: 'West',
        start: [-9, -6],
        end: [-9, 6],
        height: 9,
        placements: [
          {
            id: 'pl-entry-west-1',
            artworkSlug: 'strata-ember',
            offset: 6,
            centreHeight: 2.1,
            displayWidth: 3.4,
            frame: 'frameless-digital',
            lighting: 'wall-wash',
            solo: true,
          },
        ],
      },
      {
        id: 'wall-entry-east',
        label: 'East',
        start: [9, 6],
        end: [9, -6],
        height: 9,
        placements: [
          {
            id: 'pl-entry-east-1',
            artworkSlug: 'blocks-bone',
            offset: 6,
            centreHeight: 1.9,
            displayWidth: 2.6,
            frame: 'thin-black',
            lighting: 'gallery-spot',
          },
        ],
      },
    ],
    connections: [{ toRoomSlug: 'the-great-room', position: [0, 0, -7], width: 4.2, height: 5.2 }],
    guidedStops: [
      { artworkSlug: 'strata-ember', position: [-4.6, 1.65, 0], heading: 1.5707963 },
      { artworkSlug: 'blocks-bone', position: [4.6, 1.65, 0], heading: -1.5707963 },
    ],
  },

  {
    id: 'room-the-great-room',
    slug: 'the-great-room',
    name: 'The Great Room',
    subtitle: 'The long sightline',
    material: 'warm-limestone',
    size: [26, 11, 30],
    origin: [0, 0, -22],
    entryPosition: [0, 1.65, -10],
    entryHeading: 0,
    ambientIntensity: 0.5,
    walls: [
      {
        id: 'wall-great-west',
        label: 'West',
        start: [-13, -36],
        end: [-13, -8],
        height: 11,
        placements: [
          {
            id: 'pl-great-west-1',
            artworkSlug: 'strata-cobalt',
            offset: 8,
            centreHeight: 3.1,
            displayWidth: 9,
            frame: 'frameless-digital',
            lighting: 'wall-wash',
            solo: true,
          },
          {
            id: 'pl-great-west-2',
            artworkSlug: 'interference-verdigris',
            offset: 16,
            centreHeight: 1.75,
            displayWidth: 2.2,
            frame: 'museum-white',
            lighting: 'gallery-spot',
          },
          {
            id: 'pl-great-west-3',
            artworkSlug: 'drift-magenta',
            offset: 21,
            centreHeight: 1.75,
            displayWidth: 2,
            frame: 'thin-black',
            lighting: 'gallery-spot',
          },
        ],
      },
      {
        id: 'wall-great-east',
        label: 'East',
        start: [13, -8],
        end: [13, -36],
        height: 11,
        placements: [
          {
            id: 'pl-great-east-1',
            artworkSlug: 'interference-cobalt',
            offset: 6,
            centreHeight: 2.3,
            displayWidth: 6,
            frame: 'frameless-digital',
            lighting: 'wall-wash',
          },
          {
            id: 'pl-great-east-2',
            artworkSlug: 'grid-magenta',
            offset: 19,
            centreHeight: 1.6,
            displayWidth: 1.1,
            frame: 'aluminum',
            lighting: 'gallery-spot',
          },
          {
            id: 'pl-great-east-3',
            artworkSlug: 'grid-cobalt',
            offset: 22,
            centreHeight: 1.6,
            displayWidth: 1.1,
            frame: 'aluminum',
            lighting: 'gallery-spot',
          },
        ],
      },
      {
        id: 'wall-great-north',
        label: 'North',
        start: [12, -37],
        end: [-12, -37],
        height: 11,
        placements: [
          {
            id: 'pl-great-north-1',
            artworkSlug: 'strata-bone',
            offset: 7,
            centreHeight: 1.95,
            displayWidth: 2.8,
            frame: 'floating',
            lighting: 'wall-wash',
          },
          {
            id: 'pl-great-north-2',
            artworkSlug: 'interference-magenta',
            offset: 12,
            centreHeight: 1.8,
            displayWidth: 1.6,
            frame: 'museum-white',
            lighting: 'gallery-spot',
          },
          {
            id: 'pl-great-north-3',
            artworkSlug: 'vector-fields',
            offset: 17,
            centreHeight: 1.85,
            displayWidth: 1.9,
            frame: 'thin-black',
            lighting: 'gallery-spot',
          },
        ],
      },
    ],
    connections: [
      { toRoomSlug: 'the-entry', position: [0, 0, -7], width: 4.2, height: 5.2 },
      { toRoomSlug: 'the-black-box', position: [13, 0, -22], width: 3.2, height: 4.4 },
    ],
    guidedStops: [
      { artworkSlug: 'strata-cobalt', position: [-6.5, 1.65, -28], heading: 1.5707963 },
      { artworkSlug: 'interference-cobalt', position: [8.5, 1.65, -14], heading: -1.5707963 },
      { artworkSlug: 'strata-bone', position: [5, 1.65, -33.5], heading: 0 },
      { artworkSlug: 'interference-magenta', position: [0, 1.65, -34], heading: 0 },
      { artworkSlug: 'vector-fields', position: [-5, 1.65, -33.5], heading: 0 },
      { artworkSlug: 'interference-verdigris', position: [-9.5, 1.65, -20], heading: 1.5707963 },
    ],
  },

  {
    id: 'room-the-black-box',
    slug: 'the-black-box',
    name: 'The Black Box',
    subtitle: 'Moving image',
    material: 'black-box',
    size: [16, 7, 14],
    origin: [21, 0, -22],
    entryPosition: [16, 1.65, -22],
    entryHeading: -1.5707963,
    ambientIntensity: 0.1,
    walls: [
      {
        id: 'wall-black-east',
        label: 'East',
        start: [29, -16],
        end: [29, -28],
        height: 7,
        placements: [
          {
            id: 'pl-black-east-1',
            artworkSlug: 'interference-ember',
            offset: 6,
            centreHeight: 2.4,
            displayWidth: 7,
            frame: 'screen',
            lighting: 'screen-emissive',
            solo: true,
          },
        ],
      },
      {
        id: 'wall-black-north',
        label: 'North',
        start: [28, -29],
        end: [14, -29],
        height: 7,
        placements: [
          {
            id: 'pl-black-north-1',
            artworkSlug: 'drift-verdigris',
            offset: 7,
            centreHeight: 1.8,
            displayWidth: 2.4,
            frame: 'frameless-digital',
            lighting: 'black-box',
          },
        ],
      },
    ],
    connections: [{ toRoomSlug: 'the-great-room', position: [13, 0, -22], width: 3.2, height: 4.4 }],
    guidedStops: [
      { artworkSlug: 'interference-ember', position: [23, 1.65, -22], heading: -1.5707963 },
      { artworkSlug: 'drift-verdigris', position: [21, 1.65, -25.5], heading: 0 },
    ],
  },
];
