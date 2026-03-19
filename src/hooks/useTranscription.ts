'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import type { Participant, TranscriptionSegment } from 'livekit-client';
import { useEffect, useRef } from 'react';
import type { TranscriptionHandler } from '../types';

/**
 * Hook to listen for transcription events from the session.
 *
 * Fires the handler for each transcription segment received. By default,
 * only final segments are delivered. Pass `{ interim: true }` to also
 * receive partial/streaming segments.
 *
 * Must be used within an AvatarSession or AvatarCall component.
 *
 * @example
 * ```tsx
 * useTranscription((entry) => {
 *   console.log(`${entry.participantIdentity}: ${entry.text}`);
 * });
 *
 * // Include interim (non-final) segments
 * useTranscription((entry) => {
 *   console.log(entry.final ? 'FINAL' : 'partial', entry.text);
 * }, { interim: true });
 * ```
 */
export function useTranscription(
  handler: TranscriptionHandler,
  options?: { interim?: boolean },
): void {
  const room = useRoomContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const interimRef = useRef(options?.interim ?? false);
  interimRef.current = options?.interim ?? false;

  useEffect(() => {
    function handleTranscription(
      segments: Array<TranscriptionSegment>,
      participant?: Participant,
    ) {
      const identity = participant?.identity ?? 'unknown';
      for (const segment of segments) {
        if (!interimRef.current && !segment.final) continue;
        handlerRef.current({
          id: segment.id,
          text: segment.text,
          final: segment.final,
          participantIdentity: identity,
        });
      }
    }

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room]);
}
