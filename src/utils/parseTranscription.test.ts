import { describe, expect, it } from 'bun:test';
import {
  tryDecodeJSON,
  tryParseFlatDelta,
  tryParseSegmentArray,
} from './parseTranscription';

const encode = (obj: unknown) =>
  new TextEncoder().encode(JSON.stringify(obj));

describe('tryDecodeJSON', () => {
  it('decodes a valid JSON object payload', () => {
    const result = tryDecodeJSON(encode({ type: 'transcription', text: 'hi' }));
    expect(result).toEqual({ type: 'transcription', text: 'hi' });
  });

  it('returns null for non-JSON payloads', () => {
    expect(tryDecodeJSON(new Uint8Array([0xff, 0xfe]))).toBeNull();
  });

  it('returns null for JSON arrays', () => {
    expect(tryDecodeJSON(new TextEncoder().encode('[1,2,3]'))).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(tryDecodeJSON(new Uint8Array([]))).toBeNull();
  });
});

describe('tryParseFlatDelta', () => {
  it('parses a Runway flat transcription delta', () => {
    const result = tryParseFlatDelta({
      type: 'transcription',
      role: 'assistant',
      turn: 0,
      text: ' hello',
    });
    expect(result).toEqual({ role: 'assistant', turn: 0, textDelta: ' hello' });
  });

  it('parses user role deltas', () => {
    const result = tryParseFlatDelta({
      type: 'transcription',
      role: 'user',
      turn: 1,
      text: 'How are you?',
    });
    expect(result).toEqual({
      role: 'user',
      turn: 1,
      textDelta: 'How are you?',
    });
  });

  it('defaults role to assistant and turn to 0 when missing', () => {
    const result = tryParseFlatDelta({ type: 'transcription', text: 'hi' });
    expect(result).toEqual({ role: 'assistant', turn: 0, textDelta: 'hi' });
  });

  it('returns null when type is not transcription', () => {
    expect(
      tryParseFlatDelta({ type: 'client_event', text: 'hi' }),
    ).toBeNull();
  });

  it('returns null when text is missing', () => {
    expect(
      tryParseFlatDelta({ type: 'transcription', role: 'assistant', turn: 0 }),
    ).toBeNull();
  });
});

describe('tryParseSegmentArray', () => {
  it('parses a segments array with explicit type', () => {
    const result = tryParseSegmentArray({
      type: 'transcription',
      segments: [{ id: 'seg-1', text: 'Hello world', final: true }],
    });
    expect(result).toEqual([
      {
        id: 'seg-1',
        text: 'Hello world',
        final: true,
        participantIdentity: 'unknown',
      },
    ]);
  });

  it('parses segments without a type field', () => {
    const result = tryParseSegmentArray({
      segments: [{ id: 'seg-2', text: 'test' }],
    });
    expect(result).toHaveLength(1);
    expect(result?.[0].id).toBe('seg-2');
    expect(result?.[0].final).toBe(true);
  });

  it('uses participant identity when provided', () => {
    const participant = { identity: 'agent-123' } as { identity: string };
    const result = tryParseSegmentArray(
      { segments: [{ id: 'seg-3', text: 'hi' }] },
      participant,
    );
    expect(result?.[0].participantIdentity).toBe('agent-123');
  });

  it('respects participantIdentity on individual segments', () => {
    const result = tryParseSegmentArray({
      segments: [
        { id: 'seg-4', text: 'yo', participantIdentity: 'user-456' },
      ],
    });
    expect(result?.[0].participantIdentity).toBe('user-456');
  });

  it('handles nested data.segments shape', () => {
    const result = tryParseSegmentArray({
      type: 'transcript',
      data: { segments: [{ id: 'seg-5', text: 'nested' }] },
    });
    expect(result).toHaveLength(1);
    expect(result?.[0].text).toBe('nested');
  });

  it('returns null for non-transcript type', () => {
    expect(
      tryParseSegmentArray({
        type: 'client_event',
        segments: [{ id: 's', text: 't' }],
      }),
    ).toBeNull();
  });

  it('returns null when no segments array exists', () => {
    expect(
      tryParseSegmentArray({ type: 'transcription', text: 'flat delta' }),
    ).toBeNull();
  });

  it('skips malformed segment items', () => {
    const result = tryParseSegmentArray({
      segments: [
        { id: 'good', text: 'valid' },
        { noId: true, text: 'bad' },
        null,
        'string',
      ],
    });
    expect(result).toHaveLength(1);
    expect(result?.[0].id).toBe('good');
  });

  it('returns null when all segments are malformed', () => {
    expect(
      tryParseSegmentArray({ segments: [{ noId: true }] }),
    ).toBeNull();
  });
});
