'use client';

import { useEffect, useReducer, useRef } from 'react';
import { consumeSession } from '../api/consume';
import type { SessionCredentials } from '../types';

interface CredentialsState {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  credentials: SessionCredentials | null;
  error: Error | null;
}

type CredentialsAction =
  | { type: 'CONNECT' }
  | { type: 'CONNECTED'; credentials: SessionCredentials }
  | { type: 'ERROR'; error: Error };

function credentialsReducer(
  _state: CredentialsState,
  action: CredentialsAction,
): CredentialsState {
  switch (action.type) {
    case 'CONNECT':
      return { status: 'connecting', credentials: null, error: null };
    case 'CONNECTED':
      return {
        status: 'connected',
        credentials: action.credentials,
        error: null,
      };
    case 'ERROR':
      return { status: 'error', credentials: null, error: action.error };
  }
}

export interface UseCredentialsOptions {
  avatarId: string;
  sessionId?: string;
  sessionKey?: string;
  credentials?: SessionCredentials;
  connectUrl?: string;
  connect?: (avatarId: string) => Promise<SessionCredentials>;
  onError?: (error: Error) => void;
}

export function useCredentials(
  options: UseCredentialsOptions,
): CredentialsState {
  const {
    avatarId,
    sessionId,
    sessionKey,
    credentials: directCredentials,
    connectUrl,
    connect,
    onError,
  } = options;

  const [state, dispatch] = useReducer(credentialsReducer, {
    status: 'idle',
    credentials: null,
    error: null,
  });

  const fetchedForRef = useRef<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const mode = directCredentials
    ? 'direct'
    : sessionId && sessionKey
      ? 'session'
      : connectUrl || connect
        ? 'connect'
        : null;

  useEffect(() => {
    if (mode !== 'direct' || !directCredentials) return;
    dispatch({ type: 'CONNECTED', credentials: directCredentials });
  }, [mode, directCredentials]);

  useEffect(() => {
    if (mode !== 'session' || !sessionId || !sessionKey) return;
    if (fetchedForRef.current === sessionId) return;
    fetchedForRef.current = sessionId;

    dispatch({ type: 'CONNECT' });

    consumeSession({ sessionId, sessionKey })
      .then(({ url, token, roomName }) => {
        dispatch({
          type: 'CONNECTED',
          credentials: { sessionId, serverUrl: url, token, roomName },
        });
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: 'ERROR', error });
        onErrorRef.current?.(error);
      });
  }, [mode, sessionId, sessionKey]);

  useEffect(() => {
    if (mode !== 'connect') return;
    if (fetchedForRef.current === avatarId) return;
    fetchedForRef.current = avatarId;

    dispatch({ type: 'CONNECT' });

    async function fetchCredentials(): Promise<SessionCredentials> {
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

      throw new Error('No connect method available');
    }

    fetchCredentials()
      .then((credentials) => {
        dispatch({ type: 'CONNECTED', credentials });
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: 'ERROR', error });
        onErrorRef.current?.(error);
      });
  }, [mode, avatarId, connectUrl, connect]);

  return state;
}
