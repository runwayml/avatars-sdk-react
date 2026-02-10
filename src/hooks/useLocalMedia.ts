'use client';

import {
  useLocalParticipant,
  useMaybeRoomContext,
  useMediaDevices,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useCallback } from 'react';
import type { UseLocalMediaReturn } from '../types';
import { useLatest } from './useLatest';

/**
 * Hook for local media controls (mic, camera, screen share).
 * Returns safe defaults when called outside of LiveKitRoom context.
 */
export function useLocalMedia(): UseLocalMediaReturn {
  const room = useMaybeRoomContext();
  const hasRoomContext = room !== undefined;

  const { localParticipant } = useLocalParticipant({ room });

  const audioDevices = useMediaDevices({ kind: 'audioinput' });
  const videoDevices = useMediaDevices({ kind: 'videoinput' });

  const hasMic = audioDevices?.length > 0;
  const hasCamera = videoDevices?.length > 0;

  const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;
  const isScreenShareEnabled = localParticipant?.isScreenShareEnabled ?? false;

  const isMicEnabledRef = useLatest(isMicEnabled);
  const isCameraEnabledRef = useLatest(isCameraEnabled);
  const isScreenShareEnabledRef = useLatest(isScreenShareEnabled);

  const hasMicRef = useLatest(hasMic);
  const hasCameraRef = useLatest(hasCamera);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs from useLatest are stable
  const toggleMic = useCallback(() => {
    if (hasMicRef.current || isMicEnabledRef.current) {
      localParticipant?.setMicrophoneEnabled(!isMicEnabledRef.current);
    }
  }, [localParticipant]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs from useLatest are stable
  const toggleCamera = useCallback(() => {
    if (hasCameraRef.current || isCameraEnabledRef.current) {
      localParticipant?.setCameraEnabled(!isCameraEnabledRef.current);
    }
  }, [localParticipant]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs from useLatest are stable
  const toggleScreenShare = useCallback(() => {
    localParticipant?.setScreenShareEnabled(!isScreenShareEnabledRef.current);
  }, [localParticipant]);

  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    {
      onlySubscribed: false,
      updateOnlyOn: [],
      room: hasRoomContext ? room : undefined,
    },
  );

  const localIdentity = localParticipant?.identity;

  const localVideoTrackRef = hasRoomContext
    ? (tracks.find(
        (trackRef) =>
          trackRef.participant.identity === localIdentity &&
          trackRef.source === Track.Source.Camera,
      ) ?? null)
    : null;

  return {
    hasMic,
    hasCamera,
    isMicEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    localVideoTrackRef,
  };
}
