import Runway from '@runwayml/sdk';
import { createRpcHandler, type RpcHandler } from '@runwayml/avatars-node-rpc';
import { getWeather } from '@/lib/weather-database';
import { WEATHER_PERSONALITY, WEATHER_START_SCRIPT } from '@/lib/personality';

const client = new Runway();

const activeHandlers = new Map<string, RpcHandler>();

const rpcTools = [
  {
    type: 'backend_rpc' as const,
    name: 'get_weather',
    description: 'Get current weather conditions for a city. Returns temperature, conditions, humidity, wind speed, and daily high/low.',
    parameters: [
      { name: 'city', type: 'string', description: 'City name (e.g. "New York", "Tokyo")' },
    ],
    timeoutSeconds: 5,
  },
];

export async function POST(req: Request) {
  try {
    const { avatarId } = (await req.json()) as { avatarId: string };

    const createPayload = {
      model: 'gwm1_avatars',
      avatar: { type: 'custom' as const, avatarId },
      tools: rpcTools,
      personality: WEATHER_PERSONALITY,
      startScript: WEATHER_START_SCRIPT,
    };
    console.log('[connect] Creating session with tools:', JSON.stringify(createPayload.tools, null, 2));

    const { id: sessionId } = await client.realtimeSessions.create(createPayload as any);
    console.log('[connect] Session created:', sessionId);

    const session = await pollSessionUntilReady(sessionId);
    console.log('[connect] Session ready, connecting RPC handler...');

    const handler = await createRpcHandler({
      apiKey: process.env.RUNWAYML_API_SECRET!,
      sessionId,
      tools: {
        get_weather: async (args: Record<string, unknown>) => {
          console.log('[rpc] >>> get_weather CALLED with args:', JSON.stringify(args));
          const start = Date.now();
          const city = typeof args.city === 'string' ? args.city : 'unknown';
          const result = getWeather(city);
          const durationMs = Date.now() - start;
          console.log(`[rpc] <<< get_weather returned in ${durationMs}ms:`, JSON.stringify(result));
          return result;
        },
      },
      onConnected: () => console.log('[rpc] ✓ Handler connected to session %s — listening for tool calls', sessionId),
      onDisconnected: () => {
        console.log('[rpc] Handler disconnected from session', sessionId);
        activeHandlers.delete(sessionId);
      },
      onError: (err: Error) => console.error('[rpc] Handler error:', err.message),
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
