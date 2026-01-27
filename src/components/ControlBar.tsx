'use client';

import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import { TrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useAvatarSession } from '../hooks/useAvatarSession';

export interface ControlBarState {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  endCall: () => Promise<void>;
  isActive: boolean;
}

export interface ControlBarProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  showMicrophone?: boolean;
  showCamera?: boolean;
  showScreenShare?: boolean;
  showEndCall?: boolean;
  children?: (state: ControlBarState) => ReactNode;
}

export function ControlBar({
  children,
  showMicrophone = true,
  showCamera = true,
  showScreenShare = false,
  showEndCall = true,
  ...props
}: ControlBarProps) {
  const session = useAvatarSession();
  const { isMicEnabled, isCameraEnabled, toggleMic, toggleCamera } = useLocalMedia();

  const isActive = session.state === 'active';

  const state: ControlBarState = {
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    endCall: session.end,
    isActive,
  };

  if (children) {
    return <>{children(state)}</>;
  }

  if (!isActive) {
    return null;
  }

  return (
    <div {...props} data-active={isActive}>
      {showMicrophone && (
        <button
          type="button"
          onClick={toggleMic}
          data-control="microphone"
          data-enabled={isMicEnabled}
          aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          <MicrophoneIcon />
        </button>
      )}
      {showCamera && (
        <button
          type="button"
          onClick={toggleCamera}
          data-control="camera"
          data-enabled={isCameraEnabled}
          aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          <CameraIcon />
        </button>
      )}
      {showScreenShare && (
        <TrackToggle source={Track.Source.ScreenShare} showIcon={false} data-control="screen-share">
          <ScreenShareIcon />
        </TrackToggle>
      )}
      {showEndCall && (
        <button type="button" onClick={session.end} data-control="end-call" aria-label="End call">
          <span>Leave</span>
        </button>
      )}
    </div>
  );
}

function MicrophoneIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function ScreenShareIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
