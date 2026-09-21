import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { absoluteUrl, CANONICAL_ORIGIN, routes, SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

describe('canonical domain', () => {
  it('defaults to houseofnucci.art', () => {
    expect(CANONICAL_ORIGIN).toBe('https://houseofnucci.art');
    expect(SITE_URL).toBe('https://houseofnucci.art');
  });

  it('builds absolute URLs for every public entity', () => {
    expect(absoluteUrl(routes.home())).toBe('https://houseofnucci.art/');
    expect(absoluteUrl(routes.museum())).toBe('https://houseofnucci.art/museum');
    expect(absoluteUrl(routes.collection())).toBe('https://houseofnucci.art/collection');
    expect(absoluteUrl(routes.artwork('argonaut-7008'))).toBe(
      'https://houseofnucci.art/artwork/argonaut-7008',
    );
    expect(absoluteUrl(routes.artist('alpha-centauri-kid'))).toBe(
      'https://houseofnucci.art/artist/alpha-centauri-kid',
    );
    expect(absoluteUrl(routes.series('argonauts'))).toBe('https://houseofnucci.art/series/argonauts');
    expect(absoluteUrl(routes.exhibition('first-light'))).toBe(
      'https://houseofnucci.art/exhibition/first-light',
    );
    expect(absoluteUrl(routes.pathway('how-to-look'))).toBe(
      'https://houseofnucci.art/pathway/how-to-look',
    );
  });

  it('tolerates a path with or without a leading slash, and never doubles one', () => {
    expect(absoluteUrl('collection')).toBe('https://houseofnucci.art/collection');
    expect(absoluteUrl('/collection/')).toBe('https://houseofnucci.art/collection');
  });
});

describe('positioning', () => {
  it('describes the House as a personal, curated collection', () => {
    expect(SITE_DESCRIPTION).toBe(
      'House of Nucci is a highly curated personal collection of digital art, presented as an immersive digital museum experience.',
    );
  });

  /**
   * A copy guard. The House does not claim scale, value or historical importance
   * (docs/POSITIONING.md), and the easiest way for that to erode is a stray adjective in
   * a component months from now. Documentation is excluded: it quotes these phrases in
   * order to forbid them.
   */
  it('never claims scale, value or importance in anything a visitor reads', () => {
    const forbidden = [
      /one of the world'?s (?:most|largest|greatest)/i,
      /landmark collection/i,
      /museum-grade/i,
      /definitive collection/i,
      /historically significant/i,
      /major institutional holdings/i,
      /world'?s (?:finest|foremost|leading) collection/i,
      /blue[- ]chip/i,
      /\btrophy\b/i,
      /\bgrail\b/i,
      /whale collection/i,
      /encyclopedic/i,
    ];

    const offences: string[] = [];
    for (const file of sourceFiles(['src', 'content'])) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of forbidden) {
        const match = pattern.exec(text);
        if (match) offences.push(`${file}: “${match[0]}”`);
      }
    }

    expect(offences).toEqual([]);
  });
});

function sourceFiles(roots: readonly string[]): string[] {
  const found: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else if (/\.(ts|tsx)$/.test(entry)) {
        found.push(path);
      }
    }
  };
  for (const root of roots) walk(root);
  return found;
}
