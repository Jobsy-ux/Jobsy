# Provider integrations

`src/providers/`. Everything a third party says enters here and leaves as an internal
shape. No provider-specific field name, URL pattern or quirk is allowed past this layer
(§81).

## Contract

```ts
interface CollectionProvider {
  readonly name: string;
  isConfigured(): boolean;
  listWalletAssets(wallet: string, chain: string): Promise<ProviderResult<ProviderAsset[]>>;
  getAsset(token: TokenReference): Promise<ProviderResult<ProviderAsset>>;
}
```

Every call is bounded (12s timeout), returns a result rather than throwing, and says why
it failed in terms a curator can act on. An unconfigured provider reports itself
unconfigured and is skipped — it is never guessed at, and a missing key never fails an
import (§73).

## Current providers

| Provider | State | Notes |
|---|---|---|
| **OpenSea** | implemented, read-only | `OPENSEA_API_KEY`, server-side only. Responses are parsed with Zod, unknown fields ignored. Everything it returns is labelled `marketplace-thumbnail`, so it can identify a work but never hang one (§46). |
| **Raster** | boundary only | The public API surface has not been confirmed. Rather than guess at endpoints and ship code that silently fabricates or drops data, the adapter reports itself unconfigured; Raster links are curated by hand and watched by the link-health engine. One file changes the day the API is confirmed. |
| **IPFS / Arweave** | implemented | Identifiers are stored, not gateway URLs; several gateways are resolved at read time so one outage is not an outage (§73). |
| **Link health** | implemented | `checkLink` / `checkLinks`: HEAD then GET, reporting healthy / redirecting / broken / unknown. A network failure is `unknown`, never `broken` — a link is only declared dead on a real answer (§24). |

## Rules

1. **Providers enrich; they never serve.** No page or repository method calls a provider.
   The museum runs with every marketplace offline (§42, §73).
2. **Raw stays raw.** Provider payloads go to `external_metadata_source` with a timestamp.
   Nothing merges them into curated fields automatically (§45).
3. **Discovery is not membership.** Wallet results become `wallet_candidate` rows for a
   curator to decide on (§43).
4. **Keys are server-side.** No provider key is ever exposed to the browser (§72).
5. **Providers do not rank anything.** Nothing in the interface is ordered by a marketplace
   signal (§36).

## Not built

Scheduled link-health runs and their admin surface; wallet discovery as a job; and a
Verse / SuperRare / Foundation adapter, which are link destinations today and only need
adapters if the House starts importing from them.
