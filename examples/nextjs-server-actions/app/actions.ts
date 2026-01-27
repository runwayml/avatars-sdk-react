'use server';

import Runway from '@runwayml/sdk';
import { consumeSession } from '@runwayml/avatars-react/api';
import { RunwayRealtime } from '../runway-realtime';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });
const realtime = new RunwayRealtime(client);

export async function createAvatarSession(avatarId: string) {
  const { id: sessionId } = await realtime.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  const { sessionKey } = await realtime.waitForReady(sessionId);
  const { url, token, roomName } = await consumeSession({ sessionId, sessionKey });

  return {
    sessionId,
    serverUrl: url,
    token,
    roomName,
  };
}
