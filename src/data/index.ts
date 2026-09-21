import { FileCollectionRepository } from './file-repository';
import type { CollectionRepository } from './repository';

let instance: CollectionRepository | null = null;

/**
 * The single entry point to the record. Swapping in a PostgreSQL-backed implementation
 * is a change to this function and nothing else.
 */
export function getRepository(): CollectionRepository {
  if (!instance) instance = new FileCollectionRepository();
  return instance;
}

export type { CollectionRepository } from './repository';
export { FileCollectionRepository } from './file-repository';
