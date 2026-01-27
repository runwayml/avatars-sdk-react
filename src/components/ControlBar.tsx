'use client';

import { TrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useAvatarSession } from '../hooks/useAvatarSession';
import { useLocalMedia } from '../hooks/useLocalMedia';

export interface ControlBarState {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  endCall: () => Promise<void>;
  isActive: boolean;
}

export interface ControlBarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
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
  const { isMicEnabled, isCameraEnabled, toggleMic, toggleCamera } =
    useLocalMedia();

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
          {microphoneIcon}
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
          {cameraIcon}
        </button>
      )}
      {showScreenShare && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          showIcon={false}
          data-control="screen-share"
          aria-label="Toggle screen share"
        >
          {screenShareIcon}
        </TrackToggle>
      )}
      {showEndCall && (
        <button
          type="button"
          onClick={session.end}
          data-control="end-call"
          aria-label="End call"
        >
          {phoneIcon}
        </button>
      )}
    </div>
  );
}

// Lucide icons (https://lucide.dev) - MIT License
const microphoneIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const cameraIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const screenShareIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

const phoneIcon = (
  <svg
    width="20"
    height="20"
    viewBox="8 14 24 12"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.8429 22.5693L11.4018 21.0986C11.2675 20.9626 11.1625 20.7995 11.0935 20.6197C11.0245 20.4399 10.9931 20.2474 11.0013 20.0545C11.0094 19.8616 11.0569 19.6726 11.1408 19.4995C11.2247 19.3265 11.343 19.1732 11.4883 19.0495C13.127 17.7049 15.0519 16.7714 17.1083 16.3239C19.0064 15.892 20.9744 15.892 22.8725 16.3239C24.9374 16.7743 26.8693 17.7147 28.5117 19.0691C28.6565 19.1924 28.7746 19.3451 28.8585 19.5176C28.9423 19.69 28.99 19.8784 28.9986 20.0707C29.0072 20.263 28.9764 20.455 28.9083 20.6345C28.8402 20.814 28.7362 20.9771 28.603 21.1133L27.1619 22.584C26.9311 22.8242 26.6226 22.9706 26.2938 22.9959C25.9651 23.0211 25.6385 22.9235 25.3751 22.7212C24.8531 22.3127 24.2875 21.9657 23.689 21.6869C23.4525 21.5774 23.2517 21.4009 23.1103 21.1785C22.969 20.9561 22.8931 20.697 22.8917 20.4319V19.1867C21.0053 18.6573 19.0139 18.6573 17.1275 19.1867V20.4319C17.1261 20.697 17.0502 20.9561 16.9089 21.1785C16.7676 21.4009 16.5667 21.5774 16.3302 21.6869C15.7317 21.9657 15.1661 22.3127 14.6442 22.7212C14.3779 22.9258 14.0473 23.0233 13.7152 22.9953C13.383 22.9673 13.0726 22.8156 12.8429 22.5693Z" />
  </svg>
);
