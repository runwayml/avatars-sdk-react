import type { TranscriptionEntry } from '../types';

export type DataChannelJSON = Record<string, unknown>;

export function tryDecodeJSON(payload: Uint8Array): DataChannelJSON | null {
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
export function tryParseSegmentArray(
  root: DataChannelJSON,
  participant?: { identity: string },
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
export function tryParseFlatDelta(
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
