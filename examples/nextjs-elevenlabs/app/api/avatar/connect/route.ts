import { createElevenLabsSession } from '@runwayml/avatars-react/api';

const DEFAULT_RUNWAY_API_BASE_URL = 'https://api.dev.runwayml.com';

export async function POST() {
  const baseUrl = process.env.RUNWAY_API_BASE_URL ?? DEFAULT_RUNWAY_API_BASE_URL;

  const { sessionId, sessionKey } = await createElevenLabsSession({
    runwayApiSecret: process.env.RUNWAYML_API_SECRET!,
    avatarId: process.env.RUNWAY_AVATAR_ID!,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY!,
    agentId: process.env.ELEVENLABS_AGENT_ID!,
    baseUrl,
  });

  return Response.json({ sessionId, sessionKey, baseUrl });
}
