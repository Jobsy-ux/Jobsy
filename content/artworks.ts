import type { ArtworkInput, MediaAssetInput } from '@/domain';

/**
 * DEMO ARTWORK RECORDS.
 *
 * None of these is a work in the House of Nucci Collection. Each carries
 * `isPlaceholder: true`, is attributed to a demo artist, points at procedurally generated
 * abstract media in `public/media/demo/`, and is excluded from sitemaps and social cards.
 * Descriptions describe what the placeholder *is* — they do not impersonate criticism of
 * a real work (spec §91, §104).
 *
 * Token bindings use the zero address and demo token ids so nothing here can be mistaken
 * for a real on-chain object. External links point at example.com and are inert.
 */

const DEMO = '/media/demo';

function still(
  file: string,
  width: number,
  height: number,
  options: { thumb?: string; thumbWidth?: number; thumbHeight?: number } = {},
): ArtworkInput['media'] {
  const canonical: MediaAssetInput = {
    id: `media-${file}`,
    sourceKind: 'owner-original',
    url: `${DEMO}/${file}`,
    mimeType: 'image/png',
    width,
    height,
  };
  const thumbnail: MediaAssetInput | null = options.thumb
    ? {
        id: `media-${options.thumb}`,
        sourceKind: 'owner-original',
        url: `${DEMO}/${options.thumb}`,
        mimeType: 'image/png',
        width: options.thumbWidth ?? null,
        height: options.thumbHeight ?? null,
      }
    : null;
  return { canonical, web: null, thumbnail, poster: null, archivalOriginal: null };
}

/** Inert demo links, so the external-handoff UI can be built and reviewed. */
function demoLinks(id: string): ArtworkInput['links'] {
  return [
    {
      platform: 'opensea',
      url: `https://example.com/demo/opensea/${id}`,
      label: 'View on OpenSea (demo link)',
      refersTo: 'this-work',
      health: 'unknown',
    },
    {
      platform: 'raster',
      url: `https://example.com/demo/raster/${id}`,
      label: 'View on Raster (demo link)',
      refersTo: 'this-work',
      health: 'unknown',
    },
  ];
}

function demoToken(tokenId: string): ArtworkInput['token'] {
  return {
    chain: 'ethereum',
    contractAddress: '0x0000000000000000000000000000000000000000',
    tokenId,
    tokenStandard: 'ERC-721',
    mintPlatform: null,
    mintDate: null,
    walletAddress: null,
    contractVerification: 'unverified',
    tokenVerification: 'unverified',
  };
}

export const artworks: ArtworkInput[] = [
  /* ---------------------------------------------------------- Vantage Field */
  {
    id: 'artwork-demo-strata-ember',
    slug: 'strata-ember',
    title: 'Strata (Ember)',
    artistSlug: 'vantage-field',
    seriesSlug: 'strata',
    year: 2023,
    artworkType: 'unique',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    description:
      'Demo record. A 3:2 placeholder composition of stratified horizontal fields, generated to test monumental wall presentation and the still-image renderer.',
    notes: [
      {
        kind: 'curatorial-context',
        body: 'Demo note. This text occupies the position a curatorial note would hold on a real record, so the artwork page can be reviewed with prose in place. It makes no claim about any real work.',
        author: 'House of Nucci',
      },
    ],
    media: still('still-strata-ember.png', 2048, 1365, {
      thumb: 'still-strata-ember--thumb.png',
      thumbWidth: 640,
      thumbHeight: 427,
    }),
    token: demoToken('1001'),
    links: demoLinks('strata-ember'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2023', actor: 'Vantage Field (Demo Artist)', certainty: 'documented' },
      { id: 'pe-2', type: 'acquired-by-house', date: '2024', actor: 'House of Nucci', certainty: 'documented' },
    ],
    acquisition: { date: '2024-01-01', source: 'Demo record', isPublic: true },
    relationships: [
      { artworkSlug: 'strata-bone', kind: 'series', reason: 'From the same demo series, in a square format.' },
      { artworkSlug: 'interference-cobalt', kind: 'dialogue', reason: 'Placed opposite in the Great Room to test long-sightline pairing.' },
    ],
    tags: ['demo', 'still', 'horizontal'],
    featured: true,
    displayPriority: 90,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-strata-bone',
    slug: 'strata-bone',
    title: 'Strata (Bone)',
    artistSlug: 'vantage-field',
    seriesSlug: 'strata',
    year: 2023,
    artworkType: 'unique',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    description:
      'Demo record. A square placeholder composition, used to verify that square work is hung and scaled without distortion.',
    media: still('still-strata-bone.png', 1800, 1800, {
      thumb: 'still-strata-bone--thumb.png',
      thumbWidth: 600,
      thumbHeight: 600,
    }),
    token: demoToken('1002'),
    links: demoLinks('strata-bone'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2023', actor: 'Vantage Field (Demo Artist)', certainty: 'documented' },
    ],
    acquisition: { date: '2024-03-14', source: 'Demo record', isPublic: true },
    relationships: [
      { artworkSlug: 'strata-ember', kind: 'series', reason: 'From the same demo series.' },
    ],
    tags: ['demo', 'still', 'square'],
    displayPriority: 70,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-strata-cobalt',
    slug: 'strata-cobalt',
    title: 'Strata (Cobalt)',
    artistSlug: 'vantage-field',
    seriesSlug: 'strata',
    year: 2024,
    artworkType: 'unique',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    description:
      'Demo record. An ultrawide 64:27 placeholder composition, used to test a work given an entire wall at monumental scale.',
    media: still('still-strata-cobalt.png', 2560, 1080, {
      thumb: 'still-strata-cobalt--thumb.png',
      thumbWidth: 768,
      thumbHeight: 324,
    }),
    token: demoToken('1003'),
    links: demoLinks('strata-cobalt'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2024', actor: 'Vantage Field (Demo Artist)', certainty: 'documented' },
    ],
    acquisition: { date: '2025-02-02', source: 'Demo record', isPublic: true },
    tags: ['demo', 'still', 'panoramic'],
    featured: true,
    displayPriority: 85,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-blocks-bone',
    slug: 'blocks-bone',
    title: 'Blocks (Bone)',
    artistSlug: 'vantage-field',
    seriesSlug: null,
    year: 2022,
    artworkType: 'series-work',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    description:
      'Demo record. A hard-edged 3:2 placeholder composition, used to check edge rendering against the wall wash.',
    media: still('still-blocks-bone.png', 2000, 1334, {
      thumb: 'still-blocks-bone--thumb.png',
      thumbWidth: 600,
      thumbHeight: 400,
    }),
    token: null,
    links: [],
    provenance: [],
    acquisition: null,
    tags: ['demo', 'still'],
    displayPriority: 40,
    isPlaceholder: true,
  },

  /* ----------------------------------------------------------- Null Harbour */
  {
    id: 'artwork-demo-interference-verdigris',
    slug: 'interference-verdigris',
    title: 'Interference I',
    artistSlug: 'null-harbour',
    seriesSlug: 'interference',
    year: 2024,
    artworkType: 'edition',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    editionLabel: '3 of 25',
    description:
      'Demo record. A 4:5 portrait placeholder composition, used to test edition labelling and portrait hanging height.',
    media: still('still-interference-verdigris.png', 1600, 2000, {
      thumb: 'still-interference-verdigris--thumb.png',
      thumbWidth: 512,
      thumbHeight: 640,
    }),
    token: demoToken('2001'),
    links: demoLinks('interference-verdigris'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2024', actor: 'Null Harbour (Demo Artist)', certainty: 'documented' },
      { id: 'pe-2', type: 'transferred', date: null, actor: 'Private collector', certainty: 'reported', note: 'Demo record: an undated, reported event, used to show how uncertain history is labelled.' },
      { id: 'pe-3', type: 'acquired-by-house', date: '2025-05-06', actor: 'House of Nucci', certainty: 'documented' },
    ],
    acquisition: { date: '2025-05-06', source: 'Demo record', isPublic: true },
    relationships: [
      { artworkSlug: 'interference-magenta', kind: 'series', reason: 'Adjacent edition from the same demo series.' },
    ],
    tags: ['demo', 'still', 'edition', 'portrait'],
    displayPriority: 75,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-interference-cobalt',
    slug: 'interference-cobalt',
    title: 'Interference II',
    artistSlug: 'null-harbour',
    seriesSlug: 'interference',
    year: 2024,
    artworkType: 'unique',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    description:
      'Demo record. A 12:5 placeholder composition, used to test a wide work on a long sightline.',
    media: still('still-interference-cobalt.png', 2400, 1000, {
      thumb: 'still-interference-cobalt--thumb.png',
      thumbWidth: 720,
      thumbHeight: 300,
    }),
    token: demoToken('2002'),
    links: demoLinks('interference-cobalt'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2024', actor: 'Null Harbour (Demo Artist)', certainty: 'documented' },
    ],
    acquisition: { date: '2025-06-01', source: 'Demo record', isPublic: false },
    tags: ['demo', 'still', 'panoramic'],
    displayPriority: 65,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-interference-magenta',
    slug: 'interference-magenta',
    title: 'Interference III',
    artistSlug: 'null-harbour',
    seriesSlug: 'interference',
    year: 2025,
    artworkType: 'edition',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    editionLabel: '11 of 25',
    description:
      'Demo record. A 2:3 portrait placeholder composition, used to test intimate-scale hanging in a smaller chamber.',
    media: still('still-interference-magenta.png', 1000, 1500, {
      thumb: 'still-interference-magenta--thumb.png',
      thumbWidth: 400,
      thumbHeight: 600,
    }),
    token: demoToken('2003'),
    links: demoLinks('interference-magenta'),
    provenance: [],
    acquisition: null,
    tags: ['demo', 'still', 'edition'],
    displayPriority: 45,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-drift-magenta',
    slug: 'drift-magenta',
    title: 'Drift (Magenta)',
    artistSlug: 'null-harbour',
    seriesSlug: null,
    year: 2025,
    artworkType: 'unique',
    mediaType: 'still',
    medium: 'Generated still image (demo placeholder)',
    description:
      'Demo record. A 4:5 placeholder composition of luminous rules, used as the still counterpart to the moving-image demo.',
    media: still('still-drift-magenta.png', 1400, 1750, {
      thumb: 'still-drift-magenta--thumb.png',
      thumbWidth: 480,
      thumbHeight: 600,
    }),
    token: null,
    links: [],
    provenance: [],
    acquisition: null,
    relationships: [
      { artworkSlug: 'drift-verdigris', kind: 'medium', reason: 'The same construction, resolved as a still rather than a loop.' },
    ],
    tags: ['demo', 'still'],
    displayPriority: 50,
    isPlaceholder: true,
  },

  /* ---------------------------------------------------------- Slow Concrete */
  {
    id: 'artwork-demo-drift-verdigris',
    slug: 'drift-verdigris',
    title: 'Drift (Loop)',
    artistSlug: 'slow-concrete',
    seriesSlug: null,
    year: 2024,
    artworkType: 'unique',
    mediaType: 'animated',
    medium: 'Animated GIF, 3 second loop (demo placeholder)',
    description:
      'Demo record. A 36-frame animated placeholder, used to verify that looping work animates on the wall rather than appearing as a still.',
    media: {
      canonical: {
        id: 'media-drift-gif',
        sourceKind: 'owner-original',
        url: '/media/demo/animated-drift-verdigris.gif',
        mimeType: 'image/gif',
        width: 480,
        height: 480,
        durationSeconds: 3,
      },
      web: null,
      thumbnail: null,
      poster: {
        id: 'media-drift-poster',
        sourceKind: 'owner-original',
        url: '/media/demo/animated-drift-verdigris--poster.png',
        mimeType: 'image/png',
        width: 480,
        height: 480,
      },
      archivalOriginal: null,
    },
    token: demoToken('3001'),
    links: demoLinks('drift-verdigris'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2024', actor: 'Slow Concrete (Demo Artist)', certainty: 'documented' },
    ],
    acquisition: { date: '2025-07-19', source: 'Demo record', isPublic: true },
    tags: ['demo', 'animated', 'moving-image'],
    featured: true,
    displayPriority: 80,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-interference-ember-video',
    slug: 'interference-ember',
    title: 'Interference (Moving)',
    artistSlug: 'slow-concrete',
    seriesSlug: null,
    year: 2025,
    artworkType: 'unique',
    mediaType: 'video',
    medium: 'Single-channel video, 5 seconds, silent (demo placeholder)',
    description:
      'Demo record. A five-second silent video placeholder, used to test black-box presentation, distance-gated playback and poster fallback.',
    media: {
      canonical: {
        id: 'media-ember-mp4',
        sourceKind: 'owner-original',
        url: '/media/demo/video-interference-ember.mp4',
        mimeType: 'video/mp4',
        width: 1280,
        height: 720,
        durationSeconds: 5,
        hasAudio: false,
      },
      web: {
        id: 'media-ember-webm',
        sourceKind: 'owner-original',
        url: '/media/demo/video-interference-ember.webm',
        mimeType: 'video/webm',
        width: 1280,
        height: 720,
        durationSeconds: 5,
        hasAudio: false,
      },
      thumbnail: null,
      poster: {
        id: 'media-ember-poster',
        sourceKind: 'owner-original',
        url: '/media/demo/video-interference-ember--poster.png',
        mimeType: 'image/png',
        width: 1280,
        height: 720,
      },
      archivalOriginal: null,
    },
    token: demoToken('3002'),
    links: demoLinks('interference-ember'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2025', actor: 'Slow Concrete (Demo Artist)', certainty: 'documented' },
      { id: 'pe-2', type: 'acquired-by-house', date: '2025-08-30', actor: 'House of Nucci', certainty: 'documented' },
    ],
    acquisition: { date: '2025-08-30', source: 'Demo record', isPublic: true },
    tags: ['demo', 'video', 'moving-image'],
    featured: true,
    displayPriority: 88,
    isPlaceholder: true,
  },

  /* --------------------------------------------------------- Pixel Ordnance */
  {
    id: 'artwork-demo-grid-magenta',
    slug: 'grid-magenta',
    title: 'Grid Study 16',
    artistSlug: 'pixel-ordnance',
    seriesSlug: 'grid-studies',
    year: 2022,
    artworkType: 'unique',
    mediaType: 'pixel',
    medium: 'Pixel raster, 64 × 64 (demo placeholder)',
    description:
      'Demo record. A 64 × 64 placeholder raster. Rendered nearest-neighbour at every scale so pixel boundaries stay exact.',
    media: {
      canonical: {
        id: 'media-grid-magenta',
        sourceKind: 'owner-original',
        url: '/media/demo/pixel-grid-magenta.png',
        mimeType: 'image/png',
        width: 64,
        height: 64,
      },
      web: null,
      thumbnail: null,
      poster: null,
      archivalOriginal: null,
    },
    token: demoToken('4001'),
    links: demoLinks('grid-magenta'),
    provenance: [
      { id: 'pe-1', type: 'created', date: '2022', actor: 'Pixel Ordnance (Demo Artist)', certainty: 'documented' },
    ],
    acquisition: { date: '2024-11-11', source: 'Demo record', isPublic: true },
    relationships: [
      { artworkSlug: 'grid-cobalt', kind: 'series', reason: 'Companion study at a finer grid.' },
    ],
    tags: ['demo', 'pixel'],
    displayPriority: 60,
    isPlaceholder: true,
  },
  {
    id: 'artwork-demo-grid-cobalt',
    slug: 'grid-cobalt',
    title: 'Grid Study 24',
    artistSlug: 'pixel-ordnance',
    seriesSlug: 'grid-studies',
    year: 2022,
    artworkType: 'unique',
    mediaType: 'pixel',
    medium: 'Pixel raster, 96 × 96 (demo placeholder)',
    description:
      'Demo record. A 96 × 96 placeholder raster at a finer grid, hung at intimate scale.',
    media: {
      canonical: {
        id: 'media-grid-cobalt',
        sourceKind: 'owner-original',
        url: '/media/demo/pixel-grid-cobalt.png',
        mimeType: 'image/png',
        width: 96,
        height: 96,
      },
      web: null,
      thumbnail: null,
      poster: null,
      archivalOriginal: null,
    },
    token: demoToken('4002'),
    links: demoLinks('grid-cobalt'),
    provenance: [],
    acquisition: null,
    tags: ['demo', 'pixel'],
    displayPriority: 55,
    isPlaceholder: true,
  },

  /* ---------------------------------------------------------- Glass Register */
  {
    id: 'artwork-demo-vector-fields',
    slug: 'vector-fields',
    title: 'Register (Vector)',
    artistSlug: 'glass-register',
    seriesSlug: null,
    year: 2023,
    artworkType: 'unique',
    mediaType: 'svg',
    medium: 'Vector drawing, SVG (demo placeholder)',
    description:
      'Demo record. A hand-written SVG placeholder, used to verify that vector work is rendered as vector rather than rasterised to a fixed size.',
    media: {
      canonical: {
        id: 'media-vector-fields',
        sourceKind: 'owner-original',
        url: '/media/demo/vector-fields.svg',
        mimeType: 'image/svg+xml',
        width: 1000,
        height: 1250,
      },
      web: null,
      thumbnail: null,
      poster: null,
      archivalOriginal: null,
    },
    token: demoToken('5001'),
    links: [
      {
        platform: 'artist-site',
        url: 'https://example.com/demo/glass-register',
        label: 'Artist site (demo link)',
        refersTo: 'artist-practice',
        health: 'unknown',
      },
    ],
    provenance: [
      { id: 'pe-1', type: 'created', date: '2023', actor: 'Glass Register (Demo Artist)', certainty: 'documented' },
    ],
    acquisition: { date: '2025-01-20', source: 'Demo record', isPublic: true },
    tags: ['demo', 'vector', 'on-chain'],
    displayPriority: 58,
    isPlaceholder: true,
  },
];
