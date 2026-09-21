import { isAcquisitionPublic, publicationBasisLabel, type Artwork } from '@/domain';

/**
 * PROVENANCE + DETAILS (§21, §29). Technical facts live here rather than in the reading
 * experience: a visitor who wants the contract can have it, and everyone else is not
 * made to walk past it (§76). Verification states are shown honestly — unverified reads
 * as unverified, never as nothing.
 */
export function RecordDetails({ artwork }: { artwork: Artwork }) {
  const rows: Array<[string, string]> = [];

  rows.push(['Medium', artwork.medium]);
  if (artwork.year) rows.push(['Year of creation', String(artwork.year)]);
  if (artwork.editionLabel) rows.push(['Edition', artwork.editionLabel]);
  rows.push(['Type', artwork.artworkType === 'unique' ? 'Unique work (1/1)' : artwork.artworkType]);

  const canonical = artwork.media.canonical;
  if (canonical.width && canonical.height) {
    rows.push(['Dimensions', `${canonical.width} × ${canonical.height} px`]);
  }
  if (canonical.durationSeconds) rows.push(['Duration', `${canonical.durationSeconds} seconds`]);
  rows.push(['Audio', canonical.hasAudio ? 'Yes' : 'None']);

  if (isAcquisitionPublic(artwork) && artwork.acquisition?.date) {
    rows.push(['Acquired', artwork.acquisition.date]);
    if (artwork.acquisition.source) rows.push(['Acquisition source', artwork.acquisition.source]);
  }

  if (artwork.token) {
    rows.push(['Chain', artwork.token.chain]);
    rows.push(['Contract', artwork.token.contractAddress]);
    rows.push(['Token', artwork.token.tokenId]);
    if (artwork.token.tokenStandard) rows.push(['Standard', artwork.token.tokenStandard]);
    rows.push([
      'Contract verification',
      artwork.token.contractVerification === 'verified' ? 'Verified by the House' : 'Not yet verified',
    ]);
  }

  if (canonical.ipfsCid) rows.push(['IPFS', canonical.ipfsCid]);
  if (canonical.arweaveId) rows.push(['Arweave', canonical.arweaveId]);
  rows.push(['Media archived by the House', canonical.isMirrored ? 'Yes' : 'Not yet']);

  rows.push([
    'Rights',
    artwork.rights.displayRightsStatus === 'not-established'
      ? 'Not established — ownership of a work does not transfer copyright'
      : artwork.rights.displayRightsStatus,
  ]);
  if (artwork.rights.copyrightOwner) rows.push(['Copyright', artwork.rights.copyrightOwner]);
  /* Why this work is shown here at all. Stated plainly, including when the answer is
     "nobody has established that yet" (§29, docs/rights.md). */
  rows.push(['Shown on the basis of', publicationBasisLabel(artwork)]);
  if (artwork.rights.permissionRecordedOn) {
    rows.push(['Permission recorded', artwork.rights.permissionRecordedOn]);
  }

  return (
    <dl style={{ display: 'grid', gap: 0, margin: 0 }}>
      {rows.map(([term, value]) => (
        <div
          key={term}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(9rem, 14rem) 1fr',
            gap: 'var(--hon-space-4)',
            borderTop: '1px solid var(--hon-edge-faint)',
            paddingBlock: 'var(--hon-space-3)',
          }}
        >
          <dt className="hon-label">{term}</dt>
          <dd
            style={{
              margin: 0,
              fontSize: 'var(--hon-size-small)',
              color: 'var(--hon-bone-dim)',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
