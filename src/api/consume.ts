import type { ConsumeSessionOptions, ConsumeSessionResponse } from '../types';
import { getConfig } from './config';

export async function consumeSession(
  options: ConsumeSessionOptions,
): Promise<ConsumeSessionResponse> {
  const { sessionId, sessionKey, baseUrl = getConfig().baseUrl } = options;

  const url = `${baseUrl}/v1/realtime_sessions/${sessionId}/consume`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to consume session: ${response.status} ${errorText}`,
    );
  }

  return response.json();
}
