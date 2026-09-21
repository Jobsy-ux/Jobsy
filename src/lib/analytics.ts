/**
 * Privacy-conscious analytics boundary (§69–71).
 *
 * No identifiers, no fingerprinting, no cross-site anything. This module defines the
 * event vocabulary and a transport seam; until a provider is configured it is a no-op,
 * which is the correct default for a site that requires no account and sets no cookies.
 */
export type AnalyticsEvent =
  | { name: 'homepage_view' }
  | { name: 'enter_museum'; tier: string }
  | { name: 'open_collection' }
  | { name: 'room_entered'; room: string }
  | { name: 'artwork_selected'; artwork: string; surface: 'museum' | 'archive' }
  | { name: 'artwork_detail_viewed'; artwork: string }
  | { name: 'artist_viewed'; artist: string }
  | { name: 'pathway_started'; pathway: string }
  | { name: 'pathway_completed'; pathway: string }
  | { name: 'save_to_my_house'; artwork: string }
  | { name: 'ai_guide_used'; surface: string }
  | { name: 'search_used' }
  | { name: 'outbound'; platform: string; artwork: string | null }
  | { name: 'share'; artwork: string };

type Sink = (event: AnalyticsEvent) => void;

let sink: Sink | null = null;

/** Installed once, client-side, when (and only when) a provider is configured. */
export function setAnalyticsSink(next: Sink | null): void {
  sink = next;
}

export function track(event: AnalyticsEvent): void {
  if (!sink) return;
  try {
    sink(event);
  } catch {
    // Analytics must never break a visit.
  }
}
