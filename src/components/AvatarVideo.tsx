'use client';

import { isTrackReference, VideoTrack } from '@livekit/components-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { type AvatarStatus, useAvatarStatus } from '../hooks/useAvatarStatus';

/** Subset of AvatarStatus relevant to the video display */
export type AvatarVideoStatus = Extract<
  AvatarStatus,
  { status: 'connecting' } | { status: 'waiting' } | { status: 'ready' }
>;

export interface AvatarVideoProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children?: (status: AvatarVideoStatus) => ReactNode;
}

export function AvatarVideo({ children, ...props }: AvatarVideoProps) {
  const avatar = useAvatarStatus();

  const videoStatus: AvatarVideoStatus =
    avatar.status === 'ready'
      ? avatar
      : avatar.status === 'connecting'
        ? { status: 'connecting' }
        : { status: 'waiting' };

  if (children) {
    return <>{children(videoStatus)}</>;
  }

  return (
    <div {...props} data-avatar-video="" data-status={videoStatus.status}>
      {videoStatus.status === 'ready' &&
        isTrackReference(videoStatus.videoTrackRef) && (
          <VideoTrack trackRef={videoStatus.videoTrackRef} />
        )}
    </div>
  );
}
