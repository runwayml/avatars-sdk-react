'use client';

import { useCredentials } from '../hooks/useCredentials';
import { useLatest } from '../hooks/useLatest';
import type { AvatarCallProps } from '../types';
import { AvatarSession } from './AvatarSession';
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
  avatarImageUrl,
  onEnd,
  onError,
  children,
  ...props
}: AvatarCallProps) {
  const onErrorRef = useLatest(onError);

  const { status, credentials, error } = useCredentials({
    avatarId,
    sessionId,
    sessionKey,
    credentials: directCredentials,
    connectUrl,
    connect,
    onError,
  });

  const handleSessionError = (err: Error) => {
    onErrorRef.current?.(err);
  };

  const backgroundStyle = avatarImageUrl
    ? ({ '--avatar-image': `url(${avatarImageUrl})` } as React.CSSProperties)
    : undefined;

  if (status === 'idle' || status === 'connecting') {
    return (
      <div
        {...props}
        data-avatar-call=""
        data-state="connecting"
        data-avatar-id={avatarId}
        style={{ ...props.style, ...backgroundStyle }}
      />
    );
  }

  if (status === 'error' || !credentials) {
    return (
      <div
        {...props}
        data-avatar-call=""
        data-state="error"
        data-avatar-id={avatarId}
        data-error={error?.message}
        style={{ ...props.style, ...backgroundStyle }}
      />
    );
  }

  return (
    <div
      {...props}
      data-avatar-call=""
      data-state="connected"
      data-avatar-id={avatarId}
      style={{ ...props.style, ...backgroundStyle }}
    >
      <AvatarSession
        credentials={credentials}
        onEnd={onEnd}
        onError={handleSessionError}
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
