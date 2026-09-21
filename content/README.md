# content/

The collection record, stored as normalized per-entity modules and validated against the
Zod schemas in `src/domain` before anything reads it.

**Everything currently in this directory is a demo record.** No real work, artist,
provenance or ownership is represented here. Each record carries `isPlaceholder: true`,
which the schema requires, and the interface marks it visibly wherever it appears.
Placeholders are deleted — never edited into real records — when the real collection
export arrives (see `docs/DECISIONS.md`, O-2).

`npm run validate:collection` checks referential integrity, fidelity invariants and
ownership boundaries. With `COLLECTION_MODE=production` it also fails if any placeholder
record is present.

These modules are the temporary home of the record. The canonical target is PostgreSQL
(`supabase/migrations/0001_init.sql`); the shapes are identical by construction.
