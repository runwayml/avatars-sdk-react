import { AvatarError } from '../error';
import { DEFAULT_BASE_URL } from './config';
import { pollUntilReady } from './poll';

const ELEVENLABS_SIGNED_URL_ENDPOINT =
  'https://api.elevenlabs.io/v1/convai/conversation/get-signed-url';

const API_VERSION = '2024-11-06';

// The only realtime avatar model. Kept internal so callers never pass it.
const AVATAR_MODEL = 'gwm1_avatars';

export interface CreateElevenLabsSessionOptions {
  /** Runway API secret (Bearer token). */
  runwayApiSecret: string;
  /** ID of a custom avatar to render. Must be visible to `runwayApiSecret`. */
  avatarId: string;
  /** ElevenLabs API key (used server-side to obtain a signed URL). */
  elevenLabsApiKey: string;
  /** ID of the ElevenLabs Conversational AI agent (e.g. `agent_…`). */
  elevenLabsAgentId: string;
  /** Runway API base URL. Defaults to production. */
  baseUrl?: string;
  /** Maximum time to wait for the session to become ready, in ms. */
  timeoutMs?: number;
}

export interface CreateElevenLabsSessionResponse {
  sessionId: string;
  sessionKey: string;
  /** Echoed back so it can be passed straight to `<AvatarCall>`. */
  avatarId: string;
  /** Resolved base URL (defaults applied) for the consume call on the client. */
  baseUrl: string;
}

/**
 * Create a Runway avatar session powered by a customer-owned ElevenLabs
 * Conversational AI agent. Handles the full server-side flow:
 *
 * 1. Fetches a signed WebSocket URL from the ElevenLabs API
 * 2. Creates a Runway realtime session with the ElevenLabs integration
 * 3. Polls until the session is READY and returns credentials
 *
 * The returned `sessionId`, `sessionKey`, `avatarId`, and `baseUrl` can be
 * passed straight to `<AvatarCall>` (or to `consumeSession` for lower-level
 * control).
 *
 * Run this server-side only — it requires both your Runway API secret and your
 * ElevenLabs API key.
 *
 * The ElevenLabs agent's **User input audio format** must be **PCM 16000Hz**
 * (ElevenLabs → agent → Advanced), otherwise the avatar receives no audio.
 *
 * @throws {AvatarError} with code `ELEVENLABS_SIGNED_URL_FAILED`,
 * `SESSION_CREATE_FAILED`, or `CONNECTION_FAILED` (poll timeout).
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

  const { sessionKey } = await pollUntilReady({
    sessionId,
    apiKey: options.runwayApiSecret,
    baseUrl,
    timeoutMs: options.timeoutMs,
  });

  return { sessionId, sessionKey, avatarId: options.avatarId, baseUrl };
}

async function fetchElevenLabsSignedUrl(
  options: Pick<
    CreateElevenLabsSessionOptions,
    'elevenLabsApiKey' | 'elevenLabsAgentId'
  >,
): Promise<string> {
  const response = await fetch(
    `${ELEVENLABS_SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(options.elevenLabsAgentId)}`,
    { headers: { 'xi-api-key': options.elevenLabsApiKey } },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AvatarError(
      'ELEVENLABS_SIGNED_URL_FAILED',
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
  const response = await fetch(`${options.baseUrl}/v1/realtime_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.runwayApiSecret}`,
      'X-Runway-Version': API_VERSION,
    },
    body: JSON.stringify({
      model: AVATAR_MODEL,
      avatar: { type: 'custom', avatarId: options.avatarId },
      integration: { type: 'elevenlabs', signedUrl: options.signedUrl },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AvatarError(
      'SESSION_CREATE_FAILED',
      `Failed to create Runway session (${options.baseUrl}): ${response.status} ${body}`,
    );
  }

  const { id: sessionId } = (await response.json()) as { id: string };
  return sessionId;
}
