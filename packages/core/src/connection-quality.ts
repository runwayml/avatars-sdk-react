import type { ConnectionQuality, SessionState } from './types';

export const CONNECTION_QUALITY_SHOW_DELAY_MS = 2500;
export const CONNECTION_QUALITY_HIDE_DELAY_MS = 5000;

export function isDegradedConnectionQuality(
  quality: ConnectionQuality,
): boolean {
  return quality === 'poor' || quality === 'lost';
}

export function connectionQualityWarningMessage(
  quality: ConnectionQuality,
  sessionState?: SessionState,
  options?: { statsStressed?: boolean },
): string | null {
  if (sessionState === 'reconnecting') {
    return 'Reconnecting…';
  }
  switch (quality) {
    case 'lost':
      return 'Connection lost — check your network';
    case 'poor':
      return 'Unstable connection';
    default:
      if (options?.statsStressed) {
        return 'Slow connection';
      }
      return null;
  }
}

export function shouldShowConnectionQualityWarning({
  quality,
  sessionState,
  degradedSinceMs,
  statsDegradedSinceMs,
  stableSinceMs,
  now = Date.now(),
}: {
  quality: ConnectionQuality;
  sessionState?: SessionState;
  degradedSinceMs: number | null;
  /** Client-side WebRTC stats stress (when LiveKit quality is still good). */
  statsDegradedSinceMs?: number | null;
  stableSinceMs: number | null;
  now?: number;
}): boolean {
  if (sessionState === 'reconnecting') {
    return true;
  }

  const isLiveKitDegraded = isDegradedConnectionQuality(quality);
  const isStatsDegraded = statsDegradedSinceMs != null;

  if (isLiveKitDegraded || isStatsDegraded) {
    const sinceMs = [
      isLiveKitDegraded ? degradedSinceMs : null,
      isStatsDegraded ? statsDegradedSinceMs ?? null : null,
    ]
      .filter((value): value is number => value !== null)
      .reduce<number | null>(
        (earliest, value) =>
          earliest === null ? value : Math.min(earliest, value),
        null,
      );
    if (sinceMs === null) {
      return false;
    }
    return now - sinceMs >= CONNECTION_QUALITY_SHOW_DELAY_MS;
  }
  if (stableSinceMs !== null) {
    return now - stableSinceMs < CONNECTION_QUALITY_HIDE_DELAY_MS;
  }
  return false;
}
