'use client';

import type { ClientEvent } from '@runwayml/avatars';
import type { AvatarCallProps } from '../types';
import { useCredentials } from '../hooks/useCredentials';
import { AvatarSession } from './AvatarSession';
import { AvatarVideo } from './AvatarVideo';
import { ControlBar } from './ControlBar';
import { UserVideo } from './UserVideo';

export function AvatarCall<E extends ClientEvent = ClientEvent>({
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
  avatarImageUrl,
  initialScreenStream,
  children,
  className,
  style,
  ...divProps
}: AvatarCallProps<E>) {
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
    return (
      <div data-avatar-call="" className={className} style={style} {...divProps}>
        {avatarImageUrl && (
          <img
            src={avatarImageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
    );
  }

  if (credentialsState.status === 'error') {
    return (
      <div data-avatar-call="" className={className} style={style} {...divProps} />
    );
  }

  return (
    <div data-avatar-call="" className={className} style={style} {...divProps}>
      <AvatarSession
        credentials={credentialsState.credentials}
        audio={audio}
        video={video}
        onEnd={onEnd}
        onError={onError}
        onClientEvent={onClientEvent}
        initialScreenStream={initialScreenStream}
      >
        {children ?? (
          <>
            <AvatarVideo />
            <UserVideo />
            <ControlBar />
          </>
        )}
      </AvatarSession>
    </div>
  );
}
