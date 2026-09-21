import { describe, expect, it } from 'vitest';
import { FileCollectionRepository } from '@/data';
import { validateCollection } from '@/data/validate';

const repo = new FileCollectionRepository();

describe('the shipped collection record', () => {
  it('passes every integrity check', () => {
    const issues = validateCollection(repo).filter((issue) => issue.severity === 'error');
    expect(issues).toEqual([]);
  });

  it('hangs every work somewhere in the museum', () => {
    const unplaced = validateCollection(repo).filter((issue) => issue.code === 'unplaced');
    expect(unplaced).toEqual([]);
  });

  it('refuses to ship placeholder records in production mode', () => {
    const issues = validateCollection(repo, { mode: 'production' });
    expect(issues.some((issue) => issue.code === 'placeholder-in-production')).toBe(true);
  });

  it('marks every demo record as a placeholder', () => {
    /* The demo build must be unambiguous: if this ever fails, something unmarked has
       entered the record (§91). */
    expect(repo.listArtworks().every((artwork) => artwork.isPlaceholder)).toBe(true);
    expect(repo.hasPlaceholders()).toBe(true);
  });

  it('never invents artist biography', () => {
    for (const artist of repo.listArtists()) {
      if (!artist.isPlaceholder) continue;
      expect(artist.biography).toBeNull();
      expect(artist.artistStatement).toBeNull();
    }
  });

  it('resolves every relation to a work the House holds', () => {
    const slugs = new Set(repo.listArtworks().map((artwork) => artwork.slug));
    for (const artwork of repo.listArtworks()) {
      for (const relation of artwork.relationships) {
        expect(slugs.has(relation.artworkSlug)).toBe(true);
        expect(relation.reason.length).toBeGreaterThan(0);
      }
    }
  });

  it('can find where any hung work lives, for VIEW IN MUSEUM', () => {
    for (const artwork of repo.listArtworks()) {
      expect(repo.findPlacement(artwork.slug)).not.toBeNull();
    }
  });
});
