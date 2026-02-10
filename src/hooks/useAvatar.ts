'use client';

/**
 * useAvatar Hook
 *
 * Provides access to the remote avatar participant's video track.
 * Audio is handled automatically by the session.
 * Returns safe defaults when called outside of LiveKitRoom context.
 *
 * @example
 * ```tsx
 * function AvatarDisplay() {
 *   const { videoTrackRef, hasVideo } = useAvatar();
 *
 *   if (!hasVideo) {
 *     return <Placeholder />;
 *   }
 *
 *   return <VideoTrack trackRef={videoTrackRef} />;
 * }
 * ```
 */

import {
  isTrackReference,
  useMaybeRoomContext,
  useRemoteParticipants,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { UseAvatarReturn } from '../types';

/**
 * Hook to access the remote avatar participant's video track
 *
 * @returns Avatar participant info and video track reference
 */
export function useAvatar(): UseAvatarReturn {
  const room = useMaybeRoomContext();
  const hasRoomContext = room !== undefined;

  const remoteParticipants = useRemoteParticipants({ room });
  const avatarParticipant = remoteParticipants[0] ?? null;

  // Only subscribe to video - audio is handled automatically by the session
  const videoTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    {
      onlySubscribed: true,
      updateOnlyOn: [],
      room: hasRoomContext ? room : undefined,
    },
  ).filter((ref) => !ref.participant.isLocal);

  const videoTrackRef = hasRoomContext ? (videoTracks[0] ?? null) : null;
  const hasVideo = videoTrackRef !== null && isTrackReference(videoTrackRef);

  return {
    participant: avatarParticipant,
    videoTrackRef,
    hasVideo,
  };
}
