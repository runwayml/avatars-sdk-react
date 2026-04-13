'use client';

import { useRoomContext } from '@livekit/components-react';
import type { Participant, TranscriptionSegment } from 'livekit-client';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import type { TranscriptionEntry } from '../types';

export interface UseTranscriptOptions {
  /** Include interim (non-final) segments. Default: `false` */
  interim?: boolean;
  /** Max segments to retain. Default: `100` */
  bufferSize?: number;
}

const DEFAULT_BUFFER_SIZE = 100;

/**
 * Hook that returns an accumulated, deduplicated transcript from the session.
 *
 * Segments are upserted by `id` — when LiveKit re-sends a segment (interim →
 * final), the existing entry is updated in-place rather than duplicated.
 * The returned array is capped at `bufferSize` (default 100) most-recent
 * entries to prevent unbounded growth in long sessions.
 *
 * Must be used within an AvatarSession or AvatarCall component.
 *
 * @example
 * ```tsx
 * function TranscriptOverlay() {
 *   const transcript = useTranscript();
 *   return (
 *     <ul>
 *       {transcript.map((entry) => (
 *         <li key={entry.id}>{entry.participantIdentity}: {entry.text}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useTranscript(
  options?: UseTranscriptOptions,
): Array<TranscriptionEntry> {
  const room = useRoomContext();
  const bufferSize = options?.bufferSize ?? DEFAULT_BUFFER_SIZE;

  const interimRef = useRef(options?.interim ?? false);
  interimRef.current = options?.interim ?? false;

  const [entries, setEntries] = useState<Array<TranscriptionEntry>>([]);
  const mapRef = useRef(new Map<string, TranscriptionEntry>());

  useEffect(() => {
    mapRef.current = new Map();
    setEntries([]);

    function handleTranscription(
      segments: Array<TranscriptionSegment>,
      participant?: Participant,
    ) {
      const identity = participant?.identity ?? 'unknown';
      let changed = false;

      for (const segment of segments) {
        if (!interimRef.current && !segment.final) continue;

        mapRef.current.set(segment.id, {
          id: segment.id,
          text: segment.text,
          final: segment.final,
          participantIdentity: identity,
        });
        changed = true;
      }

      if (changed) {
        const values = Array.from(mapRef.current.values());
        setEntries(
          values.length > bufferSize ? values.slice(-bufferSize) : values,
        );
      }
    }

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, bufferSize]);

  return entries;
}
