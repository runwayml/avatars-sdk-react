'use client';

import { AvatarEvent } from '@runwayml/avatars';
import { useCallback, useEffect, useState } from 'react';
import {
  useMaybeCoreSession,
  useMediaDeviceErrorContext,
} from '../components/AvatarSession';

const NOOP_ASYNC = async () => {};

export interface UseLocalMediaReturn {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  micError: Error | null;
  cameraError: Error | null;
  retryMic: () => Promise<void>;
  retryCamera: () => Promise<void>;
}

export function useLocalMedia(): UseLocalMediaReturn {
  const session = useMaybeCoreSession();
  const {
    micError = null,
    cameraError = null,
    retryMic = NOOP_ASYNC,
    retryCamera = NOOP_ASYNC,
  } = useMediaDeviceErrorContext() ?? {};

  const [isMicEnabled, setMicEnabled] = useState(false);
  const [isCameraEnabled, setCameraEnabled] = useState(false);
  const [isScreenShareEnabled, setScreenShareEnabled] = useState(false);

  useEffect(() => {
    if (!session) return;

    const sync = () => {
      setMicEnabled(session.mic.isEnabled);
      setCameraEnabled(session.camera.isEnabled);
      setScreenShareEnabled(session.screenShare.isActive);
    };

    sync();
    session.on(AvatarEvent.MediaChanged, sync);
    return () => {
      session.off(AvatarEvent.MediaChanged, sync);
    };
  }, [session]);

  const toggleMic = useCallback(() => {
    session?.mic.toggle();
  }, [session]);

  const toggleCamera = useCallback(() => {
    session?.camera.toggle();
  }, [session]);

  const toggleScreenShare = useCallback(() => {
    session?.screenShare.toggle();
  }, [session]);

  return {
    isMicEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    micError,
    cameraError,
    retryMic,
    retryCamera,
  };
}
