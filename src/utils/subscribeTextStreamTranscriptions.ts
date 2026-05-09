import type { Room } from 'livekit-client';
import type { TranscriptionEntry } from '../types';

const LIVEKIT_TRANSCRIPTION_TOPIC = 'lk.transcription';

type TextStreamTranscriptionHandler = (entry: TranscriptionEntry) => void;

interface TextStreamState {
  didRegister: boolean;
  handlers: Set<TextStreamTranscriptionHandler>;
}

const roomStates = new WeakMap<Room, TextStreamState>();

export function subscribeTextStreamTranscriptions(
  room: Room,
  handler: TextStreamTranscriptionHandler,
): () => void {
  let state = roomStates.get(room);
  if (!state) {
    state = {
      didRegister: false,
      handlers: new Set(),
    };
    roomStates.set(room, state);

    const textStreamState = state;
    try {
      room.registerTextStreamHandler(
        LIVEKIT_TRANSCRIPTION_TOPIC,
        (reader, participantInfo) => {
          void (async () => {
            const text = await reader.readAll();
            const attributes = reader.info.attributes ?? {};
            const segmentId =
              attributes['lk.segment_id'] ??
              `text-stream-${participantInfo.identity}-${Date.now()}`;
            const entry: TranscriptionEntry = {
              id: segmentId,
              text,
              final: attributes['lk.transcription_final'] === 'true',
              participantIdentity: participantInfo.identity,
              channel: 'text-stream',
            };

            for (const currentHandler of textStreamState.handlers) {
              currentHandler(entry);
            }
          })();
        },
      );
      state.didRegister = true;
    } catch {
      // A consumer may already have registered a text-stream handler directly.
    }
  }

  state.handlers.add(handler);

  return () => {
    state.handlers.delete(handler);
    if (state.handlers.size > 0) return;

    if (state.didRegister) {
      room.unregisterTextStreamHandler(LIVEKIT_TRANSCRIPTION_TOPIC);
    }
    roomStates.delete(room);
  };
}
