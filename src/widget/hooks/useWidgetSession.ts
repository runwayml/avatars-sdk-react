'use client';

/**
 * useWidgetSession Hook
 *
 * Manages session creation and connection for the widget.
 */

import { useCallback, useRef } from 'react';
import { consumeSession } from '../../api/consume';
import { createWidgetSession, type AvatarConfig } from '../api/createSession';
import type { WidgetConfig, WidgetConnectionState } from '../types';
import type { SessionCredentials } from '../../types';

export interface UseWidgetSessionOptions {
  config: WidgetConfig;
  setConnectionState: (state: WidgetConnectionState) => void;
  setCredentials: (credentials: SessionCredentials | null) => void;
  setError: (error: Error | null) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface UseWidgetSessionReturn {
  startSession: () => Promise<void>;
  isStarting: boolean;
}

export function useWidgetSession(options: UseWidgetSessionOptions): UseWidgetSessionReturn {
  const { config, setConnectionState, setCredentials, setError, onReady, onError } = options;

  const isStartingRef = useRef(false);

  const startSession = useCallback(async () => {
    if (isStartingRef.current) return;

    isStartingRef.current = true;
    setConnectionState('connecting');
    setError(null);

    try {
      let credentials: SessionCredentials;

      if (config.sessionId) {
        // Use pre-created session
        credentials = await consumeSession({
          sessionId: config.sessionId,
          baseUrl: config.baseUrl,
        });
      } else if (config.serverUrl) {
        // Use server-side proxy (recommended to avoid CORS issues)
        let avatar: AvatarConfig;
        if (config.avatarId) {
          avatar = { type: 'custom', avatarId: config.avatarId };
        } else if (config.presetId) {
          avatar = { type: 'runway-preset', presetId: config.presetId };
        } else {
          throw new Error('Widget requires either avatarId or presetId when using serverUrl');
        }

        const response = await fetch(config.serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar, duration: config.duration }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Server error' }));
          throw new Error(error.error || 'Failed to create session');
        }

        credentials = await response.json();
      } else if (config.apiKey) {
        // Create session client-side (requires CORS to be enabled on API)
        let avatar: AvatarConfig;
        if (config.avatarId) {
          avatar = { type: 'custom', avatarId: config.avatarId };
        } else if (config.presetId) {
          avatar = { type: 'runway-preset', presetId: config.presetId };
        } else {
          throw new Error('Widget requires either avatarId or presetId when using apiKey');
        }

        credentials = await createWidgetSession({
          apiKey: config.apiKey,
          avatar,
          duration: config.duration,
          baseUrl: config.baseUrl,
        });
      } else {
        throw new Error('Widget requires either sessionId or apiKey');
      }

      setCredentials(credentials);
      onReady?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setConnectionState('error');
      onError?.(error);
    } finally {
      isStartingRef.current = false;
    }
  }, [config, setConnectionState, setCredentials, setError, onReady, onError]);

  return {
    startSession,
    isStarting: isStartingRef.current,
  };
}
