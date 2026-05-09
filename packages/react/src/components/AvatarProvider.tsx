'use client';

import type { ClientEvent } from '@runwayml/avatars';
import type { AvatarProviderProps } from '../types';
import { useCredentials } from '../hooks/useCredentials';
import { AvatarSession } from './AvatarSession';

export function AvatarProvider<E extends ClientEvent = ClientEvent>({
  children,
  fallback = null,
  avatarId,
  sessionId,
  sessionKey,
  credentials: directCredentials,
  connectUrl,
  connect,
  baseUrl,
  audio,
  video,
  onEnd,
  onError,
  onClientEvent,
  initialScreenStream,
}: AvatarProviderProps<E>) {
  const credentialsState = useCredentials({
    avatarId,
    sessionId,
    sessionKey,
    credentials: directCredentials,
    connectUrl,
    connect,
    baseUrl,
    onError,
  });

  if (credentialsState.status === 'loading') {
    return <>{fallback}</>;
  }

  if (credentialsState.status === 'error') {
    return null;
  }

  return (
    <AvatarSession
      credentials={credentialsState.credentials}
      audio={audio}
      video={video}
      onEnd={onEnd}
      onError={onError}
      onClientEvent={onClientEvent}
      initialScreenStream={initialScreenStream}
    >
      {children}
    </AvatarSession>
  );
}
