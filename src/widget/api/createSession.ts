/**
 * Widget Session API
 *
 * Client-side session creation for the widget.
 */

import type { SessionCredentials } from '../../types';

const DEFAULT_BASE_URL = 'https://api.dev-stage.runwayml.com';

export interface AvatarConfig {
  type: 'custom' | 'runway-preset';
  avatarId?: string;
  presetId?: string;
}

export interface CreateSessionOptions {
  apiKey: string;
  avatar: AvatarConfig;
  duration?: number;
  baseUrl?: string;
}

interface SessionStatusResponse {
  id: string;
  status: 'NOT_READY' | 'READY' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  failure?: string;
}

interface ConsumeResponse {
  sessionId: string;
  url: string;
  token: string;
  roomName: string;
}

/**
 * Creates a new avatar session using the Runway API
 *
 * This handles the full flow:
 * 1. Create session
 * 2. Poll until READY
 * 3. Consume to get credentials
 */
export async function createWidgetSession(
  options: CreateSessionOptions
): Promise<SessionCredentials> {
  const { apiKey, avatar, duration = 120, baseUrl = DEFAULT_BASE_URL } = options;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Step 1: Create session
  const createResponse = await fetch(`${baseUrl}/v1/realtime_sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: {
        model: 'calliope',
        avatar,
      },
      duration,
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create session: ${createResponse.status} ${errorText}`);
  }

  const { id: sessionId } = await createResponse.json();

  // Step 2: Poll until READY
  let status: SessionStatusResponse;
  const maxAttempts = 60; // 60 seconds max
  let attempts = 0;

  do {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;

    const statusResponse = await fetch(`${baseUrl}/v1/realtime_sessions/${sessionId}`, {
      headers,
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to get session status: ${statusResponse.status}`);
    }

    status = await statusResponse.json();

    if (status.status === 'FAILED') {
      throw new Error(`Session failed: ${status.failure || 'Unknown error'}`);
    }

    if (status.status === 'CANCELLED') {
      throw new Error('Session was cancelled');
    }

    if (attempts >= maxAttempts) {
      throw new Error('Session creation timed out');
    }
  } while (status.status === 'NOT_READY');

  // Step 3: Consume to get credentials
  const consumeResponse = await fetch(`${baseUrl}/v1/realtime_sessions/${sessionId}/consume`, {
    method: 'POST',
    headers,
  });

  if (!consumeResponse.ok) {
    const errorText = await consumeResponse.text();
    throw new Error(`Failed to consume session: ${consumeResponse.status} ${errorText}`);
  }

  const credentials: ConsumeResponse = await consumeResponse.json();

  return {
    sessionId: credentials.sessionId,
    livekitUrl: credentials.url,
    token: credentials.token,
    roomName: credentials.roomName,
  };
}
