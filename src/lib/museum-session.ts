'use client';

/**
 * SESSION PRESERVATION (§53). A visitor who steps out of the museum to read an artwork
 * record comes back to where they were standing — same room, same position, same
 * heading, same tour state. Stored per-tab so two windows do not fight.
 */
const STORAGE_KEY = 'house-of-nucci.museum-session.v1';

export interface MuseumSession {
  roomSlug: string;
  position: [number, number, number];
  heading: number;
  pitch: number;
  tourPathwaySlug: string | null;
  tourStopIndex: number;
  audioEnabled: boolean;
  updatedAt: string;
}

export function loadSession(): MuseumSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MuseumSession>;
    if (
      typeof parsed.roomSlug !== 'string' ||
      !Array.isArray(parsed.position) ||
      parsed.position.length !== 3 ||
      typeof parsed.heading !== 'number'
    ) {
      return null;
    }
    return {
      roomSlug: parsed.roomSlug,
      position: parsed.position as [number, number, number],
      heading: parsed.heading,
      pitch: typeof parsed.pitch === 'number' ? parsed.pitch : 0,
      tourPathwaySlug: typeof parsed.tourPathwaySlug === 'string' ? parsed.tourPathwaySlug : null,
      tourStopIndex: typeof parsed.tourStopIndex === 'number' ? parsed.tourStopIndex : 0,
      audioEnabled: parsed.audioEnabled === true,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveSession(session: Omit<MuseumSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...session, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Nothing here is essential; the visitor simply starts at the entrance.
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
