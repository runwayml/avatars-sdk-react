'use client';

/**
 * AudioRenderer is no longer needed — the core AvatarSession auto-plays
 * remote audio via a hidden <audio> element. This component is kept as
 * a no-op for backwards compatibility.
 */
export function AudioRenderer() {
  return null;
}
