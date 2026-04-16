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
  /**
   * Also merge transcript JSON from `RoomEvent.DataReceived` (data channel).
   * Covers LiveKit-style `{ segments: [{ id, text, … }] }` and Runway worker
   * `{ type: "transcription", role, turn, text }` streaming deltas (concatenated
   * per role+turn). Default: `true`.
   */
  mergeDataChannelSegments?: boolean;
}

const DEFAULT_BUFFER_SIZE = 100;

type DataChannelJSON = Record<string, unknown>;

function tryDecodeJSON(payload: Uint8Array): DataChannelJSON | null {
  try {
    const text = new TextDecoder().decode(payload).trim();
    if (!text.startsWith('{')) return null;
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object'
      ? (parsed as DataChannelJSON)
      : null;
  } catch {
    return null;
  }
}

/**
 * Parse LiveKit-style segment arrays: `{ segments: [{ id, text, final? }] }`
 * Also handles wrapper shapes like `{ type: "transcription", segments: [...] }`
 * and `{ data: { segments: [...] } }`.
 */
function tryParseSegmentArray(
  root: DataChannelJSON,
  participant?: Participant,
): Array<TranscriptionEntry> | null {
  const type = root.type;
  const typeAllowed =
    type === undefined ||
    type === 'transcription' ||
    type === 'transcript' ||
    type === 'voice_transcript';
  if (!typeAllowed) return null;

  let segments: unknown = root.segments;
  if (
    !Array.isArray(segments) &&
    root.data &&
    typeof root.data === 'object'
  ) {
    segments = (root.data as DataChannelJSON).segments;
  }
  if (!Array.isArray(segments)) return null;

  const identity = participant?.identity ?? 'unknown';
  const out: Array<TranscriptionEntry> = [];

  for (const item of segments) {
    if (!item || typeof item !== 'object') continue;
    const seg = item as DataChannelJSON;
    if (typeof seg.id !== 'string' || typeof seg.text !== 'string') continue;
    out.push({
      id: seg.id,
      text: seg.text,
      final: typeof seg.final === 'boolean' ? seg.final : true,
      participantIdentity:
        typeof seg.participantIdentity === 'string'
          ? seg.participantIdentity
          : identity,
    });
  }

  return out.length > 0 ? out : null;
}

/**
 * Parse Runway flat streaming deltas: `{ type: "transcription", role, turn, text }`
 * These arrive one delta at a time and are accumulated per role+turn.
 */
function tryParseFlatDelta(
  root: DataChannelJSON,
): { role: string; turn: number; textDelta: string } | null {
  if (root.type !== 'transcription') return null;
  if (typeof root.text !== 'string') return null;

  return {
    role: typeof root.role === 'string' ? root.role : 'assistant',
    turn: typeof root.turn === 'number' ? root.turn : 0,
    textDelta: root.text,
  };
}

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

  const interimRef = useRef(options?.interim ?? false);
  interimRef.current = options?.interim ?? false;

  const bufferSizeRef = useRef(options?.bufferSize ?? DEFAULT_BUFFER_SIZE);
  bufferSizeRef.current = options?.bufferSize ?? DEFAULT_BUFFER_SIZE;

  const mergeDataRef = useRef(options?.mergeDataChannelSegments ?? true);
  mergeDataRef.current = options?.mergeDataChannelSegments ?? true;

  const [entries, setEntries] = useState<Array<TranscriptionEntry>>([]);
  const mapRef = useRef(new Map<string, TranscriptionEntry>());
  const runwayFlatAccRef = useRef(new Map<string, string>());

  useEffect(() => {
    mapRef.current = new Map();
    setEntries([]);
    runwayFlatAccRef.current.clear();

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
          mapRef.current.set(entry.id, entry);
          changed = true;
        }
        if (changed) flushMap();
        return;
      }

      const delta = tryParseFlatDelta(json);
      if (delta) {
        const identity = participant?.identity ?? 'unknown';
        const accKey = `runway-transcription-${delta.role}-${delta.turn}`;
        const prev = runwayFlatAccRef.current.get(accKey) ?? '';
        const nextText = prev + delta.textDelta;
        runwayFlatAccRef.current.set(accKey, nextText);
        mapRef.current.set(accKey, {
          id: accKey,
          text: nextText,
          final: false,
          participantIdentity: identity,
        });
        flushMap();
      }
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
