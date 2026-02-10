'use client';

import { isTrackReference, VideoTrack } from '@livekit/components-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useLocalMedia } from '../hooks/useLocalMedia';
import type { UseLocalMediaReturn } from '../types';

export interface UserVideoState {
  hasVideo: boolean;
  isCameraEnabled: boolean;
  trackRef: UseLocalMediaReturn['localVideoTrackRef'];
}

export interface UserVideoProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  mirror?: boolean;
  children?: (state: UserVideoState) => ReactNode;
}

export function UserVideo({
  children,
  mirror = true,
  ...props
}: UserVideoProps) {
  const { localVideoTrackRef, isCameraEnabled } = useLocalMedia();

  const hasVideo =
    localVideoTrackRef !== null && isTrackReference(localVideoTrackRef);

  const state: UserVideoState = {
    hasVideo,
    isCameraEnabled,
    trackRef: localVideoTrackRef,
  };

  if (children) {
    return <>{children(state)}</>;
  }

  return (
    <div
      {...props}
      data-avatar-user-video=""
      data-avatar-has-video={hasVideo}
      data-avatar-camera-enabled={isCameraEnabled}
      data-avatar-mirror={mirror}
    >
      {hasVideo &&
        localVideoTrackRef &&
        isTrackReference(localVideoTrackRef) && (
          <VideoTrack trackRef={localVideoTrackRef} />
        )}
    </div>
  );
}
