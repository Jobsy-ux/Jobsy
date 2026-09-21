# Deployment

## Domain

The canonical production domain is **https://houseofnucci.art**. It is the default in
`src/lib/site.ts`, so canonical tags, the sitemap, robots, OpenGraph and social cards
resolve to it without configuration. `NEXT_PUBLIC_SITE_URL` overrides it for local and
preview builds.

Public URL structure: `/` · `/museum` · `/collection` · `/artwork/[slug]` ·
`/artist/[slug]` · `/series/[slug]` · `/exhibition/[slug]` · `/pathway/[slug]`.

**DNS, registrar and CDN records are not configured**, and are not to be until the owner
asks. When that happens: point the apex and `www` at the host, redirect `www` to the apex
so there is one canonical spelling, issue certificates, and only then set
`COLLECTION_MODE=production` so the site becomes indexable.

## Environments

| Environment | Purpose | Collection mode |
|---|---|---|
| local | development | `development` — demo records allowed |
| staging | review before production | `development`, `noindex` while demo records exist (`DECISIONS.md` O-7) |
| production | the public institution | `production` — the build fails if any placeholder record remains |

No significant change is tested first in production (§89).

## Build

```bash
npm install
npm run check                 # typecheck · lint · tests
npm run validate:collection   # record integrity
npm run build
npm run start
```

`npm run check` and `validate:collection` are the CI gate. For a production deploy, run
the validator with `COLLECTION_MODE=production` so demo records cannot ship.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build | overrides the canonical origin for local and preview builds; production needs no value |
| `COLLECTION_MODE` | build | `production` enables the placeholder gate and indexing |
| `OPENSEA_API_KEY` | server only | provider enrichment; never exposed to the browser |

Future: database URL and service key, R2 credentials, an AI provider key — all
server-side (§72). No key is ever read in a client component.

## Hosting

Vercel or Cloudflare for the app and CDN; Cloudflare R2 for media derivatives and the
original mirror; Supabase for PostgreSQL and admin auth from Phase 5. Media is served from
a CDN with long cache lifetimes and content-addressed paths.

## Backups (§88)

- Database: automated daily snapshots with point-in-time recovery, restore-tested
- Original media: redundant archival storage in at least two providers, plus the owner's
  own copy; checksums verified on a schedule
- Never rely on a marketplace, a wallet or a single cloud provider for preservation

## Monitoring

Sentry (or equivalent) for errors, privacy-conscious product analytics for the events in
`src/lib/analytics.ts`, and scheduled link-health runs once the job runner exists. Nothing
public ever displays popularity (§69).
