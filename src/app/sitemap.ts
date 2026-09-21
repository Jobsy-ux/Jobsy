import type { MetadataRoute } from 'next';
import { getRepository } from '@/data';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://houseofnucci.example';

/**
 * Indexable surfaces (§56). Demo records are excluded: a placeholder must never be
 * offered to a search engine as a work in the collection (§91).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const repo = getRepository();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/collection`, priority: 0.9 },
    { url: `${BASE}/artists`, priority: 0.8 },
    { url: `${BASE}/exhibitions`, priority: 0.7 },
    { url: `${BASE}/pathways`, priority: 0.7 },
    { url: `${BASE}/start-here`, priority: 0.6 },
  ];

  for (const artwork of repo.listArtworks()) {
    if (artwork.isPlaceholder) continue;
    entries.push({ url: `${BASE}/artwork/${artwork.slug}`, priority: 0.8 });
  }
  for (const artist of repo.listArtists()) {
    if (artist.isPlaceholder) continue;
    entries.push({ url: `${BASE}/artist/${artist.slug}`, priority: 0.7 });
  }
  for (const entry of repo.listSeries()) {
    if (entry.isPlaceholder) continue;
    entries.push({ url: `${BASE}/series/${entry.slug}`, priority: 0.6 });
  }
  for (const exhibition of repo.listExhibitions()) {
    entries.push({ url: `${BASE}/exhibition/${exhibition.slug}`, priority: 0.6 });
  }
  for (const pathway of repo.listPathways()) {
    entries.push({ url: `${BASE}/pathway/${pathway.slug}`, priority: 0.6 });
  }

  return entries;
}
