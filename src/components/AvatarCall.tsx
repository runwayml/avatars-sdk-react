'use client';

/**
 * AvatarCall Component
 *
 * High-level component that handles the complete session lifecycle.
 * Manages credential fetching, connection, and video display internally
 * with a seamless loading experience.
 *
 * During credential loading, shows a loading state with the avatar image.
 * Once connected, renders children inside the session context.
 *
 * For more control over the loading UI, use AvatarSession directly.
 *
 * @example
 * ```tsx
 * // Simple usage - handles everything automatically
 * <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect" />
 *
 * // Custom children - rendered once connected
 * <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
 *   <AvatarVideo />
 *   <ControlBar />
 * </AvatarCall>
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

  // During credential loading/error, show a simple loading state
  // Children are NOT rendered here because they may use hooks that require LiveKitRoom context
  if (credentialsState.status !== 'ready') {
    const status =
      credentialsState.status === 'error' ? 'error' : 'connecting';

    return (
      <div
        {...props}
        data-avatar-call=""
        data-avatar-id={avatarId}
        style={{ ...props.style, ...backgroundStyle }}
      >
        <div data-avatar-video="" data-avatar-status={status} />
      </div>
    );
  }

  // Once credentials are ready, render children inside the session context
  // This ensures all hooks have access to the LiveKitRoom context
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
