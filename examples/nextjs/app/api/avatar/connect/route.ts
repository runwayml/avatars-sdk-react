import Runway from '@runwayml/sdk';
import { RunwayRealtime } from '../../../../runway-realtime';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });
const realtime = new RunwayRealtime(client);

export async function POST(req: Request) {
  const { avatarId, customAvatarId } = await req.json();

  const avatar = customAvatarId
    ? { type: 'custom' as const, avatarId: customAvatarId }
    : { type: 'runway-preset' as const, presetId: avatarId };

  const { id: sessionId } = await realtime.create({
    model: 'gwm1_avatars',
    avatar,
  });

  const { sessionKey } = await realtime.waitForReady(sessionId);

  return Response.json({ sessionId, sessionKey });
}
