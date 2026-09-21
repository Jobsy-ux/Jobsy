'use client';

import { useSyncExternalStore } from 'react';
import { track } from '@/lib/analytics';
import { getSavedSnapshot, getServerSavedSnapshot, subscribe, toggleSaved } from '@/lib/my-house';

/**
 * MY HOUSE save (§34). Local to this browser, no account, nothing transmitted.
 *
 * The saved set is an external store the server cannot see, so it is read through
 * `useSyncExternalStore`: the server renders "Save", the browser corrects it on hydration,
 * and every save button on the page stays in step without a shared parent.
 */
export function SaveToMyHouse({ slug, title }: { slug: string; title: string }) {
  const saved = useSyncExternalStore(
    subscribe,
    () => getSavedSnapshot().some((work) => work.slug === slug),
    () => getServerSavedSnapshot().some((work) => work.slug === slug),
  );

  return (
    <button
      type="button"
      className="hon-action"
      aria-pressed={saved}
      onClick={() => {
        if (toggleSaved(slug)) track({ name: 'save_to_my_house', artwork: slug });
      }}
    >
      <span aria-hidden="true">{saved ? '◆' : '◇'}</span>
      {saved ? 'Saved to My House' : 'Save to My House'}
      <span className="hon-visually-hidden">: {title}</span>
    </button>
  );
}
