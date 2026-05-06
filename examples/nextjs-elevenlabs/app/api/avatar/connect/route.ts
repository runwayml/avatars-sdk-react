import {
  createElevenLabsSession,
  consumeSession,
} from '@runwayml/avatars-react/api';

export async function POST() {
  const { sessionId, sessionKey } = await createElevenLabsSession({
    runwayApiSecret: process.env.RUNWAYML_API_SECRET!,
    avatarId: process.env.RUNWAY_AVATAR_ID!,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY!,
    agentId: process.env.ELEVENLABS_AGENT_ID!,
  });

  const credentials = await consumeSession({ sessionId, sessionKey });

  return Response.json(credentials);
}
