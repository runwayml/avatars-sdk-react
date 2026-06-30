import { DEFAULT_BASE_URL } from './config';
import { pollUntilReady } from './poll';

const ELEVENLABS_SIGNED_URL_ENDPOINT =
  'https://api.elevenlabs.io/v1/convai/conversation/get-signed-url';

const API_VERSION = '2024-11-06';

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
  /** Maximum time to wait for the session to become ready, in ms. */
  timeoutMs?: number;
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
 * 2. Creates a Runway realtime session with the ElevenLabs integration
 * 3. Polls until the session is READY and returns credentials
 *
 * The returned `sessionId` + `sessionKey` can be passed to `consumeSession`
 * to obtain WebRTC connection credentials for the client.
 *
 * Run this server-side only — it requires both your Runway API secret and your
 * ElevenLabs API key.
 */
export async function createElevenLabsSession(
  options: CreateElevenLabsSessionOptions,
): Promise<CreateElevenLabsSessionResponse> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const signedUrl = await fetchElevenLabsSignedUrl(options);
  const sessionId = await createRunwayElevenLabsSession({
    ...options,
    baseUrl,
    signedUrl,
  });

  return pollUntilReady({
    sessionId,
    apiKey: options.runwayApiSecret,
    baseUrl,
    timeoutMs: options.timeoutMs,
  });
}

async function fetchElevenLabsSignedUrl(
  options: Pick<CreateElevenLabsSessionOptions, 'elevenLabsApiKey' | 'agentId'>,
): Promise<string> {
  const response = await fetch(
    `${ELEVENLABS_SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(options.agentId)}`,
    { headers: { 'xi-api-key': options.elevenLabsApiKey } },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Failed to get ElevenLabs signed URL: ${response.status} ${body}`,
    );
  }

  const { signed_url: signedUrl } = (await response.json()) as {
    signed_url: string;
  };
  return signedUrl;
}

async function createRunwayElevenLabsSession(
  options: Pick<
    CreateElevenLabsSessionOptions,
    'runwayApiSecret' | 'avatarId' | 'baseUrl'
  > & { signedUrl: string },
): Promise<string> {
  const response = await fetch(
    `${options.baseUrl}/v1/realtime_sessions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.runwayApiSecret}`,
        'X-Runway-Version': API_VERSION,
      },
      body: JSON.stringify({
        model: 'gwm1_avatars',
        avatar: { type: 'custom', avatarId: options.avatarId },
        integration: { type: 'elevenlabs', signedUrl: options.signedUrl },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Failed to create Runway session (${options.baseUrl}): ${response.status} ${body}`,
    );
  }

  const { id: sessionId } = (await response.json()) as { id: string };
  return sessionId;
}
