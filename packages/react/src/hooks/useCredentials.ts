'use client';

import { useCallback } from 'react';
import { consumeSession } from '@runwayml/avatars';
import type { ConnectResponse, SessionCredentials } from '../types';
import { useQuery } from './useQuery';

export interface UseCredentialsOptions {
  avatarId: string;
  sessionId?: string;
  sessionKey?: string;
  credentials?: SessionCredentials;
  connectUrl?: string;
  connect?: (avatarId: string) => Promise<ConnectResponse>;
  baseUrl?: string;
  onError?: (error: Error) => void;
}

export type CredentialsState =
  | { status: 'loading'; credentials: null; error: null }
  | { status: 'ready'; credentials: SessionCredentials; error: null }
  | { status: 'error'; credentials: null; error: Error };

function hasSessionKey(
  data: unknown,
): data is { sessionId: string; sessionKey: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Record<string, unknown>).sessionId === 'string' &&
    typeof (data as Record<string, unknown>).sessionKey === 'string' &&
    !('serverUrl' in data)
  );
}

async function resolveCredentials(
  data: unknown,
  baseUrl?: string,
): Promise<SessionCredentials> {
  if (hasSessionKey(data)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[@runwayml/avatars-react] Your server returned { sessionId, sessionKey } — ' +
          'the SDK is calling the consume endpoint automatically. ' +
          'For better performance, call /v1/realtime_sessions/{id}/consume ' +
          'server-side and return { sessionId, serverUrl, token, roomName } directly.',
      );
    }
    const { url, token, roomName } = await consumeSession({
      sessionId: data.sessionId,
      sessionKey: data.sessionKey,
      baseUrl,
    });
    return { sessionId: data.sessionId, serverUrl: url, token, roomName };
  }
  return data as SessionCredentials;
}

export async function fetchCredentials(
  options: UseCredentialsOptions,
): Promise<SessionCredentials> {
  const { avatarId, sessionId, sessionKey, connectUrl, connect, baseUrl } =
    options;

  if (sessionId && sessionKey) {
    const { url, token, roomName } = await consumeSession({
      sessionId,
      sessionKey,
      baseUrl,
    });
    return { sessionId, serverUrl: url, token, roomName };
  }

  if (connect) {
    const result = await connect(avatarId);
    return resolveCredentials(result, baseUrl);
  }

  if (connectUrl) {
    const response = await fetch(connectUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to connect: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return resolveCredentials(data, baseUrl);
  }

  throw new Error(
    'AvatarCall requires one of: credentials, sessionId+sessionKey, connectUrl, or connect',
  );
}

export function useCredentials(
  options: UseCredentialsOptions,
): CredentialsState {
  const {
    credentials: directCredentials,
    avatarId,
    sessionId,
    sessionKey,
    connectUrl,
    connect,
    baseUrl,
    onError,
  } = options;

  const queryKey = `credentials:${avatarId}:${sessionId}:${sessionKey}:${connectUrl}:${baseUrl}`;

  const queryFn = useCallback(
    () =>
      fetchCredentials({
        avatarId,
        sessionId,
        sessionKey,
        connectUrl,
        connect,
        baseUrl,
      }),
    [avatarId, sessionId, sessionKey, connectUrl, connect, baseUrl],
  );

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: !directCredentials,
    onError,
  });

  if (directCredentials) {
    return { status: 'ready', credentials: directCredentials, error: null };
  }

  if (query.status === 'success') {
    return { status: 'ready', credentials: query.data, error: null };
  }

  if (query.status === 'error') {
    return { status: 'error', credentials: null, error: query.error };
  }

  return { status: 'loading', credentials: null, error: null };
}
