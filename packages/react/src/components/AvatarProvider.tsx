'use client';

/**
 * AvatarProvider Component
 *
 * Headless provider that handles credential fetching and session context
 * without rendering any styled container. Use this when you need session
 * hooks (useAvatarStatus, useTranscript, etc.) in components rendered
 * outside the video area.
 *
 * For a ready-made UI container, use AvatarCall instead.
 *
 * @example
 * ```tsx
 * <AvatarProvider avatarId="fashion-designer" sessionId={id} sessionKey={key}>
 *   <div className="video-area">
 *     <AvatarVideo />
 *     <ControlBar />
 *   </div>
 *   <TranscriptPanel />  // hooks work here — no portal needed
 * </AvatarProvider>
 * ```
 */

import { useCredentials } from '../hooks/useCredentials';
import { useLatest } from '../hooks/useLatest';
import type { AvatarProviderProps, ClientEvent } from '../types';
import { AvatarSession } from './AvatarSession';

export function AvatarProvider<E extends ClientEvent = ClientEvent>({
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
  __unstable_roomOptions,
  fallback = null,
  children,
}: AvatarProviderProps<E>) {
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

  if (credentialsState.status !== 'ready') {
    return <>{fallback}</>;
  }

  return (
    <AvatarSession
      credentials={credentialsState.credentials}
      audio={audio}
      video={video}
      onEnd={onEnd}
      onError={(err) => onErrorRef.current?.(err)}
      onClientEvent={onClientEvent}
      initialScreenStream={initialScreenStream}
      __unstable_roomOptions={__unstable_roomOptions}
    >
      {children}
    </AvatarSession>
  );
}
