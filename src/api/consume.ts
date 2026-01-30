/**
 * Runway API - Consume Session
 *
 * Client for the Runway /consume endpoint.
 * Retrieves connection credentials for an existing session.
 */

import type { ConsumeSessionOptions, SessionCredentials } from '../types';

const DEFAULT_BASE_URL = 'https://api.runwayml.com/v1';

/**
 * Consume a session to get connection credentials
 */
export async function consumeSession(
  options: ConsumeSessionOptions,
): Promise<SessionCredentials> {
  const { sessionId, baseUrl = DEFAULT_BASE_URL } = options;

  const response = await fetch(
    `${baseUrl}/realtime/sessions/${sessionId}/consume`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to consume session: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();

  return {
    sessionId,
    serverUrl: data.url,
    token: data.token,
    roomName: data.roomName,
  };
}
