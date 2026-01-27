'use client';

import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import {
  useLocalParticipant,
  useTracks,
  VideoTrack,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

export interface ScreenShareVideoState {
  isSharing: boolean;
  trackRef: TrackReferenceOrPlaceholder | null;
}

export interface ScreenShareVideoProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children?: (state: ScreenShareVideoState) => ReactNode;
}

export function ScreenShareVideo({ children, ...props }: ScreenShareVideoProps) {
  const { localParticipant } = useLocalParticipant();

  const tracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const localIdentity = localParticipant?.identity;

  const screenShareTrackRef = tracks.find(
    (trackRef) =>
      trackRef.participant.identity === localIdentity &&
      trackRef.source === Track.Source.ScreenShare
  ) ?? null;

  const isSharing = screenShareTrackRef !== null && isTrackReference(screenShareTrackRef);

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
    <div {...props} data-sharing={isSharing}>
      {screenShareTrackRef && isTrackReference(screenShareTrackRef) && (
        <VideoTrack trackRef={screenShareTrackRef} />
      )}
    </div>
  );
}
