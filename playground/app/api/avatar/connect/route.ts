import Runway from '@runwayml/sdk';
import { RunwayRealtime } from '../../../../runway-realtime';

export async function POST(req: Request) {
  const { avatarId, customAvatarId, apiKey } = await req.json();

  if (!apiKey || typeof apiKey !== 'string') {
    return Response.json(
      { error: 'API key is required' },
      { status: 400 }
    );
  }

  try {
    const client = new Runway({ apiKey });
    const realtime = new RunwayRealtime(client);

    const avatar = customAvatarId
      ? { type: 'custom' as const, avatarId: customAvatarId }
      : { type: 'runway-preset' as const, presetId: avatarId };

    const { id: sessionId } = await realtime.create({
      model: 'gwm1_avatars',
      avatar,
    });

    const { sessionKey } = await realtime.waitForReady(sessionId);

    return Response.json({ sessionId, sessionKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    const isAuthError = message.toLowerCase().includes('unauthorized') || 
                        message.toLowerCase().includes('invalid') ||
                        message.toLowerCase().includes('api key');
    
    return Response.json(
      { error: isAuthError ? 'Invalid API key' : message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
