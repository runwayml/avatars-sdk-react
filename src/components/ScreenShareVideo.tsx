'use client';

import {
  isTrackReference,
  type TrackReferenceOrPlaceholder,
  useLocalParticipant,
  useTracks,
  VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface ScreenShareVideoState {
  isSharing: boolean;
  trackRef: TrackReferenceOrPlaceholder | null;
}

export interface ScreenShareVideoProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children?: (state: ScreenShareVideoState) => ReactNode;
}

/**
 * Component for displaying local screen share video.
 *
 * Must be used within an AvatarSession or AvatarCall component.
 */
export function ScreenShareVideo({
  children,
  ...props
}: ScreenShareVideoProps) {
  const { localParticipant } = useLocalParticipant();

  const tracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  const localIdentity = localParticipant?.identity;

  const screenShareTrackRef =
    tracks.find(
      (trackRef) =>
        trackRef.participant.identity === localIdentity &&
        trackRef.source === Track.Source.ScreenShare,
    ) ?? null;

  const isSharing =
    screenShareTrackRef !== null && isTrackReference(screenShareTrackRef);

  const state: ScreenShareVideoState = {
    isSharing,
    trackRef: screenShareTrackRef,
  };

  if (children) {
    return <>{children(state)}</>;
  }

  if (!isSharing) {
    return null;
  }

  return (
    <div {...props} data-avatar-screen-share="" data-avatar-sharing={isSharing}>
      {screenShareTrackRef && isTrackReference(screenShareTrackRef) && (
        <VideoTrack trackRef={screenShareTrackRef} />
      )}
    </div>
  );
}
