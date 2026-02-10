'use client';

/**
 * AvatarCall Component
 *
 * High-level component that handles the complete session lifecycle.
 * Manages credential fetching, connection, and video display internally
 * with a seamless loading experience.
 *
 * @example
 * ```tsx
 * <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
 *   <AvatarVideo />
 *   <ControlBar />
 * </AvatarCall>
 * ```
 */

import { useCredentials } from '../hooks/useCredentials';
import { useLatest } from '../hooks/useLatest';
import type { AvatarCallProps } from '../types';
import { AvatarSession, LoadingSessionProvider } from './AvatarSession';
import { AvatarVideo } from './AvatarVideo';
import { ControlBar } from './ControlBar';
import { UserVideo } from './UserVideo';

export function AvatarCall({
  avatarId,
  sessionId,
  sessionKey,
  credentials: directCredentials,
  connectUrl,
  connect,
  baseUrl,
  avatarImageUrl,
  onEnd,
  onError,
  children,
  __unstable_roomOptions,
  ...props
}: AvatarCallProps) {
  const onErrorRef = useLatest(onError);

  const credentialsState = useCredentials({
    avatarId,
    sessionId,
    sessionKey,
    credentials: directCredentials,
    connectUrl,
    connect,
    baseUrl,
    onError: (err) => onErrorRef.current?.(err),
  });

  const handleSessionError = (err: Error) => {
    onErrorRef.current?.(err);
  };

  const backgroundStyle = avatarImageUrl
    ? ({ '--avatar-image': `url(${avatarImageUrl})` } as React.CSSProperties)
    : undefined;

  const defaultChildren = (
    <>
      <AvatarVideo />
      <UserVideo />
      <ControlBar />
    </>
  );

  if (credentialsState.status !== 'ready') {
    return (
      <div
        {...props}
        data-avatar-call=""
        data-avatar-id={avatarId}
        style={{ ...props.style, ...backgroundStyle }}
      >
        <LoadingSessionProvider
          state={credentialsState.status === 'error' ? 'error' : 'connecting'}
          error={credentialsState.error}
        >
          {children ?? defaultChildren}
        </LoadingSessionProvider>
      </div>
    );
  }

  return (
    <div
      {...props}
      data-avatar-call=""
      data-avatar-id={avatarId}
      style={{ ...props.style, ...backgroundStyle }}
    >
      <AvatarSession
        credentials={credentialsState.credentials}
        onEnd={onEnd}
        onError={handleSessionError}
        __unstable_roomOptions={__unstable_roomOptions}
      >
        {children ?? defaultChildren}
      </AvatarSession>
    </div>
  );
}
