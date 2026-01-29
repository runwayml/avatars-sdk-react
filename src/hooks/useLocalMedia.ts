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

  const toggleMic = useCallback(() => {
    localParticipant?.setMicrophoneEnabled(!isMicEnabledRef.current);
  }, [localParticipant, isMicEnabledRef]);

  const toggleCamera = useCallback(() => {
    localParticipant?.setCameraEnabled(!isCameraEnabledRef.current);
  }, [localParticipant, isCameraEnabledRef]);

  const toggleScreenShare = useCallback(() => {
    localParticipant?.setScreenShareEnabled(!isScreenShareEnabledRef.current);
  }, [localParticipant, isScreenShareEnabledRef]);

  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    {
      onlySubscribed: false,
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
