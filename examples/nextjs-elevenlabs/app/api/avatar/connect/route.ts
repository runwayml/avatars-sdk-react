import { createElevenLabsSession } from '@runwayml/avatars-react/api';

const DEFAULT_RUNWAY_API_BASE_URL = 'https://api.dev.runwayml.com';

const REQUIRED_ENV = [
  'RUNWAYML_API_SECRET',
  'RUNWAY_AVATAR_ID',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_AGENT_ID',
] as const;

function missingEnvResponse(name: (typeof REQUIRED_ENV)[number]) {
  console.error(`[avatar/connect] ${name} is not set`);
  return Response.json({ error: `${name} is not set` }, { status: 500 });
}

export async function POST() {
  for (const name of REQUIRED_ENV) {
    if (!process.env[name]) return missingEnvResponse(name);
  }

  const baseUrl = process.env.RUNWAY_API_BASE_URL ?? DEFAULT_RUNWAY_API_BASE_URL;

  console.info('[avatar/connect] creating session', {
    baseUrl,
    avatarId: process.env.RUNWAY_AVATAR_ID,
    agentId: process.env.ELEVENLABS_AGENT_ID,
  });

  try {
    const session = await createElevenLabsSession({
      runwayApiSecret: process.env.RUNWAYML_API_SECRET!,
      avatarId: process.env.RUNWAY_AVATAR_ID!,
      elevenLabsApiKey: process.env.ELEVENLABS_API_KEY!,
      elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID!,
      baseUrl,
    });

    console.info('[avatar/connect] session ready', {
      sessionId: session.sessionId,
    });

    return Response.json(session);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Session creation failed';
    console.error('[avatar/connect]', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
