'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Artwork, Capability, ExperienceTier, Pathway, Room } from './hud-types';

/**
 * The only interface inside the museum (§05: the UI should disappear).
 *
 * Where you are, how to move, a way out, and a way to change the terms of the visit.
 * Nothing overlaps a wall where work hangs, and nothing is hover-only (§63).
 */
export function MuseumHud({
  room,
  tier,
  capability,
  hovered,
  audioEnabled,
  tour,
  stopIndex,
  stopCount,
  onAudioToggle,
  onTierChange,
  onStop,
  onEndTour,
}: {
  room: Room | null;
  tier: ExperienceTier;
  capability: Capability;
  hovered: Artwork | null;
  audioEnabled: boolean;
  tour: Pathway | null;
  stopIndex: number;
  stopCount: number;
  onAudioToggle: () => void;
  onTierChange: (tier: ExperienceTier) => void;
  onStop: (index: number) => void;
  onEndTour: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const guided = tier === 'guided-3d';

  return (
    <>
      {/* Where you are */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--hon-space-5)',
          left: 'var(--hon-gutter)',
          display: 'grid',
          gap: '0.2rem',
          pointerEvents: 'none',
        }}
      >
        <span className="hon-label" style={{ color: 'var(--hon-quiet)' }}>
          House of Nucci
        </span>
        <span className="hon-title" style={{ fontSize: '1.4rem' }}>
          {room?.name ?? 'The House'}
        </span>
        {room?.subtitle ? <span className="hon-label">{room.subtitle}</span> : null}
      </div>

      {/* Ways out and terms of the visit */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--hon-space-5)',
          right: 'var(--hon-gutter)',
          display: 'flex',
          gap: 'var(--hon-space-4)',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <button type="button" className="hon-action" onClick={onAudioToggle} aria-pressed={audioEnabled}>
          {audioEnabled ? 'Artwork audio on' : 'Enable artwork audio'}
        </button>
        <button type="button" className="hon-action" onClick={() => setShowHelp((value) => !value)}>
          {showHelp ? 'Hide controls' : 'Controls'}
        </button>
        <Link href="/collection" className="hon-action">
          Leave the museum
        </Link>
      </div>

      {showHelp ? (
        <div
          style={{
            position: 'absolute',
            top: '4.6rem',
            right: 'var(--hon-gutter)',
            width: 'min(22rem, calc(100vw - 2 * var(--hon-gutter)))',
            border: '1px solid var(--hon-edge-strong)',
            background: 'color-mix(in srgb, var(--hon-concrete) 92%, transparent)',
            padding: 'var(--hon-space-4)',
            display: 'grid',
            gap: 'var(--hon-space-3)',
          }}
        >
          <p className="hon-label">Moving through the House</p>
          <ul className="hon-prose" style={{ fontSize: 'var(--hon-size-small)', display: 'grid', gap: 'var(--hon-space-2)' }}>
            {capability.coarsePointer ? (
              <>
                <li>Drag to look around.</li>
                <li>Tap the floor to walk there.</li>
                <li>Tap a work to open its record.</li>
              </>
            ) : (
              <>
                <li>W A S D or the arrow keys to walk.</li>
                <li>Drag to look around, or double-click to look with the mouse freely.</li>
                <li>Click the floor to walk there; click a work to open its record.</li>
              </>
            )}
          </ul>
          <div style={{ borderTop: '1px solid var(--hon-edge)', paddingTop: 'var(--hon-space-3)', display: 'grid', gap: 'var(--hon-space-2)' }}>
            <p className="hon-label">How this device is being used</p>
            <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)' }}>
              {TIER_COPY[tier]} <span className="hon-quiet">({capability.reason}.)</span>
            </p>
            <div style={{ display: 'flex', gap: 'var(--hon-space-3)', flexWrap: 'wrap' }}>
              {(['full-3d', 'optimized-3d', 'guided-3d'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className="hon-action"
                  aria-pressed={tier === option}
                  onClick={() => onTierChange(option)}
                >
                  {TIER_LABEL[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* The work under the cursor, named the way a wall label names it */}
      {hovered ? (
        <div
          style={{
            position: 'absolute',
            bottom: guided || stopCount > 0 ? '7.5rem' : 'var(--hon-space-6)',
            left: 'var(--hon-gutter)',
            display: 'grid',
            gap: '0.15rem',
            pointerEvents: 'none',
            maxWidth: 'min(28rem, 80vw)',
          }}
        >
          <span className="hon-title" style={{ fontSize: '1.15rem' }}>
            {hovered.displayTitle ?? hovered.title}
          </span>
          <span className="hon-label">
            {hovered.medium}
            {hovered.year ? ` · ${hovered.year}` : ''}
          </span>
        </div>
      ) : null}

      {/* Guided movement: always available, required only in guided tier */}
      {stopCount > 0 ? (
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--hon-space-5)',
            left: 'var(--hon-gutter)',
            right: 'var(--hon-gutter)',
            display: 'flex',
            gap: 'var(--hon-space-4)',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            borderTop: '1px solid var(--hon-edge)',
            paddingTop: 'var(--hon-space-3)',
          }}
        >
          <span className="hon-label">
            {tour ? tour.title : room?.name}
            {' · '}
            {Math.min(stopIndex + 1, stopCount)} of {stopCount}
          </span>
          <div style={{ display: 'flex', gap: 'var(--hon-space-4)' }}>
            <button
              type="button"
              className="hon-action"
              onClick={() => onStop(Math.max(0, stopIndex - 1))}
              disabled={stopIndex === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="hon-action"
              onClick={() => onStop(Math.min(stopCount - 1, stopIndex + 1))}
              disabled={stopIndex >= stopCount - 1}
            >
              {guided ? 'Next work' : 'Walk me to the next work'}
            </button>
            {tour ? (
              <button type="button" className="hon-action" onClick={onEndTour}>
                Leave the tour
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

const TIER_LABEL: Record<ExperienceTier, string> = {
  'full-3d': 'Full',
  'optimized-3d': 'Optimised',
  'guided-3d': 'Guided',
  'archive-2d': 'Archive',
};

const TIER_COPY: Record<ExperienceTier, string> = {
  'full-3d': 'Full detail, free movement.',
  'optimized-3d': 'Free movement, lighter rendering to keep it smooth.',
  'guided-3d': 'You are carried between works rather than walking yourself.',
  'archive-2d': 'The archive, without 3D.',
};
