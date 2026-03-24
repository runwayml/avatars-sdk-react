import Runway from '@runwayml/sdk';
import { clientEventTools } from '@/lib/avatar-tools';
import {
  DEFAULT_TRIVIA_PERSONALITY,
  DEFAULT_TRIVIA_START_SCRIPT,
} from '@/lib/trivia-personality';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json() as { avatarId: string };

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'custom' as const, avatarId },
    // These fields require the client_event tools API feature.
    // They're typed as `any` until the SDK ships the updated types.
    tools: clientEventTools,
    personality: DEFAULT_TRIVIA_PERSONALITY,
    startScript: DEFAULT_TRIVIA_START_SCRIPT,
  } as any);

  const session = await pollSessionUntilReady(sessionId);

  return Response.json({ sessionId, sessionKey: session.sessionKey });
}

async function pollSessionUntilReady(sessionId: string) {
  const TIMEOUT_MS = 30_000;
  const POLL_INTERVAL_MS = 1_000;
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);

    if (session.status === 'READY') return session;

    if (session.status === 'COMPLETED' || session.status === 'FAILED' || session.status === 'CANCELLED') {
      throw new Error(`Session ${session.status.toLowerCase()} before becoming ready`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Session creation timed out');
}
