'use client';

import { useRoomContext } from '@livekit/components-react';
import type { Participant, TranscriptionSegment } from 'livekit-client';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef } from 'react';
import type { TranscriptionHandler } from '../types';
import {
  tryDecodeJSON,
  tryParseFlatDelta,
  tryParseSegmentArray,
} from '../utils/parseTranscription';

/**
 * Hook to listen for transcription events from the session.
 *
 * Fires the handler for each transcription segment received. By default,
 * only final segments are delivered. Pass `{ interim: true }` to also
 * receive partial/streaming segments.
 *
 * Listens to both native `RoomEvent.TranscriptionReceived` and data-channel
 * JSON (`RoomEvent.DataReceived`) so transcripts work regardless of which
 * transport the backend uses.
 *
 * Must be used within an AvatarSession, AvatarProvider, or AvatarCall component.
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

  const flatAccRef = useRef(new Map<string, string>());

  useEffect(() => {
    flatAccRef.current.clear();

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

    function handleDataReceived(
      payload: Uint8Array,
      participant?: Participant,
    ) {
      const json = tryDecodeJSON(payload);
      if (!json) return;

      const segments = tryParseSegmentArray(json, participant);
      if (segments) {
        for (const entry of segments) {
          if (!interimRef.current && !entry.final) continue;
          handlerRef.current(entry);
        }
        return;
      }

      const delta = tryParseFlatDelta(json);
      if (delta) {
        const identity = participant?.identity ?? 'unknown';
        const accKey = `runway-transcription-${delta.role}-${delta.turn}`;
        const prev = flatAccRef.current.get(accKey) ?? '';
        const nextText = prev + delta.textDelta;
        flatAccRef.current.set(accKey, nextText);
        handlerRef.current({
          id: accKey,
          text: nextText,
          final: false,
          participantIdentity: identity,
        });
      }
    }

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);
}
