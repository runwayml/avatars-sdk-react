import { describe, expect, it, mock } from 'bun:test';
import { TranscriptAccumulator } from './transcript-accumulator';

describe('TranscriptAccumulator', () => {
  it('starts with empty entries', () => {
    const acc = new TranscriptAccumulator();
    expect(acc.entries).toEqual([]);
  });

  it('ingests native segments and emits update', () => {
    const acc = new TranscriptAccumulator();
    const handler = mock();
    acc.on('update', handler);

    acc.ingestNative(
      [{ id: 'seg-1', text: 'Hello', final: true }],
      'avatar',
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(acc.entries).toHaveLength(1);
    expect(acc.entries[0]).toMatchObject({
      id: 'seg-1',
      text: 'Hello',
      final: true,
      participantIdentity: 'avatar',
      channel: 'native',
    });
  });

  it('deduplicates segments by id', () => {
    const acc = new TranscriptAccumulator();
    acc.ingestNative([{ id: 'seg-1', text: 'Hel', final: false }], 'avatar');
    acc.ingestNative([{ id: 'seg-1', text: 'Hello', final: true }], 'avatar');

    expect(acc.entries).toHaveLength(1);
    expect(acc.entries[0].text).toBe('Hello');
    expect(acc.entries[0].final).toBe(true);
  });

  it('skips non-final segments when interim is false', () => {
    const acc = new TranscriptAccumulator({ interim: false });
    acc.ingestNative([{ id: 'seg-1', text: 'Hel', final: false }], 'avatar');

    expect(acc.entries).toHaveLength(0);
  });

  it('includes non-final segments when interim is true', () => {
    const acc = new TranscriptAccumulator({ interim: true });
    acc.ingestNative([{ id: 'seg-1', text: 'Hel', final: false }], 'avatar');

    expect(acc.entries).toHaveLength(1);
  });

  it('caps entries at bufferSize', () => {
    const acc = new TranscriptAccumulator({ bufferSize: 2 });

    acc.ingestNative([{ id: 'a', text: 'First', final: true }], 'avatar');
    acc.ingestNative([{ id: 'b', text: 'Second', final: true }], 'avatar');
    acc.ingestNative([{ id: 'c', text: 'Third', final: true }], 'avatar');

    expect(acc.entries).toHaveLength(2);
    expect(acc.entries[0].id).toBe('b');
    expect(acc.entries[1].id).toBe('c');
  });

  it('ingests data channel segment arrays', () => {
    const acc = new TranscriptAccumulator();
    const payload = new TextEncoder().encode(
      JSON.stringify({
        type: 'transcription',
        segments: [{ id: 'dc-1', text: 'Hi there', final: true }],
      }),
    );

    acc.ingestDataChannel(payload, 'worker:avatar');

    expect(acc.entries).toHaveLength(1);
    expect(acc.entries[0]).toMatchObject({
      id: 'dc-1',
      text: 'Hi there',
      channel: 'custom',
    });
  });

  it('ingests flat delta transcriptions', () => {
    const acc = new TranscriptAccumulator({ interim: true });
    const encode = (obj: object) =>
      new TextEncoder().encode(JSON.stringify(obj));

    acc.ingestDataChannel(
      encode({ type: 'transcription', role: 'assistant', turn: 0, text: 'Hel' }),
      'worker:avatar',
    );
    acc.ingestDataChannel(
      encode({ type: 'transcription', role: 'assistant', turn: 0, text: 'lo' }),
      'worker:avatar',
    );

    expect(acc.entries).toHaveLength(1);
    expect(acc.entries[0].text).toBe('Hello');
  });

  it('dispose clears state and removes listeners', () => {
    const acc = new TranscriptAccumulator();
    const handler = mock();
    acc.on('update', handler);

    acc.ingestNative([{ id: 'a', text: 'Hi', final: true }], 'avatar');
    expect(acc.entries).toHaveLength(1);

    acc.dispose();
    expect(acc.entries).toHaveLength(0);

    acc.ingestNative([{ id: 'b', text: 'Bye', final: true }], 'avatar');
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
