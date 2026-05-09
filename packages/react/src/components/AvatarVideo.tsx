'use client';

import { useEffect, useRef } from 'react';
import { useAvatar } from '../hooks/useAvatar';

export type AvatarVideoStatus = 'connecting' | 'waiting' | 'ready';

interface RenderProps {
  status: AvatarVideoStatus;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function AvatarVideo({
  children,
}: {
  children?: (avatar: RenderProps) => React.ReactNode;
}) {
  const { videoTrack, hasVideo } = useAvatar();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoTrack) return;

    el.srcObject = new MediaStream([videoTrack]);
    el.play().catch(() => {});

    return () => {
      el.srcObject = null;
    };
  }, [videoTrack]);

  const status: AvatarVideoStatus = !videoTrack
    ? 'connecting'
    : !hasVideo
      ? 'waiting'
      : 'ready';

  if (children) {
    return <>{children({ status, videoRef })}</>;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
