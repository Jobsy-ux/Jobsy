#!/usr/bin/env tsx
/**
 * Checks the whole cultural record: referential integrity, museum placement, fidelity
 * invariants, the ownership boundary, and rights consistency.
 *
 *   npm run validate:collection
 *   COLLECTION_MODE=production npm run validate:collection   # also fails on placeholders
 *
 * Exits non-zero on any error, so it can gate a deploy (§83, §91).
 */
import { FileCollectionRepository } from '../src/data';
import { validateCollection } from '../src/data/validate';

const mode = process.env.COLLECTION_MODE === 'production' ? 'production' : 'development';
const repo = new FileCollectionRepository({ includeUnpublished: true });
const issues = validateCollection(repo, { mode });

const errors = issues.filter((issue) => issue.severity === 'error');
const warnings = issues.filter((issue) => issue.severity === 'warning');

const artworks = repo.listArtworks();
const placeholders = artworks.filter((artwork) => artwork.isPlaceholder);

console.log('');
console.log('  HOUSE OF NUCCI — collection check');
console.log(`  mode: ${mode}`);
console.log('');
console.log(`  ${artworks.length} artworks · ${repo.listArtists().length} artists · ${repo.listSeries().length} series`);
console.log(`  ${repo.listRooms().length} rooms · ${repo.listExhibitions().length} exhibitions · ${repo.listPathways().length} pathways`);
if (placeholders.length > 0) {
  console.log(`  ${placeholders.length} of these are demo placeholder records, not works in the collection.`);
}
console.log('');

for (const issue of errors) {
  console.error(`  ✗ ${issue.subject}: ${issue.message}  [${issue.code}]`);
}
for (const issue of warnings) {
  console.warn(`  ! ${issue.subject}: ${issue.message}  [${issue.code}]`);
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('  Everything checks out.');
}
console.log('');

process.exit(errors.length > 0 ? 1 : 0);
