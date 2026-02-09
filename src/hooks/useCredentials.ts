'use client';

import { useEffect } from 'react';
import { consumeSession } from '../api/consume';
import type { SessionCredentials } from '../types';
import {
  createSuspenseResource,
  type SuspenseResource,
} from '../utils/suspense-resource';

export interface UseCredentialsOptions {
  avatarId: string;
  sessionId?: string;
  sessionKey?: string;
  credentials?: SessionCredentials;
  connectUrl?: string;
  connect?: (avatarId: string) => Promise<SessionCredentials>;
}

const resourceCache = new Map<string, SuspenseResource<SessionCredentials>>();

function computeKey(options: UseCredentialsOptions): string {
  if (options.credentials) return `direct:${options.credentials.sessionId}`;
  if (options.sessionId && options.sessionKey)
    return `session:${options.sessionId}`;
  return `connect:${options.avatarId}:${options.connectUrl ?? 'custom'}`;
}

async function fetchCredentials(
  options: UseCredentialsOptions,
): Promise<SessionCredentials> {
  const { avatarId, sessionId, sessionKey, connectUrl, connect } = options;

  if (sessionId && sessionKey) {
    const { url, token, roomName } = await consumeSession({
      sessionId,
      sessionKey,
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
): SessionCredentials {
  const key = computeKey(options);

  useEffect(() => {
    return () => {
      resourceCache.delete(key);
    };
  }, [key]);

  if (options.credentials) {
    return options.credentials;
  }

  let resource = resourceCache.get(key);
  if (!resource) {
    resource = createSuspenseResource(fetchCredentials(options));
    resourceCache.set(key, resource);
  }

  return resource.read();
}
