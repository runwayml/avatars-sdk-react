'use client';

import { useRoomContext } from '@livekit/components-react';
import type { Participant, TranscriptionSegment } from 'livekit-client';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef } from 'react';
import type { TranscriptionHandler } from '../types';
import { FlatDeltaAccumulator } from '../utils/flatDeltaAccumulator';
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
 * transport the backend uses. Each callback entry includes `channel`: `native`
 * or `custom` accordingly.
 *
 * For Runway flat-delta transcripts (custom channel), the active turn is
 * always interim and only delivered when `interim: true`. A prior turn is
 * delivered once as `final: true` when a new turn on the same role begins.
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

  const flatAccRef = useRef(new FlatDeltaAccumulator());

  useEffect(() => {
    flatAccRef.current.reset();

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
          channel: 'native',
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
          handlerRef.current({ ...entry, channel: 'custom' });
        }
        return;
      }

      const delta = tryParseFlatDelta(json);
      if (!delta) return;

      const identity = participant?.identity ?? 'unknown';
      const { finalized, active } = flatAccRef.current.ingest(delta, identity);

      for (const turn of finalized) {
        handlerRef.current({ ...turn, final: true, channel: 'custom' });
      }

      // Active turn is still streaming — only emit when caller opted in.
      if (interimRef.current) {
        handlerRef.current({ ...active, final: false, channel: 'custom' });
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
