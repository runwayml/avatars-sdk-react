import Runway from '@runwayml/sdk';

const runway = new Runway();

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const { id: sessionId } = await runway.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const session = await runway.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') {
      return Response.json({ sessionId, sessionKey: session.sessionKey });
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }

  return Response.json({ error: 'Session timed out' }, { status: 504 });
}
