'use client';

import { AvatarEvent } from '@runwayml/avatars';
import { useEffect, useRef, useState } from 'react';
import { useMaybeCoreSession } from './AvatarSession';

export function UserVideo({
  children,
  className,
  style,
}: {
  children?: (props: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    hasVideo: boolean;
  }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const session = useMaybeCoreSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (!session) return;

    const handleTrack = (track: MediaStreamTrack) => {
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([track]);
        videoRef.current.play().catch(() => {});
      }
      setHasVideo(true);
    };

    session.on(AvatarEvent.LocalVideoReady, handleTrack);
    return () => {
      session.off(AvatarEvent.LocalVideoReady, handleTrack);
    };
  }, [session]);

  if (children) {
    return <>{children({ videoRef, hasVideo })}</>;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      data-avatar-user-video=""
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)',
        ...style,
      }}
    />
  );
}
