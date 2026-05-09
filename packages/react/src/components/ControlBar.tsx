'use client';

import { useCallback } from 'react';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useAvatarSessionContext } from './AvatarSession';

export function ControlBar({
  showScreenShare = false,
}: {
  showScreenShare?: boolean;
}) {
  const { end } = useAvatarSessionContext();
  const media = useLocalMedia();

  const handleEnd = useCallback(() => {
    end();
  }, [end]);

  return (
    <div data-avatar-control-bar="">
      <button
        type="button"
        onClick={media.toggleMic}
        data-enabled={media.isMicEnabled}
        aria-label={media.isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        <MicIcon enabled={media.isMicEnabled} />
      </button>

      <button
        type="button"
        onClick={media.toggleCamera}
        data-enabled={media.isCameraEnabled}
        aria-label={media.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        <CameraIcon enabled={media.isCameraEnabled} />
      </button>

      {showScreenShare && (
        <button
          type="button"
          onClick={media.toggleScreenShare}
          data-enabled={media.isScreenShareEnabled}
          aria-label={
            media.isScreenShareEnabled
              ? 'Stop screen share'
              : 'Share screen'
          }
        >
          <ScreenShareIcon enabled={media.isScreenShareEnabled} />
        </button>
      )}

      <button
        type="button"
        onClick={handleEnd}
        data-end-call=""
        aria-label="End call"
      >
        <EndCallIcon />
      </button>
    </div>
  );
}

function MicIcon({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5.29" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function CameraIcon({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M21 21H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3" />
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416v-8.13a.5.5 0 0 0-.752-.432L16 10.5" />
    </svg>
  );
}

function ScreenShareIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={enabled ? '#3b82f6' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="m17 8 5-5" />
      <path d="M17 3h5v5" />
    </svg>
  );
}

function EndCallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
      <line x1="23" x2="1" y1="1" y2="23" />
    </svg>
  );
}
