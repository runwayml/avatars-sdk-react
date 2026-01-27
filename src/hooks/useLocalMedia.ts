'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useLocalParticipant, useMediaDevices, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { UseLocalMediaReturn } from '../types';

export function useLocalMedia(): UseLocalMediaReturn {
  const { localParticipant } = useLocalParticipant();

  const audioDevices = useMediaDevices({ kind: 'audioinput' });
  const videoDevices = useMediaDevices({ kind: 'videoinput' });

  const hasMic = audioDevices.length > 0;
  const hasCamera = videoDevices.length > 0;

  const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;
  const isScreenShareEnabled = localParticipant?.isScreenShareEnabled ?? false;

  const isMicEnabledRef = useRef(isMicEnabled);
  const isCameraEnabledRef = useRef(isCameraEnabled);
  const isScreenShareEnabledRef = useRef(isScreenShareEnabled);

  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  useEffect(() => {
    isCameraEnabledRef.current = isCameraEnabled;
  }, [isCameraEnabled]);

  useEffect(() => {
    isScreenShareEnabledRef.current = isScreenShareEnabled;
  }, [isScreenShareEnabled]);

  const toggleMic = useCallback(() => {
    localParticipant?.setMicrophoneEnabled(!isMicEnabledRef.current);
  }, [localParticipant]);

  const toggleCamera = useCallback(() => {
    localParticipant?.setCameraEnabled(!isCameraEnabledRef.current);
  }, [localParticipant]);

  const toggleScreenShare = useCallback(() => {
    localParticipant?.setScreenShareEnabled(!isScreenShareEnabledRef.current);
  }, [localParticipant]);

  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  });

  const localIdentity = localParticipant?.identity;

  const localVideoTrackRef =
    tracks.find(
      (trackRef) =>
        trackRef.participant.identity === localIdentity && trackRef.source === Track.Source.Camera
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
