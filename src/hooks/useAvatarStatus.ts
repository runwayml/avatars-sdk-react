'use client';

/**
 * useAvatarStatus Hook
 *
 * Returns a single discriminated union representing the full avatar lifecycle
 * inside an AvatarSession. Combines session connection state and video
 * track availability into one status value.
 *
 * Must be used within <AvatarCall> or <AvatarSession>.
 *
 * @example
 * ```tsx
 * function MyAvatar() {
 *   const avatar = useAvatarStatus();
 *
 *   switch (avatar.status) {
 *     case 'connecting':
 *       return <Spinner />;
 *     case 'waiting':
 *       return <p>Waiting for video...</p>;
 *     case 'ready':
 *       return <VideoTrack trackRef={avatar.videoTrackRef} />;
 *     case 'error':
 *       return <p>{avatar.error.message}</p>;
 *     case 'ended':
 *       return <p>Call ended</p>;
 *   }
 * }
 * ```
 */

import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { useAvatar } from './useAvatar';
import { useAvatarSession } from './useAvatarSession';

export type AvatarStatus =
  | { status: 'connecting' }
  | { status: 'waiting' }
  | { status: 'ready'; videoTrackRef: TrackReferenceOrPlaceholder }
  | { status: 'ending' }
  | { status: 'ended' }
  | { status: 'error'; error: Error };

export function useAvatarStatus(): AvatarStatus {
  const session = useAvatarSession();
  const { videoTrackRef, hasVideo } = useAvatar();

  switch (session.state) {
    case 'connecting':
    case 'idle':
      return { status: 'connecting' };

    case 'active':
      if (hasVideo && videoTrackRef) {
        return { status: 'ready', videoTrackRef };
      }
      return { status: 'waiting' };

    case 'ending':
      return { status: 'ending' };

    case 'ended':
      return { status: 'ended' };

    case 'error':
      return { status: 'error', error: session.error };
  }
}
