import type { Collection, Collector } from '@/domain';

export const collector: Collector = {
  id: 'collector-nucci',
  slug: 'nucci',
  name: 'Nucci',
  // The collector's own statement is owner-supplied. It stays null until written by the
  // owner rather than being drafted on their behalf (spec §104).
  statement: null,
};

export const collection: Collection = {
  id: 'collection-house-of-nucci',
  slug: 'house-of-nucci',
  name: 'House of Nucci',
  formalName: 'The House of Nucci Collection',
  collectorSlug: 'nucci',
  statement: null,
};
