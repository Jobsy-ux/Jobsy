import { describe, expect, it } from 'vitest';
import {
  ArtworkSchema,
  acquisitionYear,
  aspectRatio,
  derivedDisplaySize,
  externalPracticeLinks,
  isTimeBased,
  mayPublishHighResolution,
  orderedProvenance,
  ownedWorkLinks,
  requiresNearestNeighbour,
  type ArtworkInput,
} from '@/domain';

function artwork(overrides: Partial<ArtworkInput> = {}) {
  const base: ArtworkInput = {
    id: 'a',
    slug: 'a-work',
    title: 'A Work',
    artistSlug: 'an-artist',
    year: 2024,
    artworkType: 'unique',
    mediaType: 'still',
    medium: 'Still image',
    media: {
      canonical: {
        id: 'm',
        sourceKind: 'owner-original',
        url: '/media/a.png',
        mimeType: 'image/png',
        width: 2000,
        height: 1000,
      },
    },
    isPlaceholder: false,
    ...overrides,
  };
  return ArtworkSchema.parse(base);
}

describe('artwork fidelity', () => {
  it('derives display height from the artwork, not from the curator', () => {
    const work = artwork();
    const size = derivedDisplaySize({ displayWidth: 4 }, work.media.canonical);
    expect(size.width).toBe(4);
    expect(size.height).toBe(2);
    expect(size.width / size.height).toBeCloseTo(aspectRatio(work.media.canonical));
  });

  it('keeps proportion at every display width', () => {
    const work = artwork();
    for (const width of [0.4, 1, 3.5, 9, 22]) {
      const size = derivedDisplaySize({ displayWidth: width }, work.media.canonical);
      expect(size.width / size.height).toBeCloseTo(2, 10);
    }
  });

  it('marks pixel work for nearest-neighbour rendering and nothing else', () => {
    expect(requiresNearestNeighbour('pixel')).toBe(true);
    expect(requiresNearestNeighbour('still')).toBe(false);
    expect(requiresNearestNeighbour('video')).toBe(false);
  });

  it('knows which media carry their own timeline', () => {
    expect(isTimeBased('video')).toBe(true);
    expect(isTimeBased('animated')).toBe(true);
    expect(isTimeBased('still')).toBe(false);
  });
});

describe('ownership boundary', () => {
  const work = artwork({
    links: [
      { platform: 'opensea', url: 'https://example.com/this', label: 'This work', refersTo: 'this-work' },
      { platform: 'artist-site', url: 'https://example.com/artist', label: 'Artist', refersTo: 'artist-practice' },
      { platform: 'superrare', url: 'https://example.com/other', label: 'Other', refersTo: 'other-work' },
    ],
  });

  it('separates links to the owned work from the artist’s wider practice', () => {
    expect(ownedWorkLinks(work.links).map((link) => link.label)).toEqual(['This work']);
    expect(externalPracticeLinks(work.links).map((link) => link.label)).toEqual(['Artist', 'Other']);
  });

  it('never counts an external work as owned', () => {
    const owned = ownedWorkLinks(work.links);
    expect(owned.every((link) => link.refersTo === 'this-work')).toBe(true);
  });
});

describe('rights', () => {
  it('defaults to a posture that grants nothing', () => {
    const work = artwork();
    expect(work.rights.displayRightsStatus).toBe('not-established');
    expect(work.rights.highResRehostingAllowed).toBe(false);
    expect(mayPublishHighResolution(work)).toBe(false);
  });

  it('permits high-resolution re-hosting only when explicitly granted', () => {
    const granted = artwork({
      rights: {
        displayRightsStatus: 'display-and-rehost',
        highResRehostingAllowed: true,
      },
    });
    expect(mayPublishHighResolution(granted)).toBe(true);

    const halfGranted = artwork({
      rights: { displayRightsStatus: 'display-only', highResRehostingAllowed: true },
    });
    expect(mayPublishHighResolution(halfGranted)).toBe(false);
  });
});

describe('provenance', () => {
  it('reads oldest first and leaves undated events at the end', () => {
    const work = artwork({
      provenance: [
        { id: '3', type: 'transferred', date: null, certainty: 'reported' },
        { id: '2', type: 'acquired-by-house', date: '2024-05-01', certainty: 'documented' },
        { id: '1', type: 'created', date: '2019', certainty: 'documented' },
      ],
    });
    expect(orderedProvenance(work).map((event) => event.id)).toEqual(['1', '2', '3']);
  });

  it('keeps creation and acquisition apart', () => {
    const work = artwork({
      year: 2019,
      acquisition: { date: '2024-05-01', isPublic: true },
    });
    expect(work.year).toBe(2019);
    expect(acquisitionYear(work)).toBe(2024);
  });

  it('reports no acquisition year rather than guessing one', () => {
    expect(acquisitionYear(artwork())).toBeNull();
  });
});

describe('untrusted metadata', () => {
  it('rejects a URL scheme that could execute', () => {
    expect(() =>
      artwork({
        links: [
          {
            platform: 'other',
             
            url: 'javascript:alert(1)',
            label: 'Bad',
            refersTo: 'this-work',
          },
        ],
      }),
    ).toThrow();
  });

  it('requires every record to declare whether it is a placeholder', () => {
    const complete = {
      id: 'x',
      slug: 'x',
      title: 'X',
      artistSlug: 'a',
      year: null,
      artworkType: 'unique' as const,
      mediaType: 'still' as const,
      medium: 'Still',
      media: {
        canonical: { id: 'm', sourceKind: 'owner-original' as const, url: '/x.png', mimeType: 'image/png', width: 1, height: 1 },
      },
      isPlaceholder: true,
    };
    const { isPlaceholder, ...withoutFlag } = complete;
    expect(isPlaceholder).toBe(true);
    expect(() => ArtworkSchema.parse(withoutFlag)).toThrow();
  });
});
