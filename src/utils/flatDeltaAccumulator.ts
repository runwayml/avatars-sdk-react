export interface FlatDelta {
  role: string;
  turn: number;
  textDelta: string;
}

export interface FlatDeltaTurn {
  id: string;
  text: string;
  participantIdentity: string;
}

export interface FlatDeltaEmission {
  /** Prior turns on the same role that were just promoted to final by this delta. */
  finalized: Array<FlatDeltaTurn>;
  /** The turn this delta belongs to — still streaming, always interim. */
  active: FlatDeltaTurn;
}

/**
 * Accumulates Runway flat-delta transcription fragments into coherent turns.
 *
 * The flat-delta protocol sends `{ role, turn, textDelta }` messages without
 * an explicit end-of-turn signal, so we infer the end: when a delta arrives
 * on a higher turn for the same role, prior turns on that role are done and
 * get emitted once as final. The active turn is always interim.
 *
 * Identity is remembered per-turn, so finalized priors are attributed to
 * whoever originally produced them — not to whoever triggered the role
 * switch.
 */
export class FlatDeltaAccumulator {
  private readonly turns = new Map<
    string,
    { text: string; participantIdentity: string }
  >();
  private readonly finalized = new Set<string>();

  ingest(delta: FlatDelta, participantIdentity: string): FlatDeltaEmission {
    const id = `runway-transcription-${delta.role}-${delta.turn}`;
    const prev = this.turns.get(id);
    const text = (prev?.text ?? '') + delta.textDelta;
    const identity = prev?.participantIdentity ?? participantIdentity;
    this.turns.set(id, { text, participantIdentity: identity });

    const prefix = `runway-transcription-${delta.role}-`;
    const finalized: Array<FlatDeltaTurn> = [];
    for (const [key, turn] of this.turns) {
      if (key === id || !key.startsWith(prefix)) continue;
      if (this.finalized.has(key)) continue;
      this.finalized.add(key);
      finalized.push({
        id: key,
        text: turn.text,
        participantIdentity: turn.participantIdentity,
      });
    }

    return {
      finalized,
      active: { id, text, participantIdentity: identity },
    };
  }

  reset(): void {
    this.turns.clear();
    this.finalized.clear();
  }
}
