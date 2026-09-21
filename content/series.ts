import type { Series } from '@/domain';

/** DEMO SERIES. Structural placeholders only. */
export const series: Series[] = [
  {
    id: 'series-demo-strata',
    slug: 'strata',
    title: 'Strata',
    artistSlug: 'vantage-field',
    year: 2023,
    description:
      'Demo series record. Four placeholder compositions built from stratified horizontal fields, used to test series grouping across aspect ratios.',
    externalUrl: null,
    state: 'published',
    isPlaceholder: true,
  },
  {
    id: 'series-demo-interference',
    slug: 'interference',
    title: 'Interference',
    artistSlug: 'null-harbour',
    year: 2024,
    description:
      'Demo series record. Placeholder compositions built from overlapping radial fields, used to test edition labelling and portrait-format presentation.',
    externalUrl: null,
    state: 'published',
    isPlaceholder: true,
  },
  {
    id: 'series-demo-grid-studies',
    slug: 'grid-studies',
    title: 'Grid Studies',
    artistSlug: 'pixel-ordnance',
    year: 2022,
    description:
      'Demo series record. Small-format placeholder rasters used to verify that pixel work is rendered without interpolation at every scale.',
    externalUrl: null,
    state: 'published',
    isPlaceholder: true,
  },
];
