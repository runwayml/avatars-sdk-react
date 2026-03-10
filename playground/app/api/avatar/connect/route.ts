import Runway from '@runwayml/sdk';

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

    const avatar = customAvatarId
      ? { type: 'custom' as const, avatarId: customAvatarId }
      : { type: 'runway-preset' as const, presetId: avatarId };

    const { id: sessionId } = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar,
    });

    const TIMEOUT_MS = 30_000;
    const POLL_INTERVAL_MS = 1_000;
    const deadline = Date.now() + TIMEOUT_MS;

    while (Date.now() < deadline) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      if (session.status === 'READY') {
        return Response.json({ sessionId, sessionKey: session.sessionKey });
      }

      if (session.status === 'COMPLETED' || session.status === 'FAILED' || session.status === 'CANCELLED') {
        throw new Error(`Session ${session.status.toLowerCase()} before becoming ready`);
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error('Session creation timed out');
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
