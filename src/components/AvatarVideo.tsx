'use client';

import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import { VideoTrack, isTrackReference } from '@livekit/components-react';
import { useAvatar } from '../hooks/useAvatar';
import { useAvatarSession } from '../hooks/useAvatarSession';
import type { UseAvatarReturn } from '../types';

export interface AvatarVideoState {
  hasVideo: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  trackRef: UseAvatarReturn['videoTrackRef'];
}

export interface AvatarVideoProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children?: (state: AvatarVideoState) => ReactNode;
}

export function AvatarVideo({ children, ...props }: AvatarVideoProps) {
  const session = useAvatarSession();
  const { videoTrackRef, isSpeaking, hasVideo } = useAvatar();

  const isConnecting = session.state === 'connecting';

  const state: AvatarVideoState = {
    hasVideo,
    isConnecting,
    isSpeaking,
    trackRef: videoTrackRef,
  };

  if (children) {
    return <>{children(state)}</>;
  }

  return (
    <div
      {...props}
      data-has-video={hasVideo}
      data-connecting={isConnecting}
      data-speaking={isSpeaking}
    >
      {hasVideo && videoTrackRef && isTrackReference(videoTrackRef) && (
        <VideoTrack trackRef={videoTrackRef} />
      )}
    </div>
  );
}
