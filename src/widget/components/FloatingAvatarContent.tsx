'use client';

/**
 * FloatingAvatarContent Component
 *
 * Content rendered inside the AvatarSession context.
 * Shows avatar video with optional speech bubble overlay.
 */

import { useEffect } from 'react';
import { VideoTrack, isTrackReference } from '@livekit/components-react';
import { useAvatarSession } from '../../hooks/useAvatarSession';
import { useAvatar } from '../../hooks/useAvatar';
import { useWidgetContext } from '../WidgetProvider';

export function FloatingAvatarContent() {
  const session = useAvatarSession();
  const { videoTrackRef, hasVideo } = useAvatar();
  const { setConnectionState } = useWidgetContext();

  // Sync LiveKit session state with widget state
  useEffect(() => {
    if (session.state === 'connecting') {
      setConnectionState('connecting');
    } else if (session.state === 'active') {
      setConnectionState('active');
    } else if (session.state === 'error') {
      setConnectionState('error');
    }
  }, [session.state, setConnectionState]);

  const isConnecting = session.state === 'connecting';
  const showVideo = hasVideo && videoTrackRef && isTrackReference(videoTrackRef);

  // Show loading state while connecting OR while waiting for video
  const showLoading = isConnecting || !showVideo;

  return (
    <>
      {/* Loading state */}
      {showLoading && (
        <div className="widget-avatar-connecting">
          <div className="widget-spinner" />
          <span className="widget-connection-text">Connecting...</span>
        </div>
      )}

      {/* Avatar video - fills the window */}
      {showVideo && (
        <VideoTrack trackRef={videoTrackRef} />
      )}

    </>
  );
}
