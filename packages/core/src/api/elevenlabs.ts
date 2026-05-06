import { DEFAULT_BASE_URL } from './config';

const ELEVENLABS_SIGNED_URL_ENDPOINT =
  'https://api.elevenlabs.io/v1/convai/conversation/get-signed-url';

const API_VERSION = '2024-11-06';

const POLL_INTERVAL_MS = 1_000;
const POLL_TIMEOUT_MS = 30_000;

export interface CreateElevenLabsSessionOptions {
  /** Runway API secret (Bearer token). */
  runwayApiSecret: string;
  /** ID of a custom avatar to render. */
  avatarId: string;
  /** ElevenLabs API key (used server-side to obtain a signed URL). */
  elevenLabsApiKey: string;
  /** ID of the ElevenLabs Conversational AI agent. */
  agentId: string;
  /** Runway API base URL. Defaults to production. */
  baseUrl?: string;
}

export interface CreateElevenLabsSessionResponse {
  sessionId: string;
  sessionKey: string;
}

/**
 * Create a Runway avatar session powered by a customer-owned ElevenLabs
 * Conversational AI agent. Handles the full server-side flow:
 *
 * 1. Fetches a signed WebSocket URL from the ElevenLabs API
 * 2. Creates a Runway realtime session with the ElevenLabs provider
 * 3. Polls until the session is READY and returns credentials
 *
 * The returned `sessionId` + `sessionKey` can be passed to `consumeSession`
 * to obtain WebRTC connection credentials for the client.
 */
export async function createElevenLabsSession(
  options: CreateElevenLabsSessionOptions,
): Promise<CreateElevenLabsSessionResponse> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  // 1. Get signed URL from ElevenLabs
  const elRes = await fetch(
    `${ELEVENLABS_SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(options.agentId)}`,
    { headers: { 'xi-api-key': options.elevenLabsApiKey } },
  );
  if (!elRes.ok) {
    const body = await elRes.text().catch(() => '');
    throw new Error(
      `Failed to get ElevenLabs signed URL: ${elRes.status} ${body}`,
    );
  }
  const { signed_url: signedUrl } = (await elRes.json()) as {
    signed_url: string;
  };

  // 2. Create Runway session with ElevenLabs provider
  const createRes = await fetch(`${baseUrl}/v1/realtime_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.runwayApiSecret}`,
      'X-Runway-Version': API_VERSION,
    },
    body: JSON.stringify({
      model: 'gwm1_avatars',
      avatar: { type: 'custom', avatarId: options.avatarId },
      provider: { type: 'elevenlabs', signedUrl },
    }),
  });
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => '');
    throw new Error(
      `Failed to create Runway session: ${createRes.status} ${body}`,
    );
  }
  const { id: sessionId } = (await createRes.json()) as { id: string };

  // 3. Poll until READY
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const pollRes = await fetch(`${baseUrl}/v1/realtime_sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${options.runwayApiSecret}`,
        'X-Runway-Version': API_VERSION,
      },
    });
    if (!pollRes.ok) {
      throw new Error(`Failed to poll session: ${pollRes.status}`);
    }

    const session = (await pollRes.json()) as {
      status: string;
      sessionKey?: string;
    };

    if (session.status === 'READY' && session.sessionKey) {
      return { sessionId, sessionKey: session.sessionKey };
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(session.status)) {
      throw new Error(
        `Session ${session.status.toLowerCase()} before becoming ready`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Session creation timed out');
}
