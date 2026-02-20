'use client';

import { useCallback } from 'react';
import { consumeSession } from '../api/consume';
import type { SessionCredentials } from '../types';
import { useQuery } from './useQuery';

export interface UseCredentialsOptions {
  avatarId: string;
  sessionId?: string;
  sessionKey?: string;
  credentials?: SessionCredentials;
  connectUrl?: string;
  connect?: (avatarId: string) => Promise<SessionCredentials>;
  baseUrl?: string;
  onError?: (error: Error) => void;
}

export type CredentialsState =
  | { status: 'loading'; credentials: null; error: null }
  | { status: 'ready'; credentials: SessionCredentials; error: null }
  | { status: 'error'; credentials: null; error: Error };

async function fetchCredentials(
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
    return connect(avatarId);
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

    return response.json();
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
