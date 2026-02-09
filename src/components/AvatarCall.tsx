'use client';

/**
 * AvatarCall Component
 *
 * High-level component that handles the complete session lifecycle.
 * Suspends during credential fetching (Phase 1) — wrap in <Suspense> to
 * show loading UI while the server creates the session.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
 *     <AvatarVideo />
 *     <ControlBar />
 *   </AvatarCall>
 * </Suspense>
 * ```
 */

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
  baseUrl,
  avatarImageUrl,
  onEnd,
  onError,
  children,
  __unstable_roomOptions,
  ...props
}: AvatarCallProps) {
  const onErrorRef = useLatest(onError);

  const credentials = useCredentials({
    avatarId,
    sessionId,
    sessionKey,
    credentials: directCredentials,
    connectUrl,
    connect,
    baseUrl,
  });

  const handleSessionError = (err: Error) => {
    onErrorRef.current?.(err);
  };

  const backgroundStyle = avatarImageUrl
    ? ({ '--avatar-image': `url(${avatarImageUrl})` } as React.CSSProperties)
    : undefined;

  return (
    <div
      {...props}
      data-avatar-call=""
      data-avatar-id={avatarId}
      style={{ ...props.style, ...backgroundStyle }}
    >
      <AvatarSession
        credentials={credentials}
        onEnd={onEnd}
        onError={handleSessionError}
        __unstable_roomOptions={__unstable_roomOptions}
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
