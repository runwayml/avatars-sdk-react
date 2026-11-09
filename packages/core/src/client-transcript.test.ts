import { describe, expect, it } from 'bun:test';
import { Room, RoomEvent } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';
import { AvatarSession } from './client';

describe('AvatarSession transcript event routing', () => {
  it('keeps final-only transcript entries stable across role changes and late deltas', () => {
    const session = new AvatarSession('test-session');
    const room = new Room({ adaptiveStream: false, dynacast: false });
    const bindRoomEvents = (session as unknown as {
      bindRoomEvents: (room: Room) => void;
    }).bindRoomEvents;
    bindRoomEvents.call(session, room);

    const transcript = session.transcript();
    const updates: Array<Array<{ id: string; text: string; final: boolean }>> = [];
    transcript.on('update', (entries) => {
      updates.push(
        entries.map(({ id, text, final }) => ({ id, text, final })),
      );
    });

    const send = (payload: Record<string, unknown>, identity: string) => {
      room.emit(
        RoomEvent.DataReceived,
        new TextEncoder().encode(JSON.stringify(payload)),
        { identity } as RemoteParticipant,
      );
    };

    try {
      send(
        { type: 'transcription', role: 'assistant', turn: 0, text: 'Hello' },
        'worker:avatar',
      );
      expect(transcript.entries).toEqual([]);
      expect(updates).toEqual([]);

      send(
        { type: 'transcription', role: 'user', turn: 0, text: 'Hi' },
        'participant:user',
      );
      send(
        {
          type: 'transcription',
          role: 'user',
          turn: 0,
          text: '',
          final: true,
        },
        'participant:user',
      );

      expect(transcript.entries).toEqual([
        expect.objectContaining({
          id: 'runway-transcription-user-0',
          text: 'Hi',
          final: true,
          participantIdentity: 'participant:user',
        }),
      ]);

      send(
        {
          type: 'transcription',
          role: 'assistant',
          turn: 0,
          text: '',
          final: true,
        },
        'worker:avatar',
      );
      expect(transcript.entries).toEqual([
        expect.objectContaining({
          id: 'runway-transcription-user-0',
          text: 'Hi',
          final: true,
        }),
        expect.objectContaining({
          id: 'runway-transcription-assistant-0',
          text: 'Hello',
          final: true,
          participantIdentity: 'worker:avatar',
        }),
      ]);

      const callbackCountAfterFinals = updates.length;
      send(
        {
          type: 'transcription',
          role: 'assistant',
          turn: 0,
          text: '',
          final: true,
        },
        'worker:avatar',
      );
      send(
        { type: 'transcription', role: 'assistant', turn: 0, text: ' late' },
        'worker:avatar',
      );

      expect(updates).toHaveLength(callbackCountAfterFinals);
      expect(transcript.entries).toEqual([
        expect.objectContaining({
          id: 'runway-transcription-user-0',
          text: 'Hi',
          final: true,
        }),
        expect.objectContaining({
          id: 'runway-transcription-assistant-0',
          text: 'Hello',
          final: true,
        }),
      ]);
    } finally {
      transcript.dispose();
      room.removeAllListeners();
    }
  });
});
