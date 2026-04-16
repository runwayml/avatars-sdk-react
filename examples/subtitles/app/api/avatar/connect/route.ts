import Runway from '@runwayml/sdk';

const client = new Runway({
  apiKey: process.env.RUNWAYML_API_SECRET,
  ...(process.env.RUNWAYML_BASE_URL && {
    baseURL: process.env.RUNWAYML_BASE_URL,
  }),
});

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  } as any);

  const session = await pollSessionUntilReady(sessionId);

  return Response.json({ sessionId, sessionKey: session.sessionKey });
}

async function pollSessionUntilReady(sessionId: string) {
  const TIMEOUT_MS = 90_000;
  const POLL_INTERVAL_MS = 2_000;
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);
    console.log(
      `[poll] ${sessionId} status=${session.status} queued=${
        'queued' in session ? (session as any).queued : '?'
      }`,
    );

    if (session.status === 'READY') return session;

    if (
      session.status === 'COMPLETED' ||
      session.status === 'FAILED' ||
      session.status === 'CANCELLED'
    ) {
      throw new Error(
        `Session ${session.status.toLowerCase()} before becoming ready`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    `Session creation timed out (session ${sessionId} never reached READY)`,
  );
}
