'use client';

/**
 * useAvatar Hook
 *
 * Provides access to the remote avatar participant's video and audio tracks.
 * Uses LiveKit React hooks internally but exposes a clean API.
 *
 * @example
 * ```tsx
 * function AvatarDisplay() {
 *   const { videoTrackRef, isSpeaking, hasVideo } = useAvatar();
 *
 *   if (!hasVideo) {
 *     return <Placeholder />;
 *   }
 *
 *   return (
 *     <div data-speaking={isSpeaking}>
 *       <VideoTrack trackRef={videoTrackRef} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import {
  useRemoteParticipants,
  useTracks,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import {
  Track,
  ParticipantEvent,
} from 'livekit-client';
import type { UseAvatarReturn } from '../types';

/**
 * Hook to access the remote avatar participant's tracks and state
 *
 * @returns Avatar participant info, track references, and speaking state
 */
export function useAvatar(): UseAvatarReturn {
  const remoteParticipants = useRemoteParticipants();
  const avatarParticipant = remoteParticipants[0] ?? null;
  const avatarIdentity = avatarParticipant?.identity ?? null;

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!avatarParticipant) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(avatarParticipant.isSpeaking);

    const handleIsSpeakingChanged = (speaking: boolean) => {
      setIsSpeaking(speaking);
    };

    avatarParticipant.on(ParticipantEvent.IsSpeakingChanged, handleIsSpeakingChanged);

    return () => {
      avatarParticipant.off(ParticipantEvent.IsSpeakingChanged, handleIsSpeakingChanged);
    };
  }, [avatarIdentity]);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: true },
    ],
    { onlySubscribed: true }
  );

  let videoTrackRef: TrackReferenceOrPlaceholder | null = null;
  let audioTrackRef: TrackReferenceOrPlaceholder | null = null;

  for (const trackRef of tracks) {
    if (trackRef.participant.identity !== avatarIdentity) continue;

    if (trackRef.source === Track.Source.Camera && !videoTrackRef) {
      videoTrackRef = trackRef;
    } else if (trackRef.source === Track.Source.Microphone && !audioTrackRef) {
      audioTrackRef = trackRef;
    }

    if (videoTrackRef && audioTrackRef) break;
  }

  const hasVideo = videoTrackRef !== null && isTrackReference(videoTrackRef);
  const hasAudio = audioTrackRef !== null && isTrackReference(audioTrackRef);

  return {
    participant: avatarParticipant,
    videoTrackRef,
    audioTrackRef,
    isSpeaking,
    hasVideo,
    hasAudio,
  };
}
