import Runway from '@runwayml/sdk';
import type { RealtimeSessionCreateParams } from '@runwayml/sdk/resources/realtime-sessions';
import { createRpcHandler, type RpcHandler } from '@runwayml/avatars-node-rpc';
import { getScores, getStandings, getNews, getLeaders } from '@/lib/sports-api';
import { SPORTS_PERSONALITY, SPORTS_START_SCRIPT } from '@/lib/personality';

export const runtime = 'nodejs';

const client = new Runway();

const activeHandlers = new Map<string, RpcHandler>();

let callSequence = 0;

function timed<T extends Record<string, unknown>>(
  name: string,
  fn: (args: T) => Promise<unknown>,
) {
  return async (args: T) => {
    const seq = ++callSequence;
    const start = performance.now();
    console.log(`[rpc #${seq}] ▶ ${name} called — args: ${JSON.stringify(args)}`);

    const result = await fn(args);

    const elapsed = (performance.now() - start).toFixed(0);
    const resultSize = JSON.stringify(result).length;
    console.log(
      `[rpc #${seq}] ◀ ${name} done — ${elapsed}ms (${resultSize} bytes returned to model)`,
    );
    return result;
  };
}

const rpcTools: RealtimeSessionCreateParams['tools'] = [
  {
    type: 'backend_rpc',
    name: 'get_scores',
    description:
      'Get current/recent game scores for a league. Returns game matchups, scores, and status.',
    parameters: [
      { name: 'league', type: 'string', description: 'League abbreviation: NFL, NBA, MLB, NHL, or MLS' },
    ],
    timeoutSeconds: 8,
  },
  {
    type: 'backend_rpc',
    name: 'get_standings',
    description: 'Get league standings with wins and losses by division/conference.',
    parameters: [
      { name: 'league', type: 'string', description: 'League abbreviation: NFL, NBA, MLB, NHL, or MLS' },
    ],
    timeoutSeconds: 8,
  },
  {
    type: 'backend_rpc',
    name: 'get_news',
    description: 'Get the latest 3 news headlines for a league.',
    parameters: [
      { name: 'league', type: 'string', description: 'League abbreviation: NFL, NBA, MLB, NHL, or MLS' },
    ],
    timeoutSeconds: 8,
  },
  {
    type: 'backend_rpc',
    name: 'get_leaders',
    description: 'Get statistical leaders for a league (top scorers, passers, etc.).',
    parameters: [
      { name: 'league', type: 'string', description: 'League abbreviation: NFL, NBA, MLB, NHL, or MLS' },
      { name: 'season', type: 'string', description: 'Season year (e.g. "2025"). Defaults to current season.' },
    ],
    timeoutSeconds: 8,
  },
];

export async function POST(req: Request) {
  try {
    const { avatarId } = (await req.json()) as { avatarId: string };

    const { id: sessionId } = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'custom', avatarId },
      tools: rpcTools,
      personality: SPORTS_PERSONALITY,
      startScript: SPORTS_START_SCRIPT,
    });

    const session = await pollSessionUntilReady(sessionId);

    const handler = await createRpcHandler({
      apiKey: process.env.RUNWAYML_API_SECRET!,
      sessionId,
      tools: {
        get_scores: timed('get_scores', async (args) => {
          const league = typeof args.league === 'string' ? args.league : 'nba';
          return getScores(league);
        }),
        get_standings: timed('get_standings', async (args) => {
          const league = typeof args.league === 'string' ? args.league : 'nba';
          return getStandings(league);
        }),
        get_news: timed('get_news', async (args) => {
          const league = typeof args.league === 'string' ? args.league : 'nba';
          return getNews(league);
        }),
        get_leaders: timed('get_leaders', async (args) => {
          const league = typeof args.league === 'string' ? args.league : 'nba';
          const season = typeof args.season === 'string' ? args.season : undefined;
          return getLeaders(league, season);
        }),
      },
      onDisconnected: () => activeHandlers.delete(sessionId),
      onError: (error: Error) => console.error('[rpc] Handler error:', error.message),
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
