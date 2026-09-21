import type { ExhibitionInput } from '@/domain';

/**
 * DEMO EXHIBITION. An exhibition is a curatorial argument with its own statement and
 * order, not a saved filter (spec §50). This one exists to prove the entity and the
 * page; its statement describes the demo build honestly rather than pretending to
 * curatorial claims about works the House does not hold.
 */
export const exhibitions: ExhibitionInput[] = [
  {
    id: 'exhibition-demo-first-light',
    slug: 'first-light',
    title: 'First Light',
    subtitle: 'The opening arrangement of the demo build',
    curatorialStatement:
      'Demo exhibition. First Light gathers the placeholder records used to build and review the House — a wide still given the long west wall, a pair of small pixel studies that reward standing close, and a silent loop held apart in the Black Box. It exists to test how an exhibition reads: a statement, an order, and a route through the rooms. When the collection arrives, this arrangement is replaced by a real one.',
    essay: null,
    heroArtworkSlug: 'strata-cobalt',
    artworkSlugs: [
      'strata-cobalt',
      'interference-cobalt',
      'grid-magenta',
      'grid-cobalt',
      'interference-ember',
      'drift-verdigris',
    ],
    roomSlugs: ['the-great-room', 'the-black-box'],
    startDate: '2026-09-01',
    endDate: null,
    coverImageUrl: '/media/demo/still-strata-cobalt--thumb.png',
    state: 'published',
  },
];
