'use client';

import {
  useLocalParticipant,
  useMediaDevices,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useCallback } from 'react';
import { useMediaDeviceErrorContext } from '../components/AvatarSession';
import type { UseLocalMediaReturn } from '../types';
import { useLatest } from './useLatest';

const NOOP_ASYNC = async () => {};

function createCaptureController(): unknown {
  if (typeof window === 'undefined' || !('CaptureController' in window)) {
    return undefined;
  }
  // biome-ignore lint/suspicious/noExplicitAny: CaptureController not yet in TypeScript's lib
  const controller = new (window as any).CaptureController();
  controller.setFocusBehavior('no-focus-change');
  return controller;
}

/**
 * Hook for local media controls (mic, camera, screen share).
 *
 * Must be used within an AvatarSession or AvatarCall component.
 * For use outside the session context, use AvatarSession directly
 * and manage your own loading states.
 */
export function useLocalMedia(): UseLocalMediaReturn {
  const { localParticipant } = useLocalParticipant();
  const {
    micError = null,
    cameraError = null,
    retryMic = NOOP_ASYNC,
    retryCamera = NOOP_ASYNC,
  } = useMediaDeviceErrorContext() ?? {};

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
    const next = !isScreenShareEnabledRef.current;
    if (next) {
      const controller = createCaptureController();
      localParticipant?.setScreenShareEnabled(true, {
        controller,
        surfaceSwitching: 'include',
      });
    } else {
      localParticipant?.setScreenShareEnabled(false);
    }
  }, [localParticipant]);

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
    micError,
    cameraError,
    retryMic,
    retryCamera,
  };
}
