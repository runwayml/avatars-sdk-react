import { AvatarError } from '../error';

export interface PollUntilReadyOptions {
  sessionId: string;
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  intervalMs?: number;
}

interface SessionResponse {
  id: string;
  status: string;
  sessionKey?: string;
  [key: string]: unknown;
}

const DEFAULT_BASE_URL = 'https://api.dev.runwayml.com';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_INTERVAL_MS = 1_000;
const TERMINAL_STATUSES = ['COMPLETED', 'FAILED', 'CANCELLED'];

/**
 * Poll a realtime session until it reaches READY status.
 *
 * Returns `{ sessionId, sessionKey }` — ready to pass to `streamTo` or `connect`.
 *
 * This is a server-side utility (requires your API key). Use it in
 * Next.js API routes, Express handlers, etc.
 *
 * @example
 * ```ts
 * import Runway from '@runwayml/sdk';
 * import { pollUntilReady } from '@runwayml/avatars/api';
 *
 * const runway = new Runway();
 * const { id: sessionId } = await runway.realtimeSessions.create({ ... });
 * const { sessionKey } = await pollUntilReady({ sessionId, apiKey: process.env.RUNWAYML_API_SECRET });
 *
 * return Response.json({ sessionId, sessionKey });
 * ```
 */
export async function pollUntilReady(
  options: PollUntilReadyOptions,
): Promise<{ sessionId: string; sessionKey: string }> {
  const {
    sessionId,
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    intervalMs = DEFAULT_INTERVAL_MS,
  } = options;

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const url = `${baseUrl}/v1/realtime_sessions/${sessionId}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new AvatarError(
        'CONSUME_FAILED',
        `Failed to retrieve session: ${response.status} ${text}`,
      );
    }

    const session: SessionResponse = await response.json();

    if (session.status === 'READY') {
      if (!session.sessionKey) {
        throw new AvatarError(
          'CONSUME_FAILED',
          'Session is READY but sessionKey is missing',
        );
      }
      return { sessionId, sessionKey: session.sessionKey };
    }

    if (TERMINAL_STATUSES.includes(session.status)) {
      throw new AvatarError(
        'CONNECTION_FAILED',
        `Session ${session.status.toLowerCase()} before becoming ready`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new AvatarError('CONNECTION_FAILED', 'Session creation timed out');
}
