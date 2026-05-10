import Runway from '@runwayml/sdk';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const runway = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export const POST: RequestHandler = async ({ request }) => {
  const { avatarId } = await request.json();

  const { id: sessionId } = await runway.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  const session = await pollUntilReady(sessionId);
  return json({ sessionId, sessionKey: session.sessionKey });
};

async function pollUntilReady(sessionId: string) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const session = await runway.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') return session;
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(session.status)) {
      throw new Error(`Session ${session.status.toLowerCase()}`);
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error('Session timed out');
}
