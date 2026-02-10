'use client';

import {
  isTrackReference,
  type TrackReferenceOrPlaceholder,
  useLocalParticipant,
  useMaybeRoomContext,
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

export function ScreenShareVideo({
  children,
  ...props
}: ScreenShareVideoProps) {
  const room = useMaybeRoomContext();
  const hasRoomContext = room !== undefined;

  const { localParticipant } = useLocalParticipant({ room });

  const tracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false, room: hasRoomContext ? room : undefined },
  );

  const localIdentity = localParticipant?.identity;

  const screenShareTrackRef = hasRoomContext
    ? (tracks.find(
        (trackRef) =>
          trackRef.participant.identity === localIdentity &&
          trackRef.source === Track.Source.ScreenShare,
      ) ?? null)
    : null;

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
