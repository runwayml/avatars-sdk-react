'use client';

import { AvatarEvent } from '@runwayml/avatars';
import { useEffect, useState } from 'react';
import { useMaybeCoreSession } from '../components/AvatarSession';

export interface UseAvatarReturn {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  hasVideo: boolean;
}

export function useAvatar(): UseAvatarReturn {
  const session = useMaybeCoreSession();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  useEffect(() => {
    if (!session) return;

    const handleVideo = (track: MediaStreamTrack) => setVideoTrack(track);
    const handleAudio = (track: MediaStreamTrack) => setAudioTrack(track);

    session.on(AvatarEvent.AvatarVideoReady, handleVideo);
    session.on(AvatarEvent.AvatarAudioReady, handleAudio);

    return () => {
      session.off(AvatarEvent.AvatarVideoReady, handleVideo);
      session.off(AvatarEvent.AvatarAudioReady, handleAudio);
    };
  }, [session]);

  return {
    videoTrack,
    audioTrack,
    hasVideo: videoTrack !== null,
  };
}
