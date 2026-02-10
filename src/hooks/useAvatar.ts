'use client';

/**
 * useAvatar Hook
 *
 * Provides access to the remote avatar participant's video track.
 * Audio is handled automatically by the session.
 *
 * Must be used within an AvatarSession or AvatarCall component.
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
  const remoteParticipants = useRemoteParticipants();
  const avatarParticipant = remoteParticipants[0] ?? null;

  // Only subscribe to video - audio is handled automatically by the session
  const videoTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    {
      onlySubscribed: true,
      updateOnlyOn: [],
    },
  ).filter((ref) => !ref.participant.isLocal);

  const videoTrackRef = videoTracks[0] ?? null;
  const hasVideo = videoTrackRef !== null && isTrackReference(videoTrackRef);

  return {
    participant: avatarParticipant,
    videoTrackRef,
    hasVideo,
  };
}
