import type { MetadataRoute } from 'next';
import { getRepository } from '@/data';
import { absoluteUrl, routes } from '@/lib/site';

/**
 * Indexable surfaces (§56). Demo records are excluded: a placeholder must never be
 * offered to a search engine as a work in the collection (§91).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const repo = getRepository();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl(routes.home()), priority: 1 },
    { url: absoluteUrl(routes.collection()), priority: 0.9 },
    { url: absoluteUrl(routes.artists()), priority: 0.8 },
    { url: absoluteUrl(routes.exhibitions()), priority: 0.7 },
    { url: absoluteUrl(routes.pathways()), priority: 0.7 },
    { url: absoluteUrl(routes.startHere()), priority: 0.6 },
  ];

  for (const artwork of repo.listArtworks()) {
    if (artwork.isPlaceholder) continue;
    entries.push({ url: absoluteUrl(routes.artwork(artwork.slug)), priority: 0.8 });
  }
  for (const artist of repo.listArtists()) {
    if (artist.isPlaceholder) continue;
    entries.push({ url: absoluteUrl(routes.artist(artist.slug)), priority: 0.7 });
  }
  for (const entry of repo.listSeries()) {
    if (entry.isPlaceholder) continue;
    entries.push({ url: absoluteUrl(routes.series(entry.slug)), priority: 0.6 });
  }
  for (const exhibition of repo.listExhibitions()) {
    entries.push({ url: absoluteUrl(routes.exhibition(exhibition.slug)), priority: 0.6 });
  }
  for (const pathway of repo.listPathways()) {
    entries.push({ url: absoluteUrl(routes.pathway(pathway.slug)), priority: 0.6 });
  }

  return entries;
}
