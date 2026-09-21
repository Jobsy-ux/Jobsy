import { describe, expect, it } from 'vitest';
import {
  ArtworkSchema,
  hasPublicationBasis,
  isPubliclyServed,
  mayPublishHighResolution,
  mayServePublicly,
  publicationBasisLabel,
  PUBLIC_DISPLAY_MAX_EDGE,
  type ArtworkInput,
} from '@/domain';
import { FileCollectionRepository } from '@/data';
import { validateCollection } from '@/data/validate';

function artwork(overrides: Partial<ArtworkInput> = {}) {
  return ArtworkSchema.parse({
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
        width: 6000,
        height: 4000,
      },
    },
    isPlaceholder: false,
    ...overrides,
  });
}

/** The whole collection, run through the validator, as a single reusable fixture. */
function issuesFor(overrides: Partial<ArtworkInput>) {
  const work = artwork(overrides);
  const repo = {
    listArtworks: () => [work],
    listArtists: () => [{ slug: 'an-artist' }],
    listSeries: () => [],
    listRooms: () => [],
    listExhibitions: () => [],
    listPathways: () => [],
    getArtwork: () => work,
  } as unknown as FileCollectionRepository;
  return validateCollection(repo).map((issue) => issue.code);
}

describe('ownership is not permission', () => {
  it('starts every work with no publication basis at all', () => {
    const work = artwork();
    expect(work.rights.publicationBasis).toBe('not-established');
    expect(hasPublicationBasis(work)).toBe(false);
    expect(publicationBasisLabel(work)).toBe('Publication basis not yet established');
  });

  it('does not treat a token, a wallet or a marketplace listing as a basis', () => {
    const owned = artwork({
      token: {
        chain: 'ethereum',
        contractAddress: '0xabc',
        tokenId: '1',
        walletAddress: '0xdef',
        tokenVerification: 'verified',
        contractVerification: 'verified',
      },
      links: [
        { platform: 'opensea', url: 'https://example.com/x', label: 'OpenSea', refersTo: 'this-work' },
      ],
    });
    /* Every ownership signal is present and verified, and none of it grants anything. */
    expect(hasPublicationBasis(owned)).toBe(false);
    expect(mayPublishHighResolution(owned)).toBe(false);
    expect(owned.rights.displayRightsStatus).toBe('not-established');
    expect(owned.rights.derivativesAllowed).toBe(false);
    expect(owned.rights.commercialUseAllowed).toBe(false);
  });

  it('flags a published work that nobody has established a basis for', () => {
    expect(issuesFor({ state: 'published' })).toContain('no-publication-basis');
  });

  it('refuses high-resolution re-hosting without a basis', () => {
    expect(
      issuesFor({
        rights: { displayRightsStatus: 'display-and-rehost', highResRehostingAllowed: true },
      }),
    ).toContain('rights-contradiction');
  });
});

describe('originals are not public assets', () => {
  it('will not serve a file above the display cap without explicit permission', () => {
    const work = artwork();
    expect(mayServePublicly(work, work.media.canonical)).toBe(false);
    expect(issuesFor({})).toContain('public-original');
  });

  it('serves a viewing copy at or below the cap', () => {
    const work = artwork({
      media: {
        canonical: {
          id: 'm',
          sourceKind: 'owner-original',
          url: '/media/a.png',
          mimeType: 'image/png',
          width: PUBLIC_DISPLAY_MAX_EDGE,
          height: 1200,
        },
      },
    });
    expect(mayServePublicly(work, work.media.canonical)).toBe(true);
  });

  it('treats unknown dimensions as unknown risk, not as permission', () => {
    const work = artwork({
      media: {
        canonical: {
          id: 'm',
          sourceKind: 'owner-original',
          url: '/media/a.png',
          mimeType: 'image/png',
          width: null,
          height: null,
        },
      },
    });
    expect(mayServePublicly(work, work.media.canonical)).toBe(false);
  });

  it('allows the full file only once high resolution is actually permitted', () => {
    const permitted = artwork({
      rights: {
        displayRightsStatus: 'display-and-rehost',
        highResRehostingAllowed: true,
        publicationBasis: 'explicit-permission',
        permissionGrantedBy: 'The artist',
        permissionRecordedOn: '2026-01-05',
      },
    });
    expect(mayServePublicly(permitted, permitted.media.canonical)).toBe(true);
  });

  it('keeps archival originals out of the public directory', () => {
    const issues = issuesFor({
      media: {
        canonical: {
          id: 'm',
          sourceKind: 'owner-original',
          url: '/media/a.png',
          mimeType: 'image/png',
          width: 1600,
          height: 1200,
        },
        archivalOriginal: {
          id: 'orig',
          sourceKind: 'owner-original',
          url: '/media/a-original.tif',
          mimeType: 'image/tiff',
          width: 8000,
          height: 6000,
        },
      },
    });
    expect(issues).toContain('original-public');
  });

  it('knows which assets are publicly served', () => {
    expect(isPubliclyServed({ url: '/media/demo/a.png' })).toBe(true);
    expect(isPubliclyServed({ url: 'https://archive.example/a.tif' })).toBe(false);
  });
});

describe('evidence, not assertion', () => {
  it('requires a licence URL when the basis is a licence', () => {
    expect(issuesFor({ rights: { publicationBasis: 'verified-license' } })).toContain('licence-missing');
  });

  it('requires permission to name who granted it and when', () => {
    expect(issuesFor({ rights: { publicationBasis: 'explicit-permission' } })).toContain(
      'permission-unattributed',
    );
  });

  it('accepts a fully evidenced permission', () => {
    const issues = issuesFor({
      state: 'published',
      media: {
        canonical: {
          id: 'm',
          sourceKind: 'owner-original',
          url: '/media/a.png',
          mimeType: 'image/png',
          width: 1600,
          height: 1200,
        },
      },
      rights: {
        publicationBasis: 'explicit-permission',
        permissionGrantedBy: 'The artist, by email',
        permissionRecordedOn: '2026-02-01',
        permissionEvidence: 'Thread archived in the collection records.',
      },
    });
    expect(issues).not.toContain('no-publication-basis');
    expect(issues).not.toContain('permission-unattributed');
    expect(issues).not.toContain('public-original');
  });
});

describe('the shipped record', () => {
  it('passes every rights check', () => {
    const repo = new FileCollectionRepository();
    const errors = validateCollection(repo).filter((issue) => issue.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('claims House authorship only for media the House actually generated', () => {
    const repo = new FileCollectionRepository();
    for (const work of repo.listArtworks()) {
      if (work.rights.publicationBasis !== 'owner-created') continue;
      expect(work.isPlaceholder).toBe(true);
      expect(work.media.canonical.url.startsWith('/media/demo/')).toBe(true);
    }
  });
});
