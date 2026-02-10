'use client';

import {
  useLocalParticipant,
  useMediaDevices,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useCallback } from 'react';
import type { UseLocalMediaReturn } from '../types';
import { useLatest } from './useLatest';

export function useLocalMedia(): UseLocalMediaReturn {
  const { localParticipant } = useLocalParticipant();

  const audioDevices = useMediaDevices({ kind: 'audioinput' });
  const videoDevices = useMediaDevices({ kind: 'videoinput' });

  const hasMic = audioDevices.length > 0;
  const hasCamera = videoDevices.length > 0;

  const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;
  const isScreenShareEnabled = localParticipant?.isScreenShareEnabled ?? false;

  const isMicEnabledRef = useLatest(isMicEnabled);
  const isCameraEnabledRef = useLatest(isCameraEnabled);
  const isScreenShareEnabledRef = useLatest(isScreenShareEnabled);

  const hasMicRef = useLatest(hasMic);
  const hasCameraRef = useLatest(hasCamera);

  const toggleMic = useCallback(() => {
    // Only toggle if we have a mic, or if we're disabling (always allow disable)
    if (hasMicRef.current || isMicEnabledRef.current) {
      localParticipant?.setMicrophoneEnabled(!isMicEnabledRef.current);
    }
  }, [localParticipant, isMicEnabledRef, hasMicRef]);

  const toggleCamera = useCallback(() => {
    // Only toggle if we have a camera, or if we're disabling (always allow disable)
    if (hasCameraRef.current || isCameraEnabledRef.current) {
      localParticipant?.setCameraEnabled(!isCameraEnabledRef.current);
    }
  }, [localParticipant, isCameraEnabledRef, hasCameraRef]);

  const toggleScreenShare = useCallback(() => {
    localParticipant?.setScreenShareEnabled(!isScreenShareEnabledRef.current);
  }, [localParticipant, isScreenShareEnabledRef]);

  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    {
      onlySubscribed: false,
      updateOnlyOn: [],
    },
  );

  const localIdentity = localParticipant?.identity;

  const localVideoTrackRef =
    tracks.find(
      (trackRef) =>
        trackRef.participant.identity === localIdentity &&
        trackRef.source === Track.Source.Camera,
    ) ?? null;

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
