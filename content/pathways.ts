import type { PathwayInput } from '@/domain';

/**
 * DEMO PATHWAYS. A Nucci Pathway is an intellectual route through the collection —
 * ordered works, an introduction, and a short piece of context at each stop (spec §32).
 * It is never a financial basket and never ranked by market data (§36).
 */
export const pathways: PathwayInput[] = [
  {
    id: 'pathway-demo-how-to-look',
    slug: 'how-to-look',
    title: 'How to Look at a Digital Work',
    subtitle: 'For a first visit',
    introduction:
      'Demo pathway. Digital work asks for the same attention as anything else on a wall: scale, surface, duration, and the decision behind it. This route moves through five placeholder records and points at what would be worth noticing in each — how big a work wants to be, what changes when an image moves, why a small raster should never be smoothed, and what it means for a work to exist as instructions rather than pixels. The works here are demo records; the questions are the real ones.',
    stops: [
      {
        artworkSlug: 'strata-cobalt',
        context:
          'Start with scale. This one is given an entire wall, which is a curatorial decision rather than a property of the file. Stand back, then walk in until the bands stop resolving as bands.',
      },
      {
        artworkSlug: 'grid-magenta',
        context:
          'Sixty-four pixels across. Nothing here is smoothed, at any size — interpolation would replace the artist\'s decisions with the renderer\'s. Get close enough that the grid is unambiguous.',
      },
      {
        artworkSlug: 'drift-verdigris',
        context:
          'A three-second loop. Duration is part of the work: it has a pace you can wait out, and the loop point is a compositional choice, not a technical artefact.',
      },
      {
        artworkSlug: 'interference-ember',
        context:
          'Moving image, held in a dark room on its own. The Black Box exists because a bright surface next to a moving one wins, and the moving work loses.',
      },
      {
        artworkSlug: 'vector-fields',
        context:
          'A vector work: the file describes instructions, not pixels, so it has no native size at all. What you are looking at is resolved fresh at whatever scale it is shown.',
      },
    ],
    routeRoomSlugs: ['the-great-room', 'the-black-box'],
    forNewVisitors: true,
    estimatedMinutes: 8,
    state: 'published',
  },
];
