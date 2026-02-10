'use client';

import { useEffect, useState } from 'react';
import { consumeSession } from '../api/consume';
import type { SessionCredentials } from '../types';
import { useLatest } from './useLatest';

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

  const onErrorRef = useLatest(onError);

  const [state, setState] = useState<CredentialsState>(() => {
    if (directCredentials) {
      return { status: 'ready', credentials: directCredentials, error: null };
    }
    return { status: 'loading', credentials: null, error: null };
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: onErrorRef is a stable ref from useLatest - we intentionally read .current at call time
  useEffect(() => {
    if (directCredentials) {
      setState({
        status: 'ready',
        credentials: directCredentials,
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading', credentials: null, error: null });

    async function load() {
      try {
        const fetchOptions: UseCredentialsOptions = {
          avatarId,
          sessionId,
          sessionKey,
          connectUrl,
          connect,
          baseUrl,
        };
        const credentials = await fetchCredentials(fetchOptions);
        if (!cancelled) {
          setState({ status: 'ready', credentials, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error(String(err));
          setState({ status: 'error', credentials: null, error });
          onErrorRef.current?.(error);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    directCredentials,
    avatarId,
    sessionId,
    sessionKey,
    connectUrl,
    connect,
    baseUrl,
  ]);

  return state;
}
