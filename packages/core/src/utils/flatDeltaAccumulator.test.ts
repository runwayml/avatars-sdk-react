import { describe, expect, it } from 'bun:test';
import { FlatDeltaAccumulator } from './flatDeltaAccumulator';

describe('FlatDeltaAccumulator', () => {
  it('accumulates text for the active turn and finalizes nothing on a single role', () => {
    const acc = new FlatDeltaAccumulator();

    const first = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: 'Hello' },
      'worker:1',
    );
    expect(first.finalized).toEqual([]);
    expect(first.active).toEqual({
      id: 'runway-transcription-assistant-0',
      text: 'Hello',
      participantIdentity: 'worker:1',
    });

    const second = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: ' world' },
      'worker:1',
    );
    expect(second.finalized).toEqual([]);
    expect(second.active.text).toBe('Hello world');
  });

  it('finalizes the prior turn when a new turn on the same role begins', () => {
    const acc = new FlatDeltaAccumulator();

    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'first' }, 'worker:1');
    const emission = acc.ingest(
      { role: 'assistant', turn: 1, textDelta: 'second' },
      'worker:1',
    );

    expect(emission.finalized).toEqual([
      {
        id: 'runway-transcription-assistant-0',
        text: 'first',
        participantIdentity: 'worker:1',
      },
    ]);
    expect(emission.active).toEqual({
      id: 'runway-transcription-assistant-1',
      text: 'second',
      participantIdentity: 'worker:1',
    });
  });

  it('finalizes the active turn immediately on an explicit completion marker', () => {
    const acc = new FlatDeltaAccumulator();
    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'hello ' }, 'worker:1');

    const emission = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: 'there', final: true },
      'worker:1',
    );

    expect(emission.finalized).toEqual([
      {
        id: 'runway-transcription-assistant-0',
        text: 'hello there',
        participantIdentity: 'worker:1',
      },
    ]);
    expect(emission.active).toMatchObject({
      id: 'runway-transcription-assistant-0',
      text: 'hello there',
      final: true,
    });
  });

  it('does not create a visible empty entry for an unobserved completion marker', () => {
    const acc = new FlatDeltaAccumulator();
    const emission = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: '', final: true },
      'worker:1',
    );

    expect(emission.finalized).toEqual([]);
    expect(emission.active).toMatchObject({ text: '', final: true });

    const late = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: 'late' },
      'worker:1',
    );
    expect(late.finalized).toEqual([]);
    expect(late.active).toMatchObject({ text: '', final: true });
  });

  it('does not reopen a finalized turn when a late delta arrives', () => {
    const acc = new FlatDeltaAccumulator();
    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'done', final: true }, 'worker:1');

    const late = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: ' late' },
      'worker:1',
    );
    expect(late.finalized).toEqual([]);
    expect(late.active).toMatchObject({ text: 'done', final: true });
  });

  it('does not infer finality for a newer turn from an out-of-order older delta', () => {
    const acc = new FlatDeltaAccumulator();
    acc.ingest({ role: 'assistant', turn: 2, textDelta: 'newer' }, 'worker:1');

    const older = acc.ingest(
      { role: 'assistant', turn: 1, textDelta: 'older' },
      'worker:1',
    );
    expect(older.finalized).toEqual([]);
  });

  it('finalizes roles independently when explicit completion markers arrive', () => {
    const acc = new FlatDeltaAccumulator();
    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'answer' }, 'worker:1');
    acc.ingest({ role: 'user', turn: 0, textDelta: 'question' }, 'participant:me');

    const assistant = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: '', final: true },
      'worker:1',
    );
    const duplicateAssistant = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: '', final: true },
      'worker:1',
    );
    const user = acc.ingest(
      { role: 'user', turn: 0, textDelta: '', final: true },
      'participant:me',
    );

    expect(assistant.finalized.map((entry) => entry.text)).toEqual(['answer']);
    expect(duplicateAssistant.finalized).toEqual([]);
    expect(user.finalized.map((entry) => entry.text)).toEqual(['question']);
  });

  it('emits a finalized turn exactly once across subsequent deltas', () => {
    const acc = new FlatDeltaAccumulator();

    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'a' }, 'worker:1');
    const second = acc.ingest(
      { role: 'assistant', turn: 1, textDelta: 'b' },
      'worker:1',
    );
    const third = acc.ingest(
      { role: 'assistant', turn: 1, textDelta: 'c' },
      'worker:1',
    );

    expect(second.finalized).toHaveLength(1);
    expect(third.finalized).toEqual([]);
    expect(third.active.text).toBe('bc');
  });

  it('attributes finalized priors to their original speaker, not the role-switching delta', () => {
    const acc = new FlatDeltaAccumulator();

    acc.ingest(
      { role: 'assistant', turn: 0, textDelta: 'hi' },
      'worker:original',
    );
    const emission = acc.ingest(
      { role: 'assistant', turn: 1, textDelta: 'next' },
      'worker:replacement',
    );

    expect(emission.finalized[0].participantIdentity).toBe('worker:original');
  });

  it('keeps roles independent — advancing the user role does not finalize assistant turns', () => {
    const acc = new FlatDeltaAccumulator();

    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'a' }, 'worker:1');
    const userFirst = acc.ingest(
      { role: 'user', turn: 0, textDelta: 'u' },
      'participant:me',
    );
    const userSecond = acc.ingest(
      { role: 'user', turn: 1, textDelta: 'u2' },
      'participant:me',
    );

    expect(userFirst.finalized).toEqual([]);
    expect(userSecond.finalized).toHaveLength(1);
    expect(userSecond.finalized[0].id).toBe('runway-transcription-user-0');
  });

  it('reset clears both accumulated text and finalized tracking', () => {
    const acc = new FlatDeltaAccumulator();

    acc.ingest({ role: 'assistant', turn: 0, textDelta: 'a' }, 'worker:1');
    acc.ingest({ role: 'assistant', turn: 1, textDelta: 'b' }, 'worker:1');
    acc.reset();

    const fresh = acc.ingest(
      { role: 'assistant', turn: 0, textDelta: 'x' },
      'worker:2',
    );
    expect(fresh.finalized).toEqual([]);
    expect(fresh.active).toEqual({
      id: 'runway-transcription-assistant-0',
      text: 'x',
      participantIdentity: 'worker:2',
    });
  });
});
