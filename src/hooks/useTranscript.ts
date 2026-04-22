'use client';

import { useRoomContext } from '@livekit/components-react';
import type { Participant, TranscriptionSegment } from 'livekit-client';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import type { TranscriptionEntry } from '../types';
import { FlatDeltaAccumulator } from '../utils/flatDeltaAccumulator';
import {
  tryDecodeJSON,
  tryParseFlatDelta,
  tryParseSegmentArray,
} from '../utils/parseTranscription';

export interface UseTranscriptOptions {
  /** Include interim (non-final) segments. Default: `false` */
  interim?: boolean;
  /** Max segments to retain. Default: `100` */
  bufferSize?: number;
  /**
   * Also merge transcript JSON from `RoomEvent.DataReceived` (data channel).
   * Covers LiveKit-style `{ segments: [{ id, text, … }] }` and Runway worker
   * `{ type: "transcription", role, turn, text }` streaming deltas
   * (concatenated per role+turn). When a new turn starts on the same role,
   * the prior turn is promoted to `final: true`. The active (streaming) turn
   * is always interim and only surfaced when `interim: true`.
   * Default: `true`.
   */
  mergeDataChannelSegments?: boolean;
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
 * Each entry includes `channel`: `native` for LiveKit `TranscriptionReceived`,
 * or `custom` for transcript JSON on `DataReceived`.
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

  const interimRef = useRef(options?.interim ?? false);
  interimRef.current = options?.interim ?? false;

  const bufferSizeRef = useRef(options?.bufferSize ?? DEFAULT_BUFFER_SIZE);
  bufferSizeRef.current = options?.bufferSize ?? DEFAULT_BUFFER_SIZE;

  const mergeDataRef = useRef(options?.mergeDataChannelSegments ?? true);
  mergeDataRef.current = options?.mergeDataChannelSegments ?? true;

  const [entries, setEntries] = useState<Array<TranscriptionEntry>>([]);
  const mapRef = useRef(new Map<string, TranscriptionEntry>());
  const flatAccRef = useRef(new FlatDeltaAccumulator());

  useEffect(() => {
    mapRef.current = new Map();
    setEntries([]);
    flatAccRef.current.reset();

    function flushMap() {
      const cap = bufferSizeRef.current;
      const values = Array.from(mapRef.current.values());
      setEntries(values.length > cap ? values.slice(-cap) : values);
    }

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
          channel: 'native',
        });
        changed = true;
      }

      if (changed) flushMap();
    }

    function handleDataReceived(payload: Uint8Array, participant?: Participant) {
      if (!mergeDataRef.current) return;

      const json = tryDecodeJSON(payload);
      if (!json) return;

      const segments = tryParseSegmentArray(json, participant);
      if (segments) {
        let changed = false;
        for (const entry of segments) {
          if (!interimRef.current && !entry.final) continue;
          mapRef.current.set(entry.id, { ...entry, channel: 'custom' });
          changed = true;
        }
        if (changed) flushMap();
        return;
      }

      const delta = tryParseFlatDelta(json);
      if (!delta) return;

      const identity = participant?.identity ?? 'unknown';
      const { finalized, active } = flatAccRef.current.ingest(delta, identity);

      let changed = false;
      for (const turn of finalized) {
        mapRef.current.set(turn.id, { ...turn, final: true, channel: 'custom' });
        changed = true;
      }

      // The active turn is still streaming, so it's always interim — only
      // surface it when the caller opted in with `interim: true`.
      if (interimRef.current) {
        mapRef.current.set(active.id, {
          ...active,
          final: false,
          channel: 'custom',
        });
        changed = true;
      }

      if (changed) flushMap();
    }

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  return entries;
}
