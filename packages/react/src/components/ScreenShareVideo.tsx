'use client';

import { AvatarEvent } from '@runwayml/avatars';
import { useEffect, useRef, useState } from 'react';
import { useMaybeCoreSession } from './AvatarSession';

export function ScreenShareVideo({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const session = useMaybeCoreSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasTrack, setHasTrack] = useState(false);

  useEffect(() => {
    if (!session) return;

    const handleTrack = (track: MediaStreamTrack) => {
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([track]);
        videoRef.current.play().catch(() => {});
      }
      setHasTrack(true);
    };

    session.on(AvatarEvent.ScreenShareReady, handleTrack);
    return () => {
      session.off(AvatarEvent.ScreenShareReady, handleTrack);
    };
  }, [session]);

  if (!hasTrack) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
