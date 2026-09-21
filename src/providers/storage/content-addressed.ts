/**
 * IPFS and Arweave references (§46, §47).
 *
 * The House stores identifiers, not gateway URLs: a gateway is an access route that will
 * change, while a CID is the work's address forever. Gateways are resolved at read time,
 * with more than one, because a single gateway going down must not take the museum with
 * it (§73).
 */
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
] as const;

const ARWEAVE_GATEWAYS = ['https://arweave.net/'] as const;

export function ipfsUrls(cid: string): string[] {
  const clean = cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '');
  return IPFS_GATEWAYS.map((gateway) => `${gateway}${clean}`);
}

export function arweaveUrls(id: string): string[] {
  const clean = id.replace(/^ar:\/\//, '');
  return ARWEAVE_GATEWAYS.map((gateway) => `${gateway}${clean}`);
}

/** Recognises the content-addressed forms that appear in token metadata. */
export function parseContentAddress(uri: string): { kind: 'ipfs' | 'arweave'; id: string } | null {
  if (uri.startsWith('ipfs://')) return { kind: 'ipfs', id: uri.slice('ipfs://'.length) };
  if (uri.startsWith('ar://')) return { kind: 'arweave', id: uri.slice('ar://'.length) };
  const ipfsPath = /\/ipfs\/([A-Za-z0-9]+)/.exec(uri);
  if (ipfsPath?.[1]) return { kind: 'ipfs', id: ipfsPath[1] };
  return null;
}
