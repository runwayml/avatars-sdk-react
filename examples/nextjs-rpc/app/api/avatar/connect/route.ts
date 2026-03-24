import Runway from '@runwayml/sdk';
import { createRpcHandler, type RpcHandler } from '@runwayml/avatars-node-rpc';
import { clientEventTools, backendRpcTools } from '@/lib/avatar-tools';
import { getRandomQuestion } from '@/lib/trivia-database';
import { emitRpcEvent } from '@/lib/rpc-events';
import { TRIVIA_PERSONALITY, TRIVIA_START_SCRIPT } from '@/lib/trivia-personality';

const client = new Runway();

// Module-level store so the RPC handler stays alive across requests.
// In production you'd run this as a separate long-lived process.
const activeHandlers = new Map<string, RpcHandler>();

export async function POST(req: Request) {
  try {
    const { avatarId } = (await req.json()) as { avatarId: string };

    const { id: sessionId } = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'custom' as const, avatarId },
      tools: [...clientEventTools, ...backendRpcTools],
      personality: TRIVIA_PERSONALITY,
      startScript: TRIVIA_START_SCRIPT,
    } as any);

    const session = await pollSessionUntilReady(sessionId);

    const handler = await createRpcHandler({
      apiKey: process.env.RUNWAYML_API_SECRET!,
      sessionId,
      tools: {
        lookup_trivia: async (args: Record<string, unknown>) => {
          const start = Date.now();
          const category = typeof args.category === 'string' ? args.category : undefined;
          const question = getRandomQuestion(category);
          emitRpcEvent({
            tool: 'lookup_trivia',
            args,
            result: question,
            durationMs: Date.now() - start,
            time: new Date().toISOString(),
          });
          return question;
        },
      },
      onConnected: () => console.log(`[rpc] Connected to session ${sessionId}`),
      onDisconnected: () => {
        console.log(`[rpc] Session ${sessionId} disconnected`);
        activeHandlers.delete(sessionId);
      },
      onError: (err: Error) => console.error(`[rpc] Error:`, err.message),
    });

    activeHandlers.set(sessionId, handler);

    return Response.json({ sessionId, sessionKey: session.sessionKey });
  } catch (error) {
    console.error('[connect] Failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
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
