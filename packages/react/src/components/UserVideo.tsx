'use client';

import { useEffect, useRef, useState } from 'react';

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setHasVideo(true);
        }
      } catch {
        setHasVideo(false);
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (children) {
    return <>{children({ videoRef, hasVideo })}</>;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
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
