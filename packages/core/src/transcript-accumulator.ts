import type { TranscriptionEntry } from './types';
import { FlatDeltaAccumulator } from './utils/flatDeltaAccumulator';
import {
  tryDecodeJSON,
  tryParseFlatDelta,
  tryParseSegmentArray,
} from './utils/parseTranscription';
import { Emitter } from './emitter';
import type { TranscriptOptions } from './types';

const DEFAULT_BUFFER_SIZE = 100;

type TranscriptEvents = {
  update: [entries: ReadonlyArray<TranscriptionEntry>];
};

/**
 * Stateful transcript accumulator. Deduplicates by segment `id`, caps at
 * `bufferSize`, and emits `update` on every change.
 *
 * Handles both LiveKit-style `{ segments: [...] }` and Runway flat-delta
 * `{ type: "transcription", role, turn, text }` data-channel payloads,
 * as well as native `TranscriptionReceived` segment arrays.
 */
export class TranscriptAccumulator extends Emitter<TranscriptEvents> {
  private readonly map = new Map<string, TranscriptionEntry>();
  private readonly flatAcc = new FlatDeltaAccumulator();
  private readonly interim: boolean;
  private readonly bufferSize: number;
  private snapshot: ReadonlyArray<TranscriptionEntry> = [];

  constructor(options?: TranscriptOptions) {
    super();
    this.interim = options?.interim ?? false;
    this.bufferSize = options?.bufferSize ?? DEFAULT_BUFFER_SIZE;
  }

  get entries(): ReadonlyArray<TranscriptionEntry> {
    return this.snapshot;
  }

  /**
   * Ingest a native transcription segment (from `RoomEvent.TranscriptionReceived`).
   */
  ingestNative(
    segments: ReadonlyArray<{ id: string; text: string; final: boolean }>,
    participantIdentity: string,
  ): void {
    let changed = false;
    for (const segment of segments) {
      if (!this.interim && !segment.final) continue;
      this.map.set(segment.id, {
        id: segment.id,
        text: segment.text,
        final: segment.final,
        participantIdentity,
        channel: 'native',
      });
      changed = true;
    }
    if (changed) this.flush();
  }

  /**
   * Ingest a raw data-channel payload (from `RoomEvent.DataReceived`).
   * Handles both segment arrays and flat deltas.
   */
  ingestDataChannel(
    payload: Uint8Array,
    participantIdentity: string,
  ): void {
    const json = tryDecodeJSON(payload);
    if (!json) return;

    const segments = tryParseSegmentArray(json, {
      identity: participantIdentity,
    });
    if (segments) {
      let changed = false;
      for (const entry of segments) {
        if (!this.interim && !entry.final) continue;
        this.map.set(entry.id, { ...entry, channel: 'custom' });
        changed = true;
      }
      if (changed) this.flush();
      return;
    }

    const delta = tryParseFlatDelta(json);
    if (!delta) return;

    const { finalized, active } = this.flatAcc.ingest(
      delta,
      participantIdentity,
    );

    let changed = false;
    for (const turn of finalized) {
      this.map.set(turn.id, { ...turn, final: true, channel: 'custom' });
      changed = true;
    }

    if (this.interim) {
      this.map.set(active.id, { ...active, final: false, channel: 'custom' });
      changed = true;
    }

    if (changed) this.flush();
  }

  dispose(): void {
    this.map.clear();
    this.flatAcc.reset();
    this.snapshot = [];
    this.removeAllListeners();
  }

  private flush(): void {
    const values = Array.from(this.map.values());
    this.snapshot =
      values.length > this.bufferSize
        ? values.slice(-this.bufferSize)
        : values;
    this.emit('update', this.snapshot);
  }
}
