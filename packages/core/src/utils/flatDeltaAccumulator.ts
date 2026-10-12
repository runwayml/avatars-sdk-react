export interface FlatDelta {
  role: string;
  turn: number;
  textDelta: string;
  final?: boolean;
}

export interface FlatDeltaTurn {
  id: string;
  text: string;
  participantIdentity: string;
}

export interface FlatDeltaEmission {
  /** Prior turns on the same role that were just promoted to final by this delta. */
  finalized: Array<FlatDeltaTurn>;
  /** The turn this delta belongs to, with `final` set for completed markers. */
  active: FlatDeltaTurn & { final?: boolean };
}

/**
 * Accumulates Runway flat-delta transcription fragments into coherent turns.
 *
 * The flat-delta protocol may send an explicit `final` marker. Older workers
 * omit it, so we also infer completion when a higher turn arrives for a role.
 *
 * Identity is remembered per-turn, so finalized priors are attributed to
 * whoever originally produced them — not to whoever triggered the role
 * switch.
 */
export class FlatDeltaAccumulator {
  private readonly turns = new Map<
    string,
    { turn: number; text: string; participantIdentity: string }
  >();
  private readonly finalized = new Set<string>();

  ingest(delta: FlatDelta, participantIdentity: string): FlatDeltaEmission {
    const id = `runway-transcription-${delta.role}-${delta.turn}`;
    const prev = this.turns.get(id);

    // Final turns are immutable. This also makes duplicate final markers and
    // late deltas harmless after a turn has been committed.
    if (this.finalized.has(id)) {
      return {
        finalized: [],
        active: {
          id,
          text: prev?.text ?? '',
          participantIdentity: prev?.participantIdentity ?? participantIdentity,
          final: true,
        },
      };
    }

    const text = (prev?.text ?? '') + delta.textDelta;
    const identity = prev?.participantIdentity ?? participantIdentity;
    const hasTranscript = prev !== undefined || text.length > 0;
    if (hasTranscript) {
      this.turns.set(id, { turn: delta.turn, text, participantIdentity: identity });
    }

    const prefix = `runway-transcription-${delta.role}-`;
    const finalized: Array<FlatDeltaTurn> = [];
    const priorTurns = Array.from(this.turns.entries())
      .filter(
        ([key, turn]) =>
          key !== id &&
          key.startsWith(prefix) &&
          turn.turn < delta.turn &&
          !this.finalized.has(key),
      )
      .sort(([, first], [, second]) => first.turn - second.turn);
    for (const [key, turn] of priorTurns) {
      this.finalized.add(key);
      finalized.push({
        id: key,
        text: turn.text,
        participantIdentity: turn.participantIdentity,
      });
    }

    if (delta.final) {
      this.finalized.add(id);
      if (hasTranscript) finalized.push({ id, text, participantIdentity: identity });
    }

    return {
      finalized,
      active: {
        id,
        text,
        participantIdentity: identity,
        ...(delta.final ? { final: true } : {}),
      },
    };
  }

  reset(): void {
    this.turns.clear();
    this.finalized.clear();
  }
}
