/**
 * Runway API - Consume Session
 *
 * Client for the Runway /consume endpoint.
 * Retrieves LiveKit credentials for an existing session.
 *
 * @example
 * ```tsx
 * const credentials = await consumeSession({
 *   sessionId: 'sess_abc123',
 * });
 *
 * // Use credentials with AvatarSession
 * <AvatarSession credentials={credentials}>
 *   ...
 * </AvatarSession>
 * ```
 */

import type { SessionCredentials, ConsumeSessionOptions } from '../types';

const DEFAULT_BASE_URL = 'https://api.runwayml.com/v1';

/**
 * Consume a session to get LiveKit credentials
 *
 * This calls the Runway API's /consume endpoint to retrieve
 * the LiveKit connection details for an existing session.
 *
 * @param options - Session ID and optional base URL
 * @returns SessionCredentials for connecting to the avatar
 */
export async function consumeSession(
  options: ConsumeSessionOptions
): Promise<SessionCredentials> {
  const { sessionId, baseUrl = DEFAULT_BASE_URL } = options;

  const response = await fetch(`${baseUrl}/realtime/sessions/${sessionId}/consume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to consume session: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    sessionId,
    livekitUrl: data.url,
    token: data.token,
    roomName: data.roomName,
  };
}
