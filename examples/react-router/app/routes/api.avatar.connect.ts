import Runway from '@runwayml/sdk';
import { consumeSession } from '@runwayml/avatars-react/api';
import { RunwayRealtime } from '../../runway-realtime';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });
const realtime = new RunwayRealtime(client);

export async function action({ request }: { request: Request }) {
  const { avatarId, customAvatarId } = await request.json();

  const avatar = customAvatarId
    ? { type: 'custom' as const, customId: customAvatarId }
    : { type: 'runway-preset' as const, presetId: avatarId };

  const { id: sessionId } = await realtime.create({
    model: 'gwm1_avatars',
    avatar,
  });

  const { sessionKey } = await realtime.waitForReady(sessionId);
  const { url, token, roomName } = await consumeSession({ sessionId, sessionKey });

  return Response.json({
    sessionId,
    serverUrl: url,
    token,
    roomName,
  });
}
